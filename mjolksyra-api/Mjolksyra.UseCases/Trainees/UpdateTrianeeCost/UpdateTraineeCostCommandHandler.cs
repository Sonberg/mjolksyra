using MediatR;
using Mjolksyra.Domain.Database;

namespace Mjolksyra.UseCases.Trainees.UpdateTrianeeCost;

public class UpdateTraineeCostCommandHandler : IRequestHandler<UpdateTraineeCostCommand>
{
    private readonly ITraineeRepository _traineeRepository;

    public UpdateTraineeCostCommandHandler(ITraineeRepository traineeRepository)
    {
        _traineeRepository = traineeRepository;
    }

    public async Task Handle(UpdateTraineeCostCommand request, CancellationToken cancellationToken)
    {
        var trainee = await _traineeRepository.GetById(request.TraineeId, cancellationToken);
        if (trainee?.CoachUserId != request.UserId) return;

        trainee.Cost.Amount = request.Amount;

        await _traineeRepository.Update(trainee, cancellationToken);
    }
}