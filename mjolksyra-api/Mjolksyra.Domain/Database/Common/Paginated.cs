namespace Mjolksyra.Domain.Database.Common;

public class Paginated<T>
{
    public ICollection<T> Data { get; init; } = [];

    public Cursor? Cursor { get; init; }
}