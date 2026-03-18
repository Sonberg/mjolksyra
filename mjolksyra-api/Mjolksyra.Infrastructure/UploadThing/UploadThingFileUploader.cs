using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Sqids;

namespace Mjolksyra.Infrastructure.UploadThing;

/// <summary>
/// Uploads files to UploadThing using the v7 ingest flow (no round-trip to UploadThing API).
/// Requires UploadThing:Token (base64 JSON) from the dashboard → API Keys → V7 tab.
///
/// Flow:
///   1. Decode token → apiKey, appId, regions
///   2. Generate file key (Sqids + DJB2, matches the TS SDK)
///   3. Build HMAC-SHA256 signed URL pointing to ingest server
///   4. PUT file as multipart/form-data
///   5. Return ufsUrl from the JSON response
/// </summary>
public class UploadThingFileUploader(
    IHttpClientFactory httpClientFactory,
    IOptions<UploadThingOptions> options,
    ILogger<UploadThingFileUploader> logger) : IUploadThingFileUploader
{
    // Sqids default alphabet (same as the JS sqids package)
    private const string DefaultAlphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    public async Task<string> UploadAsync(
        Stream stream,
        string fileName,
        string contentType,
        CancellationToken cancellationToken)
    {
        var tokenData = options.Value.DecodeToken();

        var tempPath = Path.GetTempFileName();

        try
        {
            await using (var tempWriteStream = File.Open(tempPath, FileMode.Create, FileAccess.Write, FileShare.None))
            {
                await stream.CopyToAsync(tempWriteStream, cancellationToken);
            }

            await using var uploadStream = File.Open(tempPath, FileMode.Open, FileAccess.Read, FileShare.Read);
            var fileSize = uploadStream.Length;
            var key = GenerateKey(fileName, fileSize, contentType);
            var ingestBase = GetIngestBase(tokenData);
            var signedUrl = BuildSignedUrl(ingestBase, key, tokenData, fileName, fileSize, contentType);

            var httpClient = httpClientFactory.CreateClient();
            using var form = new MultipartFormDataContent();
            var fileContent = new StreamContent(uploadStream);
            fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(contentType);
            form.Add(fileContent, "file", fileName);

            using var request = new HttpRequestMessage(HttpMethod.Put, signedUrl) { Content = form };
            request.Headers.Add("Range", "bytes=0-");
            request.Headers.Add("x-uploadthing-version", "7.7.0");

            using var response = await httpClient.SendAsync(request, cancellationToken);
            var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
                throw new InvalidOperationException(
                    $"UploadThing ingest PUT failed ({response.StatusCode}): {responseBody}");

            using var doc = JsonDocument.Parse(responseBody);
            var ufsUrl = doc.RootElement.TryGetProperty("ufsUrl", out var ufs)
                ? ufs.GetString()
                : doc.RootElement.TryGetProperty("url", out var url)
                    ? url.GetString()
                    : null;

            if (ufsUrl is null)
                throw new InvalidOperationException(
                    $"UploadThing ingest response missing ufsUrl. Response: {responseBody}");

            logger.LogInformation("Uploaded {FileName} to UploadThing: {Url}", fileName, ufsUrl);
            return ufsUrl;
        }
        finally
        {
            try
            {
                File.Delete(tempPath);
            }
            catch
            {
                // no-op
            }
        }
    }

    // -------------------------------------------------------------------------
    // Key generation — mirrors @uploadthing/shared generateKey()
    // Uses Effect Hash.string (DJB2 variant) and the Sqids library.
    // -------------------------------------------------------------------------

    private string GenerateKey(string fileName, long fileSize, string contentType)
    {
        var hashParts = JsonSerializer.Serialize(new object[]
        {
            fileName, fileSize, contentType,
            DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(), // lastModified placeholder
            DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()  // Date.now() equivalent
        });

        var appId = options.Value.DecodeToken().AppId;
        var alphabet = Shuffle(DefaultAlphabet, appId);

        var fileSeedHash = ToSqidsNumber(EffectHashString(hashParts));
        var appIdHash = ToSqidsNumber(EffectHashString(appId));

        var fileSeedEncoder = new SqidsEncoder<long>(new SqidsOptions
        {
            Alphabet = alphabet,
            MinLength = 36,
        });
        var appIdEncoder = new SqidsEncoder<long>(new SqidsOptions
        {
            Alphabet = alphabet,
            MinLength = 12,
        });

        var encodedFileSeed = fileSeedEncoder.Encode(fileSeedHash);
        var encodedAppId = appIdEncoder.Encode(appIdHash);

        return encodedAppId + encodedFileSeed;
    }

    private static long ToSqidsNumber(int value) => unchecked((long)(uint)value);

    /// <summary>
    /// Replicates Effect's Hash.string — DJB2 variant iterating backwards.
    /// Returns a non-negative int (optimize() clears the sign bit).
    /// </summary>
    private static int EffectHashString(string str)
    {
        int h = 5381;
        for (int i = str.Length - 1; i >= 0; i--)
            h = unchecked((int)((long)h * 33L)) ^ str[i];
        return Optimize(h);
    }

    /// <summary>optimize(n) = (n & 0xbfffffff) | ((n >>> 1) & 0x40000000)</summary>
    private static int Optimize(int n) =>
        unchecked((n & (int)0xbfffffff) | ((n >>> 1) & 0x40000000));

    /// <summary>
    /// Shuffles the alphabet string using seed — mirrors the shuffle() in @uploadthing/shared.
    /// Uses Fisher-Yates-style swaps with j = ((Hash.string(seed) % (i+1)) + i) % len.
    /// </summary>
    private static string Shuffle(string str, string seed)
    {
        var chars = str.ToCharArray();
        var seedNum = EffectHashString(seed);
        for (int i = 0; i < chars.Length; i++)
        {
            int j = ((seedNum % (i + 1)) + i) % chars.Length;
            (chars[i], chars[j]) = (chars[j], chars[i]);
        }
        return new string(chars);
    }

    // -------------------------------------------------------------------------
    // URL signing — mirrors generateSignedURL() in @uploadthing/shared
    // -------------------------------------------------------------------------

    private static string BuildSignedUrl(
        string ingestBase,
        string key,
        UploadThingTokenData token,
        string fileName,
        long fileSize,
        string contentType)
    {
        // TTL: 1 hour (default in the TS SDK)
        var expires = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() + 60 * 60 * 1000;

        // Build the URL with query parameters, matching the TS URLSearchParams double-encoding:
        //   encodeURIComponent(value) → then URLSearchParams.toString() re-encodes '%' as '%25'
        var sb = new StringBuilder();
        sb.Append(ingestBase).Append('/').Append(key);
        sb.Append('?');
        sb.Append("expires=").Append(expires);
        AppendParam(sb, "x-ut-identifier", token.AppId);
        AppendParam(sb, "x-ut-file-name", fileName);
        AppendParam(sb, "x-ut-file-size", fileSize.ToString());
        AppendParam(sb, "x-ut-file-type", contentType);
        AppendParam(sb, "x-ut-content-disposition", "inline");

        var urlToSign = sb.ToString();
        var signature = SignHmacSha256(urlToSign, token.ApiKey);
        return urlToSign + "&signature=hmac-sha256%3D" + signature;
    }

    /// <summary>
    /// Appends a query parameter with double-encoding to match URLSearchParams behaviour:
    /// value → encodeURIComponent(value) → URLSearchParams re-encodes → double-encoded.
    /// </summary>
    private static void AppendParam(StringBuilder sb, string key, string value)
    {
        var once = Uri.EscapeDataString(value);     // encodeURIComponent(value)
        var twice = Uri.EscapeDataString(once);      // URLSearchParams re-encodes '%'
        sb.Append('&').Append(key).Append('=').Append(twice);
    }

    private static string SignHmacSha256(string payload, string secret)
    {
        var keyBytes = Encoding.UTF8.GetBytes(secret);
        var payloadBytes = Encoding.UTF8.GetBytes(payload);
        using var hmac = new HMACSHA256(keyBytes);
        var hash = hmac.ComputeHash(payloadBytes);
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    private static string GetIngestBase(UploadThingTokenData token)
    {
        var host = token.IngestHost ?? "ingest.uploadthing.com";
        var region = token.Regions.FirstOrDefault() ?? "sea1";
        return $"https://{region}.{host}";
    }
}
