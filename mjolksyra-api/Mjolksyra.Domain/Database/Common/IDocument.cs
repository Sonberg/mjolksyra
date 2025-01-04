namespace Mjolksyra.Domain.Database.Common;

public interface IDocument
{
    Guid Id { get; }

    DateTimeOffset CreatedAt { get; }
}