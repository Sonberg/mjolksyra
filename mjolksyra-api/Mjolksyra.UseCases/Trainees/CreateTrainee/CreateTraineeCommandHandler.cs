using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.UseCases.Coaches.EnsureCoachPlatformSubscription;
using OneOf;

namespace Mjolksyra.UseCases.Trainees.CreateTrainee;

public class CreateTraineeCommandHandler : IRequestHandler<CreateTraineeCommand, OneOf<TraineeResponse, CreateTraineeError>>
{
    private readonly IUserRepository _userRepository;

    private readonly ITraineeRepository _traineeRepository;

    private readonly ITraineeResponseBuilder _traineeResponseBuilder;
    private readonly IMediator _mediator;

    public CreateTraineeCommandHandler(
        ITraineeRepository traineeRepository,
        IUserRepository userRepository,
        ITraineeResponseBuilder traineeResponseBuilder,
        IMediator mediator)
    {
        _traineeRepository = traineeRepository;
        _traineeResponseBuilder = traineeResponseBuilder;
        _userRepository = userRepository;
        _mediator = mediator;
    }

    public async Task<OneOf<TraineeResponse, CreateTraineeError>> Handle(CreateTraineeCommand request, CancellationToken cancellationToken)
    {
        var coach = await _userRepository.GetById(request.CoachUserId, cancellationToken);
        var athlete = await _userRepository.GetById(request.AthleteUserId, cancellationToken);

        var exists = await _traineeRepository.ExistsActiveRelationship(coach.Id, athlete.Id, cancellationToken);
        if (exists)
        {
            return new CreateTraineeError
            {
                Code = CreateTraineeErrorCode.AlreadyConnected,
                Message = "Athlete is already connected to this coach."
            };
        }

        var trainee = await _traineeRepository.Create(new Trainee
        {
            Id = Guid.NewGuid(),
            AthleteUserId = athlete.Id,
            CoachUserId = coach.Id,
            Status = TraineeStatus.Active,
            CreatedAt = DateTimeOffset.UtcNow
        }, cancellationToken);

        await _mediator.Send(new EnsureCoachPlatformSubscriptionCommand(coach.Id), cancellationToken);

        return await _traineeResponseBuilder.Build(trainee, cancellationToken);
    }
}
