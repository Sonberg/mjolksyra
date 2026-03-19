using Mjolksyra.Domain.Database.Enum;

namespace Mjolksyra.Domain.Database.Models;

public class AiCreditLedger
{
    public Guid Id { get; set; }
    public Guid CoachUserId { get; set; }
    public AiCreditAction? Action { get; set; }
    public AiCreditLedgerType Type { get; set; }
    public int IncludedCreditsChanged { get; set; }
    public int PurchasedCreditsChanged { get; set; }
    public string? ReferenceId { get; set; }
    public string? IdempotencyKey { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
