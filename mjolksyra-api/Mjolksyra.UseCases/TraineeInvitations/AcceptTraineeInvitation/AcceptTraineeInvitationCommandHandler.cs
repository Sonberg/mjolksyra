using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Email;
using Mjolksyra.Domain.Notifications;
using Mjolksyra.UseCases.Coaches.EnsureCoachPlatformSubscription;

namespace Mjolksyra.UseCases.TraineeInvitations.AcceptTraineeInvitation;

public class AcceptTraineeInvitationCommandHandler(
    ITraineeRepository traineeRepository,
    ITraineeInvitationsRepository traineeInvitationsRepository,
    IUserRepository userRepository,
    IEmailSender emailSender,
    INotificationService notificationService,
    IMediator mediator
) : IRequestHandler<AcceptTraineeInvitationCommand>
{
    public async Task Handle(AcceptTraineeInvitationCommand request, CancellationToken cancellationToken)
    {
        var invitation = await traineeInvitationsRepository.GetByIdAsync(request.TraineeInvitationId, cancellationToken);
        if (invitation.AcceptedAt is not null || invitation.RejectedAt is not null) return;

        var athlete = await userRepository.GetById(request.AthleteUserId, cancellationToken);
        if (invitation.Email.Normalized != athlete.Email.Normalized) return;
        var coach = await userRepository.GetById(invitation.CoachUserId, cancellationToken);

        if (await traineeRepository.ExistsActiveRelationship(invitation.CoachUserId, request.AthleteUserId, cancellationToken))
        {
            await traineeInvitationsRepository.AcceptAsync(invitation.Id, cancellationToken);
            return;
        }

        await traineeRepository.Create(new Trainee
        {
            Id = Guid.NewGuid(),
            Status = TraineeStatus.Active,
            AthleteUserId = request.AthleteUserId,
            CoachUserId = invitation.CoachUserId,
            TraineeInvitationId = invitation.Id,
            Cost = new TraineeCost
            {
                Amount = Math.Max(0, invitation.MonthlyPriceAmount ?? 0)
            },
            CreatedAt = DateTimeOffset.UtcNow
        }, cancellationToken);

        await traineeInvitationsRepository.AcceptAsync(
            invitation.Id,
            cancellationToken);

        await mediator.Send(new EnsureCoachPlatformSubscriptionCommand(invitation.CoachUserId), cancellationToken);

        await emailSender.SendInvitationAcceptedToCoach(coach.Email.Value, new InvitationStatusEmail
        {
            Coach = DisplayName(coach),
            Athlete = DisplayName(athlete),
            Email = athlete.Email.Value,
            PriceSek = invitation.MonthlyPriceAmount
        }, cancellationToken);

        var athleteNeedsPaymentSetup = athlete.Athlete?.Stripe?.Status != StripeStatus.Succeeded
                                       || athlete.Athlete?.Stripe?.CustomerId is null
                                       || athlete.Athlete?.Stripe?.PaymentMethodId is null;

        if (athleteNeedsPaymentSetup)
        {
            await emailSender.SendPaymentMethodRequiredToAthlete(athlete.Email.Value, new AthleteBillingEmail
            {
                Coach = DisplayName(coach),
                Athlete = DisplayName(athlete),
                Email = athlete.Email.Value,
                PriceSek = invitation.MonthlyPriceAmount,
                Link = "/app/athlete"
            }, cancellationToken);
        }

        await notificationService.Notify(coach.Id,
            "invite.accepted",
            "Invitation accepted",
            $"{DisplayName(athlete)} accepted your invitation.",
            "/app/coach/athletes",
            cancellationToken);

        await notificationService.Notify(athlete.Id,
            "invite.accepted",
            "Coach connection active",
            $"You are now connected with {DisplayName(coach)}.",
            "/app/athlete",
            cancellationToken);

        if (athleteNeedsPaymentSetup)
        {
            await notificationService.Notify(athlete.Id,
                "billing.setup-required",
                "Payment setup required",
                "Add your payment method to enable coaching billing.",
                "/app/athlete",
                cancellationToken);
        }
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
