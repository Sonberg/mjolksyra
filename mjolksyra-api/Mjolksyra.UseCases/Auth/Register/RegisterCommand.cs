using MediatR;

namespace Mjolksyra.UseCases.Auth.Register;

public class RegisterCommand : IRequest<RegisterResponse>
{
    public required string FirstName { get; set; }

    public required string LastName { get; set; }

    public required string Email { get; set; }

    public required string Password { get; set; }

    public required string ConfirmPassword { get; set; }
}