using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Messaging;

namespace Mjolksyra.UseCases.Trainees.TriggerMissingSubscriptionsForUser;

public class TriggerMissingSubscriptionsForUserCommandHandler
    : IRequestHandler<TriggerMissingSubscriptionsForUserCommand>
{
    private readonly ITraineeRepository _traineeRepository;
    private readonly ITraineeSubscriptionSyncPublisher _syncPublisher;

    public TriggerMissingSubscriptionsForUserCommandHandler(
        ITraineeRepository traineeRepository,
        ITraineeSubscriptionSyncPublisher syncPublisher)
    {
        _traineeRepository = traineeRepository;
        _syncPublisher = syncPublisher;
    }

    public async Task Handle(TriggerMissingSubscriptionsForUserCommand request, CancellationToken cancellationToken)
    {
        var trainees = await _traineeRepository.Get(request.UserId, cancellationToken);
        foreach (var trainee in trainees.Where(t => t.StripeSubscriptionId is null && t.Cost.Amount > 0))
        {
            await _syncPublisher.Publish(new TraineeSubscriptionSyncMessage
            {
                TraineeId = trainee.Id,
                BillingMode = TraineeSubscriptionSyncBillingMode.ChargeNow
            }, cancellationToken);
        }
    }
}
