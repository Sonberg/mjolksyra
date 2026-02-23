using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Stripe;

namespace Mjolksyra.UseCases.Trainees.CancelTrainee;

public class CancelTraineeRequest : IRequest
{
    public required Guid TraineeId { get; set; }

    public required Guid UserId { get; set; }
}

public class CancelTraineeRequestHandler : IRequestHandler<CancelTraineeRequest>
{
    private readonly ITraineeRepository _traineeRepository;

    private readonly IStripeClient _stripeClient;

    public CancelTraineeRequestHandler(ITraineeRepository traineeRepository, IStripeClient stripeClient)
    {
        _traineeRepository = traineeRepository;
        _stripeClient = stripeClient;
    }

    public async Task Handle(CancelTraineeRequest request, CancellationToken cancellationToken)
    {
        var trainee = await _traineeRepository.GetById(request.TraineeId, cancellationToken);
        if (trainee is null) return;

        var canCancel = trainee.CoachUserId == request.UserId || trainee.AthleteUserId == request.UserId;
        if (!canCancel) return;
        if (trainee.Status == TraineeStatus.Cancelled) return;

        if (trainee.StripeSubscriptionId is not null)
        {
            var subscriptionService = new SubscriptionService(_stripeClient);
            await subscriptionService.CancelAsync(trainee.StripeSubscriptionId, cancellationToken: cancellationToken);
            trainee.StripeSubscriptionId = null;
        }

        trainee.Status = TraineeStatus.Cancelled;
        trainee.DeletedAt = DateTimeOffset.UtcNow;

        await _traineeRepository.Update(trainee, cancellationToken);
    }
}
