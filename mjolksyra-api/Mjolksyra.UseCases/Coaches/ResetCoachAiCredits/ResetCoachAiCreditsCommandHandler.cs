using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.Coaches.ResetCoachAiCredits;

public class ResetCoachAiCreditsCommandHandler(
    IUserRepository userRepository,
    IPlanRepository planRepository,
    ICoachAiCreditsRepository creditsRepository,
    IAiCreditLedgerRepository ledgerRepository)
    : IRequestHandler<ResetCoachAiCreditsCommand>
{
    public async Task Handle(ResetCoachAiCreditsCommand request, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetById(request.CoachUserId, cancellationToken);
        var planId = user?.Coach?.Stripe?.PlanId ?? Plan.StarterPlanId;
        var plan = await planRepository.GetById(planId, cancellationToken);
        var includedCredits = plan?.IncludedAiCreditsPerCycle ?? 25;

        var existing = await creditsRepository.GetByCoachUserId(request.CoachUserId, cancellationToken);

        var now = DateTimeOffset.UtcNow;

        if (existing is null)
        {
            var newCredits = new CoachAiCredits
            {
                Id = Guid.NewGuid(),
                CoachUserId = request.CoachUserId,
                IncludedRemaining = includedCredits,
                PurchasedRemaining = 0,
                LastResetAt = now,
                Version = 0,
            };
            await creditsRepository.Create(newCredits, cancellationToken);
        }
        else
        {
            existing.IncludedRemaining = includedCredits;
            existing.LastResetAt = now;
            existing.Version++;
            await creditsRepository.Upsert(existing, cancellationToken);
        }

        await ledgerRepository.Append(new AiCreditLedger
        {
            Id = Guid.NewGuid(),
            CoachUserId = request.CoachUserId,
            Type = AiCreditLedgerType.Reset,
            IncludedCreditsChanged = includedCredits,
            PurchasedCreditsChanged = 0,
            CreatedAt = now,
        }, cancellationToken);
    }
}
