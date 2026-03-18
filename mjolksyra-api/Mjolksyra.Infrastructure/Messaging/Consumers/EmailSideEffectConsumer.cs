using MassTransit;
using Microsoft.Extensions.DependencyInjection;
using Mjolksyra.Domain.Email;
using Mjolksyra.Domain.Messaging;

namespace Mjolksyra.Infrastructure.Messaging.Consumers;

public class EmailSideEffectConsumer([FromKeyedServices("direct")] IEmailSender emailSender) : IConsumer<EmailSideEffectMessage>
{
    public async Task Consume(ConsumeContext<EmailSideEffectMessage> context)
    {
        var message = context.Message;
        switch (message.Action)
        {
            case EmailSideEffectAction.SendInvitation when message.Invitation is not null:
                await emailSender.SendInvitation(message.Email, message.Invitation, context.CancellationToken);
                break;
            case EmailSideEffectAction.SendInvitationAcceptedToCoach when message.InvitationStatus is not null:
                await emailSender.SendInvitationAcceptedToCoach(message.Email, message.InvitationStatus, context.CancellationToken);
                break;
            case EmailSideEffectAction.SendInvitationDeclinedToCoach when message.InvitationStatus is not null:
                await emailSender.SendInvitationDeclinedToCoach(message.Email, message.InvitationStatus, context.CancellationToken);
                break;
            case EmailSideEffectAction.SendPaymentMethodRequiredToAthlete when message.AthleteBilling is not null:
                await emailSender.SendPaymentMethodRequiredToAthlete(message.Email, message.AthleteBilling, context.CancellationToken);
                break;
            case EmailSideEffectAction.SendPaymentSucceededToAthlete when message.AthleteBilling is not null:
                await emailSender.SendPaymentSucceededToAthlete(message.Email, message.AthleteBilling, context.CancellationToken);
                break;
            case EmailSideEffectAction.SendPaymentFailedToAthlete when message.AthleteBilling is not null:
                await emailSender.SendPaymentFailedToAthlete(message.Email, message.AthleteBilling, context.CancellationToken);
                break;
            case EmailSideEffectAction.SendPaymentFailedToCoach when message.AthleteBilling is not null:
                await emailSender.SendPaymentFailedToCoach(message.Email, message.AthleteBilling, context.CancellationToken);
                break;
            case EmailSideEffectAction.SendPriceChangedToAthlete when message.AthleteBilling is not null:
                await emailSender.SendPriceChangedToAthlete(message.Email, message.AthleteBilling, context.CancellationToken);
                break;
            case EmailSideEffectAction.SendChargeNowToAthlete when message.AthleteBilling is not null:
                await emailSender.SendChargeNowToAthlete(message.Email, message.AthleteBilling, context.CancellationToken);
                break;
            case EmailSideEffectAction.SendRelationshipCancelled when message.RelationshipCancelled is not null:
                await emailSender.SendRelationshipCancelled(message.Email, message.RelationshipCancelled, context.CancellationToken);
                break;
            case EmailSideEffectAction.SendCoachStripeStatusToCoach when message.CoachStripeStatus is not null:
                await emailSender.SendCoachStripeStatusToCoach(message.Email, message.CoachStripeStatus, context.CancellationToken);
                break;
            case EmailSideEffectAction.SendClerkInvitation when message.ClerkInvitation is not null:
                await emailSender.SendClerkInvitation(message.Email, message.ClerkInvitation, context.CancellationToken);
                break;
            case EmailSideEffectAction.SendClerkInvitationAccepted when message.ClerkInvitationAccepted is not null:
                await emailSender.SendClerkInvitationAccepted(message.Email, message.ClerkInvitationAccepted, context.CancellationToken);
                break;
            case EmailSideEffectAction.SignUp:
                await emailSender.SignUp(message.Email, context.CancellationToken);
                break;
        }
    }
}
