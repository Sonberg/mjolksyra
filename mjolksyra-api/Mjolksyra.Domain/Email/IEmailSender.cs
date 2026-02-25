namespace Mjolksyra.Domain.Email;

public class InvitationEmail
{
    public required string Coach { get; set; }

    public required string Text { get; set; }

    public required string Link { get; set; }

    public string? Email { get; set; }

    public int? PriceSek { get; set; }
}

public class InvitationStatusEmail
{
    public required string Coach { get; set; }

    public required string Athlete { get; set; }

    public required string Email { get; set; }

    public int? PriceSek { get; set; }
}

public class AthleteBillingEmail
{
    public required string Coach { get; set; }

    public required string Athlete { get; set; }

    public required string Email { get; set; }

    public int? PriceSek { get; set; }

    public string? Link { get; set; }

    public string? Date { get; set; }

    public string? NextChargeDate { get; set; }

    public string? Reason { get; set; }
}

public class RelationshipCancelledEmail
{
    public required string Coach { get; set; }

    public required string Athlete { get; set; }

    public required string CancelledBy { get; set; }

    public required string Email { get; set; }
}

public class CoachStripeStatusEmail
{
    public required string Coach { get; set; }

    public required string Email { get; set; }

    public required string Status { get; set; }

    public string? Message { get; set; }
}

public interface IEmailSender
{
    Task SendInvitation(string email, InvitationEmail invitation, CancellationToken cancellationToken);

    Task SendInvitationAcceptedToCoach(string email, InvitationStatusEmail emailModel, CancellationToken cancellationToken);

    Task SendInvitationDeclinedToCoach(string email, InvitationStatusEmail emailModel, CancellationToken cancellationToken);

    Task SendPaymentMethodRequiredToAthlete(string email, AthleteBillingEmail emailModel, CancellationToken cancellationToken);

    Task SendPaymentSucceededToAthlete(string email, AthleteBillingEmail emailModel, CancellationToken cancellationToken);

    Task SendPaymentFailedToAthlete(string email, AthleteBillingEmail emailModel, CancellationToken cancellationToken);

    Task SendPaymentFailedToCoach(string email, AthleteBillingEmail emailModel, CancellationToken cancellationToken);

    Task SendPriceChangedToAthlete(string email, AthleteBillingEmail emailModel, CancellationToken cancellationToken);

    Task SendChargeNowToAthlete(string email, AthleteBillingEmail emailModel, CancellationToken cancellationToken);

    Task SendRelationshipCancelled(string email, RelationshipCancelledEmail emailModel, CancellationToken cancellationToken);

    Task SendCoachStripeStatusToCoach(string email, CoachStripeStatusEmail emailModel, CancellationToken cancellationToken);

    Task SignUp(string email, CancellationToken cancellationToken);
}
