namespace Mjolksyra.Domain.Clerk;

public class ClerkOptions
{
    public const string SectionName = "Clerk";

    public required string Domain { get; set; }

    public required string SecretKey { get; set; }

    public string? WebhookSecret { get; set; }
}
