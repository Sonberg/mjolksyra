using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.Coaches.ReserveCredits;
using OneOf;

namespace Mjolksyra.UseCases.Trainees.RebuildTraineeInsights;

public class RebuildTraineeInsightsCommandHandler(
    IMediator mediator,
    ITraineeRepository traineeRepository,
    ICompletedWorkoutRepository completedWorkoutRepository,
    ITraineeInsightsRepository traineeInsightsRepository,
    ITraineeInsightsRebuildPublisher publisher,
    IUserContext userContext)
    : IRequestHandler<RebuildTraineeInsightsCommand, OneOf<RebuildTraineeInsightsSuccess, RebuildTraineeInsightsForbidden, RebuildTraineeInsightsAlreadyPending, RebuildTraineeInsightsInsufficientData, RebuildTraineeInsightsInsufficientCredits>>
{
    public async Task<OneOf<RebuildTraineeInsightsSuccess, RebuildTraineeInsightsForbidden, RebuildTraineeInsightsAlreadyPending, RebuildTraineeInsightsInsufficientData, RebuildTraineeInsightsInsufficientCredits>> Handle(
        RebuildTraineeInsightsCommand request,
        CancellationToken cancellationToken)
    {
        if (await userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return new RebuildTraineeInsightsForbidden();
        }

        var trainee = await traineeRepository.GetById(request.TraineeId, cancellationToken);
        if (trainee is null || trainee.CoachUserId != userId)
        {
            return new RebuildTraineeInsightsForbidden();
        }

        var existing = await traineeInsightsRepository.GetByTraineeId(request.TraineeId, cancellationToken);
        if (existing?.Status == InsightsStatus.Pending)
        {
            return new RebuildTraineeInsightsAlreadyPending();
        }

        var completedCount = await completedWorkoutRepository.CountCompletedByTraineeId(request.TraineeId, cancellationToken);
        if (completedCount < 3)
        {
            return new RebuildTraineeInsightsInsufficientData($"At least 3 completed workouts are required. Currently: {completedCount}.");
        }

        var reserveResult = await mediator.Send(
            new ReserveCreditsCommand(userId, CreditAction.RebuildTraineeInsights, request.TraineeId.ToString()),
            cancellationToken);

        if (reserveResult.IsT1)
        {
            return new RebuildTraineeInsightsInsufficientCredits(reserveResult.AsT1.Reason);
        }

        var now = DateTimeOffset.UtcNow;
        var document = existing ?? new TraineeInsights
        {
            Id = request.TraineeId,
            CreatedAt = now,
        };

        document.Status = InsightsStatus.Pending;
        document.RebuildRequestedAt = now;

        await traineeInsightsRepository.Upsert(document, cancellationToken);

        var reservation = reserveResult.AsT0;

        await publisher.Publish(new TraineeInsightsRebuildRequestedMessage(
            TraineeId: request.TraineeId,
            CoachUserId: userId,
            IsManual: true,
            RequestedAt: now,
            IncludedReserved: reservation.IncludedReserved,
            PurchasedReserved: reservation.PurchasedReserved), cancellationToken);

        return new RebuildTraineeInsightsSuccess();
    }
}
