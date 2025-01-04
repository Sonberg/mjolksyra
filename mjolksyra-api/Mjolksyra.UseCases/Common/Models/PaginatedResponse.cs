namespace Mjolksyra.UseCases.Common.Models;

public class PaginatedResponse<T>
{
    public required ICollection<T> Data { get; set; }

    public required string? Next { get; set; }
}