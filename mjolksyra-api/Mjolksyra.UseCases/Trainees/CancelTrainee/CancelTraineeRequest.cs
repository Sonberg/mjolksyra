using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Email;
using Stripe;

namespace Mjolksyra.UseCases.Trainees.CancelTrainee;

public class CancelTraineeRequest : IRequest
{
    public required Guid TraineeId { get; set; }

    public required Guid UserId { get; set; }
}

public class CancelTraineeRequestHandler : IRequestHandler<CancelTraineeRequest>
{
    private readonly ITraineeRepository _traineeRepository;

    private readonly IStripeClient _stripeClient;
    private readonly IUserRepository _userRepository;
    private readonly IEmailSender _emailSender;

    public CancelTraineeRequestHandler(
        ITraineeRepository traineeRepository,
        IStripeClient stripeClient,
        IUserRepository userRepository,
        IEmailSender emailSender)
    {
        _traineeRepository = traineeRepository;
        _stripeClient = stripeClient;
        _userRepository = userRepository;
        _emailSender = emailSender;
    }

    public async Task Handle(CancelTraineeRequest request, CancellationToken cancellationToken)
    {
        var trainee = await _traineeRepository.GetById(request.TraineeId, cancellationToken);
        if (trainee is null) return;

        var canCancel = trainee.CoachUserId == request.UserId || trainee.AthleteUserId == request.UserId;
        if (!canCancel) return;
        if (trainee.Status == TraineeStatus.Cancelled) return;

        if (trainee.StripeSubscriptionId is not null)
        {
            var subscriptionService = new SubscriptionService(_stripeClient);
            await subscriptionService.CancelAsync(trainee.StripeSubscriptionId, cancellationToken: cancellationToken);
            trainee.StripeSubscriptionId = null;
        }

        trainee.Status = TraineeStatus.Cancelled;
        trainee.DeletedAt = DateTimeOffset.UtcNow;

        await _traineeRepository.Update(trainee, cancellationToken);

        var coach = await _userRepository.GetById(trainee.CoachUserId, cancellationToken);
        var athlete = await _userRepository.GetById(trainee.AthleteUserId, cancellationToken);
        var cancelledBy = request.UserId == trainee.CoachUserId ? "coach" : "athlete";

        var emailModel = new RelationshipCancelledEmail
        {
            Coach = DisplayName(coach),
            Athlete = DisplayName(athlete),
            CancelledBy = cancelledBy,
            Email = athlete.Email.Value
        };

        await _emailSender.SendRelationshipCancelled(athlete.Email.Value, emailModel, cancellationToken);
        await _emailSender.SendRelationshipCancelled(coach.Email.Value, new RelationshipCancelledEmail
        {
            Coach = emailModel.Coach,
            Athlete = emailModel.Athlete,
            CancelledBy = emailModel.CancelledBy,
            Email = coach.Email.Value
        }, cancellationToken);
    }

    private static string DisplayName(User user)
        => string.Join(" ", new[]
            {
                user.GivenName, user.FamilyName
            }.Where(x => !string.IsNullOrWhiteSpace(x))).Trim() switch
            {
                "" => user.Email.Value,
                var value => value
            };
}