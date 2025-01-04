using System.Text.Json;

namespace Mjolksyra.Domain.Database.Common;

public record Cursor
{
    public required int Size { get; init; }

    public required int Page { get; init; }

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

    public static Cursor? From<T>(List<T> response, Cursor lastCursor) where T : IDocument
    {
        if (response.Count is 0)
        {
            return null;
        }

        return lastCursor with
        {
            Page = lastCursor.Page + 1
        };
    }
}