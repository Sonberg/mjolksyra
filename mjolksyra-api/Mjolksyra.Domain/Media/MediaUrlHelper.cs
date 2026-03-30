namespace Mjolksyra.Domain.Media;

public static class MediaUrlHelper
{
    public static bool IsVideoUrl(string url)
    {
        try
        {
            var uri = new Uri(url);
            // Legacy UploadThing URLs tagged with ?ct=video
            if (uri.Query.Contains("ct=video")) return true;
            // R2 URLs: check extension on path
            var path = uri.AbsolutePath;
            return path.EndsWith(".mp4") || path.EndsWith(".mov") || path.EndsWith(".webm");
        }
        catch
        {
            var path = url.Contains('?') ? url[..url.IndexOf('?')] : url;
            return path.EndsWith(".mp4") || path.EndsWith(".mov") || path.EndsWith(".webm");
        }
    }
}
