using brevo_csharp.Api;
using brevo_csharp.Client;
using brevo_csharp.Model;
using Microsoft.Extensions.Options;
using Mjolksyra.Domain.Email;
using Task = System.Threading.Tasks.Task;

namespace Mjolksyra.Infrastructure.Email;

public class BrevoEmailSender : IEmailSender
{
    private readonly TransactionalEmailsApi _transactionalEmailsApi;

    private readonly ContactsApi _contactsApi;
    private readonly BrevoOptions _options;

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
        await SendTemplate(email, _options.InvitationTemplateId, new
        {
            COACH = invitation.Coach,
            TEXT = invitation.Text,
            LINK = invitation.Link,
            EMAIL = invitation.Email ?? email,
            PRICE_SEK = invitation.PriceSek
        });
    }

    public Task SendInvitationAcceptedToCoach(string email, InvitationStatusEmail emailModel, CancellationToken cancellationToken)
        => SendTemplate(email, _options.InvitationAcceptedCoachTemplateId, new
        {
            COACH = emailModel.Coach,
            ATHLETE = emailModel.Athlete,
            EMAIL = emailModel.Email,
            PRICE_SEK = emailModel.PriceSek
        });

    public Task SendInvitationDeclinedToCoach(string email, InvitationStatusEmail emailModel, CancellationToken cancellationToken)
        => SendTemplate(email, _options.InvitationDeclinedCoachTemplateId, new
        {
            COACH = emailModel.Coach,
            ATHLETE = emailModel.Athlete,
            EMAIL = emailModel.Email,
            PRICE_SEK = emailModel.PriceSek
        });

    public Task SendPaymentMethodRequiredToAthlete(string email, AthleteBillingEmail emailModel, CancellationToken cancellationToken)
        => SendTemplate(email, _options.PaymentMethodRequiredAthleteTemplateId, new
        {
            COACH = emailModel.Coach,
            ATHLETE = emailModel.Athlete,
            EMAIL = emailModel.Email,
            PRICE_SEK = emailModel.PriceSek,
            LINK = emailModel.Link
        });

    public Task SendPaymentSucceededToAthlete(string email, AthleteBillingEmail emailModel, CancellationToken cancellationToken)
        => SendTemplate(email, _options.PaymentSucceededAthleteTemplateId, new
        {
            COACH = emailModel.Coach,
            ATHLETE = emailModel.Athlete,
            EMAIL = emailModel.Email,
            PRICE_SEK = emailModel.PriceSek,
            DATE = emailModel.Date,
            NEXT_CHARGE_DATE = emailModel.NextChargeDate
        });

    public Task SendPaymentFailedToAthlete(string email, AthleteBillingEmail emailModel, CancellationToken cancellationToken)
        => SendTemplate(email, _options.PaymentFailedAthleteTemplateId, new
        {
            COACH = emailModel.Coach,
            ATHLETE = emailModel.Athlete,
            EMAIL = emailModel.Email,
            PRICE_SEK = emailModel.PriceSek,
            LINK = emailModel.Link,
            REASON = emailModel.Reason
        });

    public Task SendPaymentFailedToCoach(string email, AthleteBillingEmail emailModel, CancellationToken cancellationToken)
        => SendTemplate(email, _options.PaymentFailedCoachTemplateId, new
        {
            COACH = emailModel.Coach,
            ATHLETE = emailModel.Athlete,
            EMAIL = emailModel.Email,
            PRICE_SEK = emailModel.PriceSek,
            REASON = emailModel.Reason
        });

    public Task SendPriceChangedToAthlete(string email, AthleteBillingEmail emailModel, CancellationToken cancellationToken)
        => SendTemplate(email, _options.PriceChangedAthleteTemplateId, new
        {
            COACH = emailModel.Coach,
            ATHLETE = emailModel.Athlete,
            EMAIL = emailModel.Email,
            PRICE_SEK = emailModel.PriceSek
        });

    public Task SendChargeNowToAthlete(string email, AthleteBillingEmail emailModel, CancellationToken cancellationToken)
        => SendTemplate(email, _options.ChargeNowAthleteTemplateId, new
        {
            COACH = emailModel.Coach,
            ATHLETE = emailModel.Athlete,
            EMAIL = emailModel.Email,
            PRICE_SEK = emailModel.PriceSek,
            DATE = emailModel.Date,
            NEXT_CHARGE_DATE = emailModel.NextChargeDate
        });

    public Task SendRelationshipCancelled(string email, RelationshipCancelledEmail emailModel, CancellationToken cancellationToken)
        => SendTemplate(email, _options.RelationshipCancelledTemplateId, new
        {
            COACH = emailModel.Coach,
            ATHLETE = emailModel.Athlete,
            CANCELLED_BY = emailModel.CancelledBy,
            EMAIL = emailModel.Email
        });

    public Task SendCoachStripeStatusToCoach(string email, CoachStripeStatusEmail emailModel, CancellationToken cancellationToken)
        => SendTemplate(email, _options.CoachStripeStatusTemplateId, new
        {
            COACH = emailModel.Coach,
            EMAIL = emailModel.Email,
            STATUS = emailModel.Status,
            MESSAGE = emailModel.Message
        });

    public async Task SignUp(string email, CancellationToken cancellationToken)
    {
        await _contactsApi.CreateContactAsync(new CreateContact
        {
            Email = email
        });
    }

    private async Task SendTemplate(string email, long? templateId, object parameters)
    {
        if (templateId is null or <= 0)
        {
            return;
        }

        await _transactionalEmailsApi.SendTransacEmailAsync(new SendSmtpEmail
        {
            To =
            [
                new SendSmtpEmailTo(email)
            ],
            TemplateId = templateId,
            Params = parameters
        });
    }
}
