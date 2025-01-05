using Mjolksyra.UseCases.Common.Contracts;

namespace Mjolksyra.UseCases.Auth.Register;

public class RegisterResponse : ITokenResponse
{
    public bool IsSuccessful { get; set; }

    public string? Error { get; set; }

    public string? RefreshToken { get; set; }

    public DateTimeOffset? RefreshTokenExpiresAt { get; set; }

    public string? AccessToken { get; set; }
}