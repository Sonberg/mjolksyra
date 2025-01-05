using MediatR;

namespace Mjolksyra.UseCases.Auth.Register;

public class RegisterCommand : IRequest<RegisterResponse>
{
    public required string GivenName { get; set; }

    public required string FamilyName { get; set; }

    public required string Email { get; set; }

    public required string Password { get; set; }

    public required string ConfirmPassword { get; set; }
}