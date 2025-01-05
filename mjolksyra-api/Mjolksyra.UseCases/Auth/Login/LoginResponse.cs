using Mjolksyra.UseCases.Common.Contracts;

namespace Mjolksyra.UseCases.Auth.Login;

public class LoginResponse : ITokenResponse
{
    public required bool IsSuccessful { get; set; }

    public string? RefreshToken { get; set; }

    public DateTimeOffset? RefreshTokenExpiresAt { get; set; }

    public string? AccessToken { get; set; }
}