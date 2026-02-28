using MediatR;

namespace Mjolksyra.UseCases.Coaches.EnsureCoachPlatformSubscription;

public sealed record EnsureCoachPlatformSubscriptionCommand(Guid UserId) : IRequest;
