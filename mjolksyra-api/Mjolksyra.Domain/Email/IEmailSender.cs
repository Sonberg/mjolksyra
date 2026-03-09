using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Email;

public class InvitationEmail
{
    public required User Coach { get; set; }

    public required User? Athlete { get; set; }

    public int? PriceSek { get; set; }
}

public class InvitationStatusEmail
{
    public required User Coach { get; set; }

    public required User Athlete { get; set; }
    public int? PriceSek { get; set; }
}

public class AthleteBillingEmail
{
    public required User Coach { get; set; }

    public required User Athlete { get; set; }

    public int? PriceSek { get; set; }

    public string? ReceiptUrl { get; set; }

    public string? NextChargeDate { get; set; }
}

public class RelationshipCancelledEmail
{
    public required User Coach { get; set; }

    public required User Athlete { get; set; }

    public required UserRole CancelledBy { get; set; }
}

public class CoachStripeStatusEmail
{
    public required User Coach { get; set; }

    public required StripeStatus Status { get; set; }
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