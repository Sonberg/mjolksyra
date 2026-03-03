using MassTransit;
using Moq;
using Mjolksyra.Domain.Email;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.Infrastructure.Messaging;

namespace Mjolksyra.Infrastructure.Tests.Messaging;

public class EmailSideEffectConsumerTests
{
    private static (EmailSideEffectConsumer consumer, Mock<IEmailSender> emailSender) Create()
    {
        var emailSender = new Mock<IEmailSender>();
        return (new EmailSideEffectConsumer(emailSender.Object), emailSender);
    }

    private static Mock<ConsumeContext<EmailSideEffectMessage>> BuildContext(EmailSideEffectMessage message)
    {
        var context = new Mock<ConsumeContext<EmailSideEffectMessage>>();
        context.SetupGet(x => x.Message).Returns(message);
        context.SetupGet(x => x.CancellationToken).Returns(CancellationToken.None);
        return context;
    }

    [Fact]
    public async Task Consume_SendInvitation_CallsSendInvitation()
    {
        var (consumer, emailSender) = Create();
        var invitation = new InvitationEmail { Coach = "Coach", Text = "Join me", Link = "https://link" };
        var context = BuildContext(new EmailSideEffectMessage
        {
            Action = EmailSideEffectAction.SendInvitation,
            Email = "athlete@example.com",
            Invitation = invitation
        });

        await consumer.Consume(context.Object);

        emailSender.Verify(x => x.SendInvitation("athlete@example.com", invitation, CancellationToken.None), Times.Once);
    }

    [Fact]
    public async Task Consume_SendInvitation_WhenInvitationIsNull_DoesNotCallSender()
    {
        var (consumer, emailSender) = Create();
        var context = BuildContext(new EmailSideEffectMessage
        {
            Action = EmailSideEffectAction.SendInvitation,
            Email = "athlete@example.com",
            Invitation = null
        });

        await consumer.Consume(context.Object);

        emailSender.Verify(x => x.SendInvitation(It.IsAny<string>(), It.IsAny<InvitationEmail>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Consume_SignUp_CallsSignUp()
    {
        var (consumer, emailSender) = Create();
        var context = BuildContext(new EmailSideEffectMessage
        {
            Action = EmailSideEffectAction.SignUp,
            Email = "newuser@example.com"
        });

        await consumer.Consume(context.Object);

        emailSender.Verify(x => x.SignUp("newuser@example.com", CancellationToken.None), Times.Once);
    }

    [Fact]
    public async Task Consume_SendPaymentSucceededToAthlete_CallsCorrectMethod()
    {
        var (consumer, emailSender) = Create();
        var billing = new AthleteBillingEmail { Coach = "Coach", Athlete = "Athlete", Email = "a@example.com" };
        var context = BuildContext(new EmailSideEffectMessage
        {
            Action = EmailSideEffectAction.SendPaymentSucceededToAthlete,
            Email = "athlete@example.com",
            AthleteBilling = billing
        });

        await consumer.Consume(context.Object);

        emailSender.Verify(x => x.SendPaymentSucceededToAthlete("athlete@example.com", billing, CancellationToken.None), Times.Once);
    }

    [Fact]
    public async Task Consume_SendRelationshipCancelled_CallsCorrectMethod()
    {
        var (consumer, emailSender) = Create();
        var cancelled = new RelationshipCancelledEmail { Coach = "Coach", Athlete = "Athlete", CancelledBy = "Coach", Email = "c@example.com" };
        var context = BuildContext(new EmailSideEffectMessage
        {
            Action = EmailSideEffectAction.SendRelationshipCancelled,
            Email = "coach@example.com",
            RelationshipCancelled = cancelled
        });

        await consumer.Consume(context.Object);

        emailSender.Verify(x => x.SendRelationshipCancelled("coach@example.com", cancelled, CancellationToken.None), Times.Once);
    }
}
