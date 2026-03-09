namespace Mjolksyra.Infrastructure.Email;

public class BrevoOptions
{
    public const string SectionName = "Brevo";

    public required string ApiKey { get; set; }
}