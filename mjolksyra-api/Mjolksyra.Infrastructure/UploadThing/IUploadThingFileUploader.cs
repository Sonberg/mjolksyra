namespace Mjolksyra.Infrastructure.UploadThing;

public interface IUploadThingFileUploader
{
    /// <summary>
    /// Uploads a file stream to UploadThing and returns the CDN URL.
    /// </summary>
    /// <param name="stream">File content.</param>
    /// <param name="fileName">File name including extension (e.g. "photo.webp").</param>
    /// <param name="contentType">MIME type (e.g. "image/webp").</param>
    /// <param name="cancellationToken"></param>
    /// <returns>The public CDN URL for the uploaded file.</returns>
    Task<string> UploadAsync(
        Stream stream,
        string fileName,
        string contentType,
        CancellationToken cancellationToken);
}
