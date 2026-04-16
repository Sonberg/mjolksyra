using MediatR;

namespace Mjolksyra.UseCases.Trainees.SetTraineeInsightsVisibility;

public record SetTraineeInsightsVisibilityCommand(Guid TraineeId, bool VisibleToAthlete) : IRequest<bool>;
