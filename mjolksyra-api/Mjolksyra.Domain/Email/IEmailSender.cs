namespace Mjolksyra.Domain.Email;

public class InvitationEmail
{
    public required string CoachName { get; set; }

    public required string Token { get; set; }
}

public interface IEmailSender
{
    Task SendInvitation(string email, InvitationEmail invitation, CancellationToken cancellationToken);
}