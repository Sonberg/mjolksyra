using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.Users.EnsureUser;

public class EnsureUserCommand : IRequest<EnsureUserResponse>
{
    public required string ClerkUserId { get; set; }

    public required string Email { get; set; }

    public string? GivenName { get; set; }

    public string? FamilyName { get; set; }
}

public class EnsureUserResponse
{
    public Guid UserId { get; set; }
}

public class EnsureUserCommandHandler : IRequestHandler<EnsureUserCommand, EnsureUserResponse>
{
    private readonly IUserRepository _userRepository;

    public EnsureUserCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<EnsureUserResponse> Handle(EnsureUserCommand request, CancellationToken cancellationToken)
    {
        var existing = await _userRepository.GetByClerkId(request.ClerkUserId, cancellationToken);

        if (existing is not null)
        {
            return new EnsureUserResponse { UserId = existing.Id };
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

        return new EnsureUserResponse { UserId = user.Id };
    }
}
