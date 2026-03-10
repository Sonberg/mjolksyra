using brevo_csharp.Api;
using brevo_csharp.Client;
using brevo_csharp.Model;
using Microsoft.Extensions.Options;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Email;
using Task = System.Threading.Tasks.Task;

namespace Mjolksyra.Infrastructure.Email;

public class BrevoEmailSender : IEmailSender
{
    private readonly TransactionalEmailsApi _transactionalEmailsApi;

    private readonly ContactsApi _contactsApi;
    
    private readonly BrevoOptions _options;

    private record TemplateParameters
    {
        public required string? Subject { get; init; }
        public required string? Preview { get; init; }
        public required string? Title { get; init; }
        public required string? Body { get; init; }
        public required string? ButtonText { get; init; }
        public required string? ButtonLink { get; init; }
    }

    public BrevoEmailSender(IOptions<BrevoOptions> options)
    {
        _options = options.Value;
        var configuration = new Configuration
        {
            ApiKey = new Dictionary<string, string>
            {
                {
                    "api-key", _options.ApiKey
                }
            }
        };

        _contactsApi = new ContactsApi(configuration);
        _transactionalEmailsApi = new TransactionalEmailsApi(configuration);
    }

    public async Task SendInvitation(string email, InvitationEmail invitation, CancellationToken cancellationToken)
    {
        await SendTemplate(email, new TemplateParameters
        {
            Subject = "You've been invited to Mjölksyra!",
            Preview = $"{invitation.Coach.DisplayName} has invited you to Mjölksyra, the platform for online coaching.",
            Title = "You've been invited to Mjölksyra!",
            Body = $"""
                    Your coach <strong>{invitation.Coach.DisplayName}</strong> has invited you to Mjölksyra, the platform for online coaching. 
                    {invitation.Coach.DisplayName} will be able to create training plans, log workouts and communicate with you through the platform. 
                    {invitation.PriceSek} kr/month. Click the button below to accept the invitation and create your account.
                    <br/>
                    {(invitation.Athlete is not null ? "Login to account with" : "Create account with")} email <strong>{email}</strong> to accept invitation.
                    """,
            ButtonText = "Accept invitation",
            ButtonLink = "https://mjolksyra.com"
        });
    }

    public Task SendInvitationAcceptedToCoach(string email, InvitationStatusEmail emailModel, CancellationToken cancellationToken)
        => SendTemplate(email, new TemplateParameters
        {
            Subject = "Invitation accepted",
            Preview = $"{emailModel.Athlete.DisplayName} accepted your invitation to Mjölksyra!",
            Title = "Invitation accepted",
            Body = $"""
                    Your athlete <strong>{emailModel.Athlete.DisplayName}</strong> accepted your invitation to Mjölksyra! 
                    You can now create training plans, log workouts and communicate with {emailModel.Athlete.DisplayName} through the platform. 
                    {emailModel.PriceSek} kr/month.
                    """,
            ButtonText = "View athlete profile",
            ButtonLink = "https://mjolksyra.com/app/coach/athletes"
        });

    public Task SendInvitationDeclinedToCoach(string email, InvitationStatusEmail emailModel, CancellationToken cancellationToken)
        => SendTemplate(email, new TemplateParameters
        {
            Subject = "Invitation declined",
            Preview = $"{emailModel.Athlete.DisplayName} declined your invitation to Mjölksyra",
            Title = "Invitation declined",
            Body = $"""
                    Your athlete <strong>{emailModel.Athlete.DisplayName}</strong> declined your invitation to Mjölksyra. 
                    You can still invite {emailModel.Athlete.DisplayName} again or share the link to Mjölksyra with them.
                    """,
            ButtonText = null,
            ButtonLink = null
        });

    public Task SendPaymentMethodRequiredToAthlete(string email, AthleteBillingEmail emailModel, CancellationToken cancellationToken)
        => SendTemplate(email, new TemplateParameters
        {
            Subject = "Payment method required",
            Preview = "Set up your payment method to start coaching with Mjölksyra",
            Title = "Payment method required",
            Body = $"""
                    Your coach <strong>{emailModel.Coach.DisplayName}</strong> invited you to Mjölksyra! 
                    To start coaching, please set up your payment method. 
                    {emailModel.PriceSek} kr/month.
                    """,
            ButtonText = "Set up payment method",
            ButtonLink = "https://mjolksyra.com/app/athlete"
        });

    public Task SendPaymentSucceededToAthlete(string email, AthleteBillingEmail emailModel, CancellationToken cancellationToken)
        => SendTemplate(email, new TemplateParameters
        {
            Subject = "Payment succeeded",
            Preview = "Your payment to Mjölksyra succeeded",
            Title = "Payment succeeded",
            Body = $"""
                    Your coach <strong>{emailModel.Coach.DisplayName}</strong> charged you {emailModel.PriceSek} kr for this month. 
                    Next charge date is {emailModel.NextChargeDate}.
                    """,
            ButtonText = null,
            ButtonLink = null
        });

    public Task SendPaymentFailedToAthlete(string email, AthleteBillingEmail emailModel, CancellationToken cancellationToken)
        => SendTemplate(email, new TemplateParameters
        {
            Subject = "Payment failed",
            Preview = "Your payment to Mjölksyra failed",
            Title = "Payment failed",
            Body = $"""
                    Your coach <strong>{emailModel.Coach.DisplayName}</strong> tried to charge you {emailModel.PriceSek} kr for this month, but the payment failed. 
                    Update your payment method to continue coaching with {emailModel.Coach.DisplayName}.
                    """,
            ButtonText = "Update payment method",
            ButtonLink = "https://mjolksyra.com/app/athlete"
        });

    public Task SendPaymentFailedToCoach(string email, AthleteBillingEmail emailModel, CancellationToken cancellationToken)
        => SendTemplate(email, new TemplateParameters
        {
            Subject = "Athlete payment failed",
            Preview = "An attempted payment from your athlete failed",
            Title = "Athlete payment failed",
            Body = $"""
                    Your athlete <strong>{emailModel.Athlete.DisplayName}</strong> had a failed payment of {emailModel.PriceSek} kr for this month. 
                    The athlete needs to update their payment method to continue coaching.
                    """,
            ButtonText = "View athlete profile",
            ButtonLink = "https://mjolksyra.com/app/coach/athletes"
        });

    public Task SendPriceChangedToAthlete(string email, AthleteBillingEmail emailModel, CancellationToken cancellationToken)
        => SendTemplate(email, new TemplateParameters
        {
            Subject = "Price changed",
            Preview = "Your coach changed the coaching price",
            Title = "Price changed",
            Body = $"""
                    Your coach <strong>{emailModel.Coach.DisplayName}</strong> changed the coaching price to {emailModel.PriceSek} kr/month. 
                    Next charge date is {emailModel.NextChargeDate}.
                    """,
            ButtonText = "View your coaching",
            ButtonLink = "https://mjolksyra.com/app/athlete"
        });

    public Task SendChargeNowToAthlete(string email, AthleteBillingEmail emailModel, CancellationToken cancellationToken)
        => SendTemplate(email, new TemplateParameters
        {
            Subject = $"Receipt from {emailModel.Coach.DisplayName}",
            Preview = $"Your coach {emailModel.Coach.DisplayName} charged you immediately for this month...",
            Title = $"Receipt from {emailModel.Coach.DisplayName}",
            Body = $"""
                    Your coach <strong>{emailModel.Coach.DisplayName}</strong> charged you immediately for this month ({emailModel.PriceSek} kr). 
                    Next charge date is {emailModel.NextChargeDate}.
                    """,
            ButtonText = "View your receipt",
            ButtonLink = emailModel.ReceiptUrl
        });

    public Task SendRelationshipCancelled(string email, RelationshipCancelledEmail emailModel, CancellationToken cancellationToken)
        => SendTemplate(email, new TemplateParameters
        {
            Subject = "Coaching relationship cancelled",
            Preview = "A coaching relationship was cancelled",
            Title = "Coaching relationship cancelled",
            Body = $"""
                    The coaching relationship between <strong>{emailModel.Coach.DisplayName}</strong> and <strong>{emailModel.Athlete.DisplayName}</strong> was cancelled by {emailModel.CancelledBy switch {
                        UserRole.Athlete => "athlete",
                        UserRole.Coach => "coach",
                        _ => throw new ArgumentOutOfRangeException() }}.
                    """,
            ButtonText = "View your profile",
            ButtonLink = "https://mjolksyra.com/app"
        });

    public Task SendCoachStripeStatusToCoach(string email, CoachStripeStatusEmail emailModel, CancellationToken cancellationToken)
        => SendTemplate(email, new TemplateParameters
        {
            Subject = "Stripe account status",
            Preview = "Your Stripe account status has been updated",
            Title = "Stripe account status",
            Body = $"""
                    Your Stripe account status is now: <strong>{emailModel.Status switch
                    {
                        StripeStatus.RequiresPaymentMethod => "Payment method required",
                        StripeStatus.RequiresConfirmation => "Confirmation required",
                        StripeStatus.Processing => "Processing",
                        StripeStatus.Succeeded => "Succeeded",
                        StripeStatus.RequiresAction => "Action required",
                        StripeStatus.Canceled => "Canceled",
                        _ => "Unknown"
                    }}</strong>. 
                    {emailModel.Status switch
                    {
                        StripeStatus.RequiresPaymentMethod => "A payment method is required to continue your Stripe setup. Add or update your payment details to receive coaching payments.",
                        StripeStatus.RequiresConfirmation => "Your Stripe setup needs confirmation. Please review and confirm the required account details.",
                        StripeStatus.Processing => "Stripe is currently processing your account update. We'll notify you when processing is complete.",
                        StripeStatus.Succeeded => "Your account is active and ready to receive coaching payments.",
                        StripeStatus.RequiresAction => "Stripe requires additional action on your account. Complete the requested steps to activate payouts.",
                        StripeStatus.Canceled => "The Stripe setup flow was canceled. Restart the setup to begin receiving coaching payments.",
                        _ => "Your Stripe account status changed. Log in to review your account details."
                    }}
                    """,
            ButtonText = "Login",
            ButtonLink = "https://mjolksyra.com/app"
        });

    public Task SendClerkInvitation(string email, ClerkInvitationEmail emailModel, CancellationToken cancellationToken)
        => SendTemplate(email, new TemplateParameters
        {
            Subject = "You're invited to Mjolksyra",
            Preview = "You have a pending invitation to start coaching on Mjolksyra.",
            Title = "You're invited to Mjolksyra",
            Body = $"""
                    You have a pending invitation on Mjolksyra.
                    Sign in with email <strong>{email}</strong> to continue.
                    """,
            ButtonText = "Sign in to accept",
            ButtonLink = emailModel.SignInLink
        });

    public Task SendClerkInvitationAccepted(string email, ClerkInvitationAcceptedEmail emailModel, CancellationToken cancellationToken)
        => SendTemplate(email, new TemplateParameters
        {
            Subject = "Thank you for accepting your invitation",
            Preview = "Your Mjolksyra invitation is accepted and your account is ready.",
            Title = "Thank you for joining Mjolksyra",
            Body = """
                   Your invitation has been accepted.
                   You can now open the app and continue your coaching setup.
                   """,
            ButtonText = "Open app",
            ButtonLink = emailModel.AppLink
        });

    public async Task SignUp(string email, CancellationToken cancellationToken)
    {
        await _contactsApi.CreateContactAsync(new CreateContact
        {
            Email = email
        });
    }

    private async Task SendTemplate(string email, TemplateParameters parameters)
    {
        await _transactionalEmailsApi.SendTransacEmailAsync(new SendSmtpEmail
        {
            To =
            [
                new SendSmtpEmailTo(email)
            ],
            TemplateId = 5,
            Params = parameters
        });
    }
}
