using MediatR;

namespace Mjolksyra.UseCases.Trainees.CreateTrainee;

public class CreateTraineeCommand : IRequest<TraineeResponse>
{
    public required Guid AthleteUserId { get; set; }

    public required Guid CoachUserId { get; set; }
}