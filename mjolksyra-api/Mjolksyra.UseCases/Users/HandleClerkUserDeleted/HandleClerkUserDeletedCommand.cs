using MediatR;
using Microsoft.Extensions.Logging;
using Mjolksyra.Domain.Database;

namespace Mjolksyra.UseCases.Users.HandleClerkUserDeleted;

public class HandleClerkUserDeletedCommand : IRequest
{
    public required string ClerkUserId { get; set; }
}

public class HandleClerkUserDeletedCommandHandler : IRequestHandler<HandleClerkUserDeletedCommand>
{
    private readonly IUserRepository _userRepository;
    private readonly ILogger<HandleClerkUserDeletedCommandHandler> _logger;

    public HandleClerkUserDeletedCommandHandler(
        IUserRepository userRepository,
        ILogger<HandleClerkUserDeletedCommandHandler> logger)
    {
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task Handle(HandleClerkUserDeletedCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByClerkId(request.ClerkUserId, cancellationToken);

        if (user is null)
        {
            _logger.LogWarning("Received user.deleted for unknown Clerk user {ClerkUserId}", request.ClerkUserId);
            return;
        }

        user.DeletedAt = DateTimeOffset.UtcNow;

        await _userRepository.Update(user, cancellationToken);
    }
}
