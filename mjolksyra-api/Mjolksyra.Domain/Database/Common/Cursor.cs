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
        return Parse<Cursor>(str);
    }

    public override string ToString()
    {
        var str = JsonSerializer.Serialize(this);
        var bytes = System.Text.Encoding.UTF8.GetBytes(str);

        return Convert.ToBase64String(bytes);
    }

    public static Cursor? Parse(string? str)
    {
        return Parse<Cursor>(str);
    }

    public static T? Parse<T>(string? str) where T : Cursor
    {
        if (string.IsNullOrEmpty(str))
        {
            return null;
        }

        var bytes = Convert.FromBase64String(str);
        var json = System.Text.Encoding.UTF8.GetString(bytes);
        var res = JsonSerializer.Deserialize<T>(json);

        return res ?? throw new Exception("Conversion to Cursor failed");
    }

    public static TCursor? From<T, TCursor>(List<T> response, TCursor lastCursor) where T : IDocument where TCursor : Cursor
    {
        if (response.Count is 0)
        {
            return null;
        }

        if (response.Count != lastCursor.Size)
        {
            return null;
        }

        return lastCursor with
        {
            Page = lastCursor.Page + 1
        };
    }
}