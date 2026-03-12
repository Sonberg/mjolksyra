using MediatR;

namespace Mjolksyra.UseCases.Trainees.TriggerMissingSubscriptionsForUser;

public record TriggerMissingSubscriptionsForUserCommand(Guid UserId) : IRequest;
