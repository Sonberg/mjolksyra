using MediatR;
using Microsoft.Extensions.Logging;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.Users.HandleClerkUserUpdated;

public class HandleClerkUserUpdatedCommand : IRequest
{
    public required string ClerkUserId { get; set; }

    public required string Email { get; set; }

    public string? GivenName { get; set; }

    public string? FamilyName { get; set; }
}

public class HandleClerkUserUpdatedCommandHandler : IRequestHandler<HandleClerkUserUpdatedCommand>
{
    private readonly IUserRepository _userRepository;
    private readonly ILogger<HandleClerkUserUpdatedCommandHandler> _logger;

    public HandleClerkUserUpdatedCommandHandler(
        IUserRepository userRepository,
        ILogger<HandleClerkUserUpdatedCommandHandler> logger)
    {
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task Handle(HandleClerkUserUpdatedCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByClerkId(request.ClerkUserId, cancellationToken);

        if (user is null)
        {
            _logger.LogWarning("Received user.updated for unknown Clerk user {ClerkUserId}", request.ClerkUserId);
            return;
        }

        user.GivenName = request.GivenName;
        user.FamilyName = request.FamilyName;
        user.Email = Email.From(request.Email);

        await _userRepository.Update(user, cancellationToken);
    }
}
