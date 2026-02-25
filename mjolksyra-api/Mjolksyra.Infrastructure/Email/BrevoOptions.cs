namespace Mjolksyra.Infrastructure.Email;

public class BrevoOptions
{
    public const string SectionName = "Brevo";

    public required string ApiKey { get; set; }

    public long? InvitationTemplateId => 1;

    public long? InvitationAcceptedCoachTemplateId => 4;

    public long? InvitationDeclinedCoachTemplateId => 5;

    public long? PaymentMethodRequiredAthleteTemplateId => 6;

    public long? PaymentSucceededAthleteTemplateId => 7;

    public long? PaymentFailedAthleteTemplateId => 8;

    public long? PaymentFailedCoachTemplateId => 9;

    public long? PriceChangedAthleteTemplateId => 10;

    public long? ChargeNowAthleteTemplateId => 11;

    public long? RelationshipCancelledTemplateId => 12;

    public long? CoachStripeStatusTemplateId => 13;
}