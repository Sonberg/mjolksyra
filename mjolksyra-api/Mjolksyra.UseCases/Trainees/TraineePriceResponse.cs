namespace Mjolksyra.UseCases.Trainees;

public class TraineePriceResponse
{
    public required string Currency { get; set; }

    public required decimal Amount { get; set; }
}