namespace Mjolksyra.UseCases.Trainees;

public class TraineeBillingResponse
{
    public required TraineeBillingStatus Status { get; set; }

    public required bool HasPrice { get; set; }

    public required bool HasSubscription { get; set; }

    public required DateTimeOffset? LastChargedAt { get; set; }

    public required DateTimeOffset? NextChargedAt { get; set; }
}
