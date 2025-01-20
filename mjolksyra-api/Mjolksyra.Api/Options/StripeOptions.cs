namespace Mjolksyra.Api.Options;

public class StripeOptions
{
    public static string SectionName = "Stripe";

    public required string ApiKey { get; set; }

    public required string WebhookSecret { get; set; }
}