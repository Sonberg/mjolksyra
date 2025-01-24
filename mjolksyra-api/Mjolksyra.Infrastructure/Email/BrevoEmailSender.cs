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

    public BrevoEmailSender(IOptions<BrevoOptions> options)
    {
        var configuration = new Configuration
        {
            ApiKey = new Dictionary<string, string>
            {
                {
                    "api-key", options.Value.ApiKey
                }
            }
        };

        _contactsApi = new ContactsApi(configuration);
        _transactionalEmailsApi = new TransactionalEmailsApi(configuration);
    }

    public async Task SendInvitation(string email, InvitationEmail invitation, CancellationToken cancellationToken)
    {
        await _transactionalEmailsApi.SendTransacEmailAsync(new SendSmtpEmail
        {
            TemplateId = 1,
            Params = invitation
        });
    }

    public async Task SignUp(string email, CancellationToken cancellationToken)
    {
        await _contactsApi.CreateContactAsync(new CreateContact
        {
            Email = email
        });
    }
}