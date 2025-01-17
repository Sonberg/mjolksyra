using brevo_csharp.Api;
using brevo_csharp.Client;
using brevo_csharp.Model;
using Microsoft.Extensions.Options;
using Mjolksyra.Domain.Email;
using Task = System.Threading.Tasks.Task;

namespace Mjolksyra.Infrastructure.Email;

public class BrevoEmailSender : IEmailSender
{
    private readonly TransactionalEmailsApi _api;

    public BrevoEmailSender(IOptions<BrevoOptions> options)
    {
        _api = new TransactionalEmailsApi(new Configuration
        {
            ApiKey = new Dictionary<string, string>
            {
                {
                    "api-key", options.Value.ApiKey
                }
            }
        });
    }

    public async Task SendInvitation(string email, InvitationEmail invitation, CancellationToken cancellationToken)
    {
        await _api.SendTransacEmailAsync(new SendSmtpEmail
        {
            TemplateId = 1,
            Params = invitation
        });
    }
}