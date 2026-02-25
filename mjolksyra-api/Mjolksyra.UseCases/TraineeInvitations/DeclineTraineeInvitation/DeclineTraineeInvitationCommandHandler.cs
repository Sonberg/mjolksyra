using MediatR;
using Mjolksyra.Domain;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Email;

namespace Mjolksyra.UseCases.TraineeInvitations.DeclineTraineeInvitation;

public class DeclineTraineeInvitationCommandHandler(
    ITraineeInvitationsRepository repository,
    IUserRepository userRepository,
    IEmailSender emailSender
) : IRequestHandler<DeclineTraineeInvitationCommand>
{
    public async Task Handle(DeclineTraineeInvitationCommand request, CancellationToken cancellationToken)
    {
        var invitation = await repository.GetByIdAsync(request.TraineeInvitationId, cancellationToken);
        if (invitation is null) return;
        if (invitation.AcceptedAt is not null || invitation.RejectedAt is not null) return;

        var athlete = await userRepository.GetById(request.AthleteUserId, cancellationToken);
        if (athlete is null) return;
        var coach = await userRepository.GetById(invitation.CoachUserId, cancellationToken);

        if (invitation.Email.Normalized != EmailNormalizer.Normalize(athlete.Email.Value)) return;

        await repository.RejectAsync(request.TraineeInvitationId, cancellationToken);

        await emailSender.SendInvitationDeclinedToCoach(coach.Email.Value, new InvitationStatusEmail
        {
            Coach = DisplayName(coach),
            Athlete = DisplayName(athlete),
            Email = athlete.Email.Value,
            PriceSek = invitation.MonthlyPriceAmount
        }, cancellationToken);
    }

    private static string DisplayName(Domain.Database.Models.User user)
        => string.Join(" ", new[]
            {
                user.GivenName, user.FamilyName
            }.Where(x => !string.IsNullOrWhiteSpace(x))).Trim() switch
            {
                "" => user.Email.Value,
                var value => value
            };
}