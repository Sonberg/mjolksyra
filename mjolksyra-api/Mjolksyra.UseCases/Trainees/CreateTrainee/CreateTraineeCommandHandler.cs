using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.Trainees.CreateTrainee;

public class CreateTraineeCommandHandler : IRequestHandler<CreateTraineeCommand, TraineeResponse>
{
    private readonly IUserRepository _userRepository;

    private readonly ITraineeRepository _traineeRepository;

    private readonly ITraineeResponseBuilder _traineeResponseBuilder;

    public CreateTraineeCommandHandler(ITraineeRepository traineeRepository, IUserRepository userRepository, ITraineeResponseBuilder traineeResponseBuilder)
    {
        _traineeRepository = traineeRepository;
        _traineeResponseBuilder = traineeResponseBuilder;
        _userRepository = userRepository;
    }

    public async Task<TraineeResponse> Handle(CreateTraineeCommand request, CancellationToken cancellationToken)
    {
        var coach = await _userRepository.GetById(request.CoachUserId, cancellationToken);
        var athlete = await _userRepository.GetById(request.AthleteUserId, cancellationToken);

        var trainee = await _traineeRepository.Create(new Trainee
        {
            AthleteUserId = athlete.Id,
            CoachUserId = coach.Id
        }, cancellationToken);

        return await _traineeResponseBuilder.Build(trainee, cancellationToken);
    }
}