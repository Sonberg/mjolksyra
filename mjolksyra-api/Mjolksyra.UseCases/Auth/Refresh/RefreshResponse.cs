using Mjolksyra.UseCases.Common.Contracts;

namespace Mjolksyra.UseCases.Auth.Refresh;

public class RefreshResponse : ITokenResponse
{
    public bool IsSuccessful { get; set; }

    public string? AccessToken { get; set; }

    public string? RefreshToken { get; set; }

    public DateTimeOffset? RefreshTokenExpiresAt { get; set; }
}