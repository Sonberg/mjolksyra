namespace Mjolksyra.UseCases.Trainees;

public class TraineeTransactionResponse
{
    public required Guid Id { get; set; }

    public required string Status { get; set; }

    public required int Amount { get; set; }

    public required string Currency { get; set; }

    public required DateTimeOffset CreatedAt { get; set; }
}
