using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.Users.HandleClerkUserCreated;

public class HandleClerkUserCreatedCommand : IRequest
{
    public required string ClerkUserId { get; set; }

    public required string Email { get; set; }

    public string? GivenName { get; set; }

    public string? FamilyName { get; set; }
}

public class HandleClerkUserCreatedCommandHandler : IRequestHandler<HandleClerkUserCreatedCommand>
{
    private readonly IUserRepository _userRepository;

    public HandleClerkUserCreatedCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task Handle(HandleClerkUserCreatedCommand request, CancellationToken cancellationToken)
    {
        var existing = await _userRepository.GetByClerkId(request.ClerkUserId, cancellationToken);

        if (existing is not null)
        {
            return;
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            ClerkUserId = request.ClerkUserId,
            GivenName = request.GivenName,
            FamilyName = request.FamilyName,
            Email = Email.From(request.Email),
            CreatedAt = DateTimeOffset.UtcNow,
        };

        await _userRepository.Create(user, cancellationToken);
    }
}
