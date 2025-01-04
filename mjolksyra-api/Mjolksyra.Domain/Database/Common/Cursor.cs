using System.Text.Json;

namespace Mjolksyra.Domain.Database.Common;

public record Cursor
{
    public required Guid LastId { get; init; }

    public required int Limit { get; init; }

    public static implicit operator string?(Cursor? cursor)
    {
        return cursor?.ToString();
    }

    public static implicit operator Cursor?(string str)
    {
        return Parse(str);
    }

    public override string ToString()
    {
        var str = JsonSerializer.Serialize(this);
        var bytes = System.Text.Encoding.UTF8.GetBytes(str);

        return Convert.ToBase64String(bytes);
    }

    public static Cursor? Parse(string str)
    {
        if (string.IsNullOrEmpty(str))
        {
            return null;
        }

        var bytes = Convert.FromBase64String(str);
        var json = System.Text.Encoding.UTF8.GetString(bytes);
        var res = JsonSerializer.Deserialize<Cursor>(json);

        return res ?? throw new Exception("Conversion to Cursor failed");
    }

    public static Cursor? From<T>(List<T> response, int limit) where T : IDocument
    {
        if (response.Count < limit)
        {
            return null;
        }

        if (response.LastOrDefault() is not { } last)
        {
            return null;
        }

        return new Cursor
        {
            Limit = limit,
            LastId = last.Id
        };
    }
}