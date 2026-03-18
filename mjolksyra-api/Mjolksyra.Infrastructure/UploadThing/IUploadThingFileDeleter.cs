namespace Mjolksyra.Infrastructure.UploadThing;

public interface IUploadThingFileDeleter
{
    Task DeleteAsync(IEnumerable<string> fileKeys, CancellationToken cancellationToken);
}
