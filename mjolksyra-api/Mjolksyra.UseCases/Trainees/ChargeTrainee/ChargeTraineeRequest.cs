using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Stripe;

namespace Mjolksyra.UseCases.Trainees.ChargeTrainee;

public class ChargeTraineeRequest : IRequest
{
    public required Guid TraineeId { get; set; }
}

public class ChargeTraineeRequestHandler : IRequestHandler<ChargeTraineeRequest>
{
    private readonly ITraineeRepository _traineeRepository;

    private readonly IUserRepository _userRepository;

    private readonly IStripeClient _stripeClient;

    public ChargeTraineeRequestHandler(ITraineeRepository traineeRepository, IUserRepository userRepository, IStripeClient stripeClient)
    {
        _traineeRepository = traineeRepository;
        _userRepository = userRepository;
        _stripeClient = stripeClient;
    }

    public async Task Handle(ChargeTraineeRequest request, CancellationToken cancellationToken)
    {
        var trainee = await _traineeRepository.GetById(request.TraineeId, cancellationToken);
        if (trainee is null) return;

        var athlete = await _userRepository.GetById(trainee.AthleteUserId, cancellationToken);
        var coach = await _userRepository.GetById(trainee.CoachUserId, cancellationToken);

        if (athlete is not { IsAthlete: true, Athlete.Stripe.CustomerId: not null }) return;
        if (coach is not { IsCoach: true, Coach.Stripe.AccountId: not null }) return;

        var transactionCost = TraineeTransactionCost.From(trainee.Cost);
        var paymentService = new PaymentIntentService(_stripeClient);
        var paymentIntent = await paymentService.CreateAsync(new PaymentIntentCreateOptions
            {
                Amount = transactionCost.Total * 100,
                Currency = trainee.Cost.Currency,
                Customer = athlete.Athlete.Stripe.CustomerId,
                Confirm = true,
                PaymentMethod = athlete.Athlete.Stripe.PaymentMethodId,
                AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
                {
                    Enabled = true,
                    AllowRedirects = "never"
                },
                TransferData = new PaymentIntentTransferDataOptions
                {
                    Destination = coach.Coach.Stripe.AccountId,
                    Amount = Math.Max(transactionCost.Coach * 100, 1),
                },
                ApplicationFeeAmount = transactionCost.ApplicationFee * 100,
                Metadata = new Dictionary<string, string>
                {
                    {
                        nameof(ChargeTraineeRequest.TraineeId), trainee.Id.ToString()
                    },
                    {
                        nameof(Trainee.AthleteUserId), trainee.AthleteUserId.ToString()
                    },
                    {
                        nameof(Trainee.CoachUserId), trainee.CoachUserId.ToString()
                    }
                }
            },
            cancellationToken: cancellationToken);

        trainee.Transactions.Add(new TraineeTransaction
        {
            Id = Guid.NewGuid(),
            PaymentIntentId = paymentIntent.Id,
            Cost = transactionCost,
            Status = TraineeTransactionStatus.Pending,
            CreatedAt = DateTime.UtcNow,
        });


        await _traineeRepository.Update(trainee, cancellationToken);
    }
}