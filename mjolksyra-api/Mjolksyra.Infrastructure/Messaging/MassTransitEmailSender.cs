using MassTransit;
using Mjolksyra.Domain.Email;
using Mjolksyra.Domain.Messaging;

namespace Mjolksyra.Infrastructure.Messaging;

public class MassTransitEmailSender(IPublishEndpoint publishEndpoint) : IEmailSender
{
    public Task SendInvitation(string email, InvitationEmail invitation, CancellationToken cancellationToken) =>
        publishEndpoint.Publish(new EmailSideEffectMessage
        {
            Action = EmailSideEffectAction.SendInvitation,
            Email = email,
            Invitation = invitation,
        }, cancellationToken);

    public Task SendInvitationAcceptedToCoach(string email, InvitationStatusEmail emailModel, CancellationToken cancellationToken) =>
        publishEndpoint.Publish(new EmailSideEffectMessage
        {
            Action = EmailSideEffectAction.SendInvitationAcceptedToCoach,
            Email = email,
            InvitationStatus = emailModel,
        }, cancellationToken);

    public Task SendInvitationDeclinedToCoach(string email, InvitationStatusEmail emailModel, CancellationToken cancellationToken) =>
        publishEndpoint.Publish(new EmailSideEffectMessage
        {
            Action = EmailSideEffectAction.SendInvitationDeclinedToCoach,
            Email = email,
            InvitationStatus = emailModel,
        }, cancellationToken);

    public Task SendPaymentMethodRequiredToAthlete(string email, AthleteBillingEmail emailModel, CancellationToken cancellationToken) =>
        publishEndpoint.Publish(new EmailSideEffectMessage
        {
            Action = EmailSideEffectAction.SendPaymentMethodRequiredToAthlete,
            Email = email,
            AthleteBilling = emailModel,
        }, cancellationToken);

    public Task SendPaymentSucceededToAthlete(string email, AthleteBillingEmail emailModel, CancellationToken cancellationToken) =>
        publishEndpoint.Publish(new EmailSideEffectMessage
        {
            Action = EmailSideEffectAction.SendPaymentSucceededToAthlete,
            Email = email,
            AthleteBilling = emailModel,
        }, cancellationToken);

    public Task SendPaymentFailedToAthlete(string email, AthleteBillingEmail emailModel, CancellationToken cancellationToken) =>
        publishEndpoint.Publish(new EmailSideEffectMessage
        {
            Action = EmailSideEffectAction.SendPaymentFailedToAthlete,
            Email = email,
            AthleteBilling = emailModel,
        }, cancellationToken);

    public Task SendPaymentFailedToCoach(string email, AthleteBillingEmail emailModel, CancellationToken cancellationToken) =>
        publishEndpoint.Publish(new EmailSideEffectMessage
        {
            Action = EmailSideEffectAction.SendPaymentFailedToCoach,
            Email = email,
            AthleteBilling = emailModel,
        }, cancellationToken);

    public Task SendPriceChangedToAthlete(string email, AthleteBillingEmail emailModel, CancellationToken cancellationToken) =>
        publishEndpoint.Publish(new EmailSideEffectMessage
        {
            Action = EmailSideEffectAction.SendPriceChangedToAthlete,
            Email = email,
            AthleteBilling = emailModel,
        }, cancellationToken);

    public Task SendChargeNowToAthlete(string email, AthleteBillingEmail emailModel, CancellationToken cancellationToken) =>
        publishEndpoint.Publish(new EmailSideEffectMessage
        {
            Action = EmailSideEffectAction.SendChargeNowToAthlete,
            Email = email,
            AthleteBilling = emailModel,
        }, cancellationToken);

    public Task SendRelationshipCancelled(string email, RelationshipCancelledEmail emailModel, CancellationToken cancellationToken) =>
        publishEndpoint.Publish(new EmailSideEffectMessage
        {
            Action = EmailSideEffectAction.SendRelationshipCancelled,
            Email = email,
            RelationshipCancelled = emailModel,
        }, cancellationToken);

    public Task SendCoachStripeStatusToCoach(string email, CoachStripeStatusEmail emailModel, CancellationToken cancellationToken) =>
        publishEndpoint.Publish(new EmailSideEffectMessage
        {
            Action = EmailSideEffectAction.SendCoachStripeStatusToCoach,
            Email = email,
            CoachStripeStatus = emailModel,
        }, cancellationToken);

    public Task SendClerkInvitation(string email, ClerkInvitationEmail emailModel, CancellationToken cancellationToken) =>
        publishEndpoint.Publish(new EmailSideEffectMessage
        {
            Action = EmailSideEffectAction.SendClerkInvitation,
            Email = email,
            ClerkInvitation = emailModel,
        }, cancellationToken);

    public Task SendClerkInvitationAccepted(string email, ClerkInvitationAcceptedEmail emailModel, CancellationToken cancellationToken) =>
        publishEndpoint.Publish(new EmailSideEffectMessage
        {
            Action = EmailSideEffectAction.SendClerkInvitationAccepted,
            Email = email,
            ClerkInvitationAccepted = emailModel,
        }, cancellationToken);

    public Task SignUp(string email, CancellationToken cancellationToken) =>
        publishEndpoint.Publish(new EmailSideEffectMessage
        {
            Action = EmailSideEffectAction.SignUp,
            Email = email,
        }, cancellationToken);
}
