using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.Coaches.ResetUserCredits;

public class ResetUserCreditsCommandHandler(
    IUserRepository userRepository,
    IPlanRepository planRepository,
    IUserCreditsRepository creditsRepository,
    ICreditLedgerRepository ledgerRepository)
    : IRequestHandler<ResetUserCreditsCommand>
{
    public async Task Handle(ResetUserCreditsCommand request, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetById(request.CoachUserId, cancellationToken);
        var planId = user.Coach?.Stripe?.PlanId ?? Plan.StarterPlanId;
        var plan = await planRepository.GetById(planId, cancellationToken)
            ?? await planRepository.GetById(Plan.StarterPlanId, cancellationToken);

        var includedCredits = plan?.IncludedCreditsPerCycle ?? 25;
        var existing = await creditsRepository.GetByCoachUserId(request.CoachUserId, cancellationToken);
        var now = DateTimeOffset.UtcNow;

        if (existing is null)
        {
            await creditsRepository.Create(new UserCredits
            {
                Id = Guid.NewGuid(),
                CoachUserId = request.CoachUserId,
                IncludedRemaining = includedCredits,
                PurchasedRemaining = 0,
                LastResetAt = now,
                Version = 0,
            }, cancellationToken);
        }
        else
        {
            existing.IncludedRemaining = includedCredits;
            existing.LastResetAt = now;
            existing.Version++;
            await creditsRepository.Upsert(existing, cancellationToken);
        }

        await ledgerRepository.Append(new CreditLedger
        {
            Id = Guid.NewGuid(),
            CoachUserId = request.CoachUserId,
            Type = CreditLedgerType.Reset,
            IncludedCreditsChanged = includedCredits,
            PurchasedCreditsChanged = 0,
            CreatedAt = now,
        }, cancellationToken);
    }
}
