using Mjolksyra.Domain.Email;

namespace Mjolksyra.Domain.Messaging;

public enum EmailSideEffectAction
{
    SendInvitation = 0,
    SendInvitationAcceptedToCoach = 1,
    SendInvitationDeclinedToCoach = 2,
    SendPaymentMethodRequiredToAthlete = 3,
    SendPaymentSucceededToAthlete = 4,
    SendPaymentFailedToAthlete = 5,
    SendPaymentFailedToCoach = 6,
    SendPriceChangedToAthlete = 7,
    SendChargeNowToAthlete = 8,
    SendRelationshipCancelled = 9,
    SendCoachStripeStatusToCoach = 10,
    SignUp = 11,
}

public class EmailSideEffectMessage
{
    public required EmailSideEffectAction Action { get; set; }

    public required string Email { get; set; }

    public InvitationEmail? Invitation { get; set; }

    public InvitationStatusEmail? InvitationStatus { get; set; }

    public AthleteBillingEmail? AthleteBilling { get; set; }

    public RelationshipCancelledEmail? RelationshipCancelled { get; set; }

    public CoachStripeStatusEmail? CoachStripeStatus { get; set; }
}
