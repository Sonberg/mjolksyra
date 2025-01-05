namespace Mjolksyra.Domain.Database.Models;

public class User
{
    public Guid Id { get; set; }

    public string? FirstName { get; set; }

    public string? LastName { get; set; }

    public required string Email { get; set; }

    public required string Password { get; set; }

    public required string PasswordSalt { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}