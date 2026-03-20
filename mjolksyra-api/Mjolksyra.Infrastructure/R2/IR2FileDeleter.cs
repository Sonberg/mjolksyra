namespace Mjolksyra.Infrastructure.R2;

public interface IR2FileDeleter
{
    Task DeleteAsync(IEnumerable<string> keys, CancellationToken cancellationToken);
}
