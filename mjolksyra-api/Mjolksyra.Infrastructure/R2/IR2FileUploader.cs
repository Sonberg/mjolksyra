namespace Mjolksyra.Infrastructure.R2;

public interface IR2FileUploader
{
    /// <summary>
    /// Uploads a stream to R2 under the given key and returns the public URL.
    /// </summary>
    Task<string> UploadAsync(Stream stream, string key, string contentType, CancellationToken cancellationToken);
}
