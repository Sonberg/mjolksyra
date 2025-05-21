namespace Mjolksyra.Domain.Database.Models;

public class Email
{
    public required string Normalized { get; set; }

    public required string Value { get; set; }
    
    public static implicit operator string(Email email) => email.Value;

    public static Email From(string email) => new Email
    {
        Value = email,
        Normalized = EmailNormalizer.Normalize(email)
    };
}