using Mjolksyra.Domain.Database.Enum;

namespace Mjolksyra.UseCases.Coaches.GetCreditLedger;

public class CreditLedgerItemResponse
{
    public Guid Id { get; set; }

    public CreditLedgerType Type { get; set; }

    public CreditAction? Action { get; set; }

    public int IncludedCreditsChanged { get; set; }

    public int PurchasedCreditsChanged { get; set; }

    public string? ReferenceId { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}
