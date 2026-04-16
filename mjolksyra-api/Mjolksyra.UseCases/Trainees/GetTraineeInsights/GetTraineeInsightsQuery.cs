using MediatR;

namespace Mjolksyra.UseCases.Trainees.GetTraineeInsights;

public record GetTraineeInsightsQuery(Guid TraineeId) : IRequest<TraineeInsightsResponse?>;
