namespace Mjolksyra.Infrastructure.R2;

public static class R2UrlHelper
{
    /// <summary>
    /// Extracts the R2 object key from a public URL.
    /// e.g. "https://media.example.com/workouts/abc.mp4?raw=1" → "workouts/abc.mp4"
    /// Returns empty string if the URL does not match the expected base URL.
    /// </summary>
    public static string ExtractKey(string url, string publicBaseUrl)
    {
        try
        {
            // Strip query string
            var withoutQuery = url.Contains('?') ? url[..url.IndexOf('?')] : url;

            var baseUrl = publicBaseUrl.TrimEnd('/');
            if (!withoutQuery.StartsWith(baseUrl, StringComparison.OrdinalIgnoreCase))
                return string.Empty;

            var key = withoutQuery[(baseUrl.Length)..].TrimStart('/');
            return key;
        }
        catch
        {
            return string.Empty;
        }
    }
}
