using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Database;

public interface IAiCreditLedgerRepository
{
    Task Append(AiCreditLedger entry, CancellationToken ct);
}
