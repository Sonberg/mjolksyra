using Mjolksyra.Domain.Database.Enum;

namespace Mjolksyra.Domain.Database.Models;

public class CreditLedger
{
    public Guid Id { get; set; }
    public Guid CoachUserId { get; set; }
    public CreditAction? Action { get; set; }
    public CreditLedgerType Type { get; set; }
    public int IncludedCreditsChanged { get; set; }
    public int PurchasedCreditsChanged { get; set; }
    public string? ReferenceId { get; set; }
    public string? IdempotencyKey { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
