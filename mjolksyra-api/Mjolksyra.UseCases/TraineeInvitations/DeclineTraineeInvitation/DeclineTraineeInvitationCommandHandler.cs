using MediatR;
using Mjolksyra.Domain;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Email;
using Mjolksyra.Domain.Notifications;

namespace Mjolksyra.UseCases.TraineeInvitations.DeclineTraineeInvitation;

public class DeclineTraineeInvitationCommandHandler(
    ITraineeInvitationsRepository repository,
    IUserRepository userRepository,
    IEmailSender emailSender,
    INotificationService notificationService
) : IRequestHandler<DeclineTraineeInvitationCommand>
{
    public async Task Handle(DeclineTraineeInvitationCommand request, CancellationToken cancellationToken)
    {
        var invitation = await repository.GetByIdAsync(request.TraineeInvitationId, cancellationToken);
        if (invitation.AcceptedAt is not null || invitation.RejectedAt is not null) return;

        var athlete = await userRepository.GetById(request.AthleteUserId, cancellationToken);
        var coach = await userRepository.GetById(invitation.CoachUserId, cancellationToken);

        if (invitation.Email.Normalized != EmailNormalizer.Normalize(athlete.Email.Value)) return;

        await repository.RejectAsync(request.TraineeInvitationId, cancellationToken);

        await emailSender.SendInvitationDeclinedToCoach(coach.Email.Value, new InvitationStatusEmail
        {
            Coach = coach,
            Athlete = athlete,
            PriceSek = invitation.MonthlyPriceAmount
        }, cancellationToken);

        await notificationService.Notify(coach.Id,
            "invite.declined",
            "Invitation declined",
            $"{athlete.DisplayName} declined your invitation.",
            "/app/coach/athletes",
            cancellationToken);
    }
}
