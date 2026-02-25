using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.UseCases.Trainees.UpdateTrianeeCost;

namespace Mjolksyra.UseCases.Trainees.ChargeNowTrainee;

public class ChargeNowTraineeCommandHandler : IRequestHandler<ChargeNowTraineeCommand>
{
    private readonly ITraineeRepository _traineeRepository;
    private readonly IUserRepository _userRepository;
    private readonly IMediator _mediator;

    public ChargeNowTraineeCommandHandler(
        ITraineeRepository traineeRepository,
        IUserRepository userRepository,
        IMediator mediator)
    {
        _traineeRepository = traineeRepository;
        _userRepository = userRepository;
        _mediator = mediator;
    }

    public async Task Handle(ChargeNowTraineeCommand request, CancellationToken cancellationToken)
    {
        var trainee = await _traineeRepository.GetById(request.TraineeId, cancellationToken);
        if (trainee is null) return;
        if (trainee.CoachUserId != request.UserId) return;
        if (trainee.Cost.Amount <= 0) return;

        var athlete = await _userRepository.GetById(trainee.AthleteUserId, cancellationToken);
        var coach = await _userRepository.GetById(trainee.CoachUserId, cancellationToken);

        var athletePaymentReady =
            athlete.Athlete?.Stripe?.CustomerId is not null &&
            athlete.Athlete.Stripe.PaymentMethodId is not null &&
            athlete.Athlete.Stripe.Status == StripeStatus.Succeeded;
        var coachStripeReady =
            coach.Coach?.Stripe?.AccountId is not null &&
            coach.Coach.Stripe.Status == StripeStatus.Succeeded;

        if (!athletePaymentReady || !coachStripeReady)
        {
            return;
        }

        // Reuse existing subscription recreation flow to charge immediately and reset billing cycle.
        await _mediator.Send(new UpdateTraineeCostCommand
        {
            TraineeId = request.TraineeId,
            UserId = request.UserId,
            Amount = trainee.Cost.Amount
        }, cancellationToken);
    }
}
