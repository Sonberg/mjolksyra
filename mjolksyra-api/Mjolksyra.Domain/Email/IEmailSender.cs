namespace Mjolksyra.Domain.Email;

public class InvitationEmail
{
    public required string Coach { get; set; }

    public required string Text { get; set; }

    public required string Link { get; set; }
}

public interface IEmailSender
{
    Task SendInvitation(string email, InvitationEmail invitation, CancellationToken cancellationToken);

    Task SignUp(string email, CancellationToken cancellationToken);
}