using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.Trainees.CancelTrainee;

public class CancelTraineeRequest : IRequest
{
    public required Guid TraineeId { get; set; }

    public required Guid UserId { get; set; }
}

public class CancelTraineeRequestHandler : IRequestHandler<CancelTraineeRequest>
{
    private readonly ITraineeRepository _traineeRepository;

    public CancelTraineeRequestHandler(ITraineeRepository traineeRepository)
    {
        _traineeRepository = traineeRepository;
    }

    public async Task Handle(CancelTraineeRequest request, CancellationToken cancellationToken)
    {
        var trainee = await _traineeRepository.GetById(request.TraineeId, cancellationToken);
        if (trainee?.CoachUserId != request.UserId) return;

        trainee.Status = TraineeStatus.Cancelled;

        await _traineeRepository.Update(trainee, cancellationToken);
    }
}