namespace Mjolksyra.UseCases.Common.Contracts;

public interface ITokenResponse
{
    public string? RefreshToken { get; }

    public DateTimeOffset? RefreshTokenExpiresAt { get; }

    public string? AccessToken { get; }
}