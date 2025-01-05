namespace Mjolksyra.Domain.Database.Models;

public record RefreshToken
{
    public static TimeSpan DefaultExpiration = TimeSpan.FromDays(31);

    public Guid Id { get; set; }

    public Guid? UserId { get; set; }

    public required string Token { get; set; }
    
    public required DateTimeOffset ExpiresAt { get; set; }

    public required DateTimeOffset CreatedAt { get; set; }
}