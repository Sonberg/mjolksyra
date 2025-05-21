namespace Mjolksyra.Domain;

public static class EmailNormalizer
{
    public static string Normalize(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return email;

        email = email.Trim().ToLowerInvariant();

        var parts = email.Split('@');
        if (parts.Length != 2)
            return email; // Invalid email, return as-is

        var localPart = parts[0];
        var domain = parts[1];

        var plusIndex = localPart.IndexOf('+');
        if (plusIndex >= 0)
        {
            localPart = localPart[..plusIndex];
        }

        return $"{localPart}@{domain}";
    }
}