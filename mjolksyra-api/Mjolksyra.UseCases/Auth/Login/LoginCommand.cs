using MediatR;

namespace Mjolksyra.UseCases.Auth.Login;

public class LoginCommand : IRequest<LoginResponse>
{
    public required string Email { get; set; }

    public required string Password { get; set; }
}