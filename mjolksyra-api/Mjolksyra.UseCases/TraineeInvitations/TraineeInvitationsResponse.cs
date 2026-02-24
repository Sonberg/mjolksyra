using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.TraineeInvitations;

public class TraineeInvitationsResponse
{
    public Guid Id { get; set; }

    public required string Email { get; set; }

    public required TraineeInvitationCoach Coach { get; set; }

    public int? MonthlyPriceAmount { get; set; }

    public DateTimeOffset? AcceptedAt { get; set; }

    public DateTimeOffset? RejectedAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public static TraineeInvitationsResponse From(TraineeInvitation invitation, ICollection<User> coaches)
    {
        var coach = coaches.Single(x => x.Id == invitation.CoachUserId);

        return new TraineeInvitationsResponse
        {
            Id = invitation.Id,
            Email = invitation.Email,
            Coach = new TraineeInvitationCoach
            {
                FamilyName = coach.FamilyName!,
                GivenName = coach.GivenName!
            },
            MonthlyPriceAmount = invitation.MonthlyPriceAmount,
            AcceptedAt = invitation.AcceptedAt,
            RejectedAt = invitation.RejectedAt,
            CreatedAt = invitation.CreatedAt
        };
    }
}
