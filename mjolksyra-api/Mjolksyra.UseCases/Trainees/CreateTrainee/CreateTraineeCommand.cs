using MediatR;
using OneOf;

namespace Mjolksyra.UseCases.Trainees.CreateTrainee;

public class CreateTraineeCommand : IRequest<OneOf<TraineeResponse, CreateTraineeError>>
{
    public required Guid AthleteUserId { get; set; }

    public required Guid CoachUserId { get; set; }
}
