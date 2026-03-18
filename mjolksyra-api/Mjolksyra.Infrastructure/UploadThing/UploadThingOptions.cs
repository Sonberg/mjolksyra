using System.ComponentModel.DataAnnotations;
using System.Text;
using System.Text.Json;

namespace Mjolksyra.Infrastructure.UploadThing;

public class UploadThingOptions
{
    public const string SectionName = "UploadThing";

    /// <summary>
    /// v6 API key (sk_live_xxx). Used by the file deleter and as fallback.
    /// </summary>
    public string? SecretKey { get; set; }

    /// <summary>
    /// v7 base64-encoded JSON token (from UploadThing dashboard → API Keys → V7 tab).
    /// Contains apiKey, appId, and regions. Required for server-side uploads.
    /// </summary>
    public string? Token { get; set; }

    /// <summary>
    /// Returns the API key, extracted from Token if available, otherwise SecretKey.
    /// </summary>
    public string GetApiKey()
    {
        if (Token is not null)
        {
            var decoded = DecodeToken();
            return decoded.ApiKey;
        }
        return SecretKey ?? throw new InvalidOperationException(
            "UploadThing: neither Token nor SecretKey is configured.");
    }

    public UploadThingTokenData DecodeToken()
    {
        if (Token is null)
            throw new InvalidOperationException(
                "UploadThing: Token is not configured. Get it from the UploadThing dashboard → API Keys → V7 tab.");

        try
        {
            var json = Encoding.UTF8.GetString(Convert.FromBase64String(Token));
            var doc = JsonSerializer.Deserialize<UploadThingTokenData>(json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
                ?? throw new InvalidOperationException("Token decoded to null.");
            return doc;
        }
        catch (Exception ex) when (ex is not InvalidOperationException)
        {
            throw new InvalidOperationException(
                "UploadThing: Token is not a valid base64-encoded JSON object. " +
                "Expected: { apiKey, appId, regions }.", ex);
        }
    }
}

public record UploadThingTokenData
{
    public required string ApiKey { get; init; }
    public required string AppId { get; init; }
    public required string[] Regions { get; init; }
    public string? IngestHost { get; init; }
}
