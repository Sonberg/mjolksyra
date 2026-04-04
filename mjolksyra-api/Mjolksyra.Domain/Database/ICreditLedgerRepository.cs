using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Database;

public interface ICreditLedgerRepository
{
    Task Append(CreditLedger entry, CancellationToken ct);
}
