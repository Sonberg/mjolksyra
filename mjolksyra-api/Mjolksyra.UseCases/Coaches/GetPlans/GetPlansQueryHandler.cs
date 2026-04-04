using MediatR;
using Mjolksyra.Domain.Database;

namespace Mjolksyra.UseCases.Coaches.GetPlans;

public class GetPlansQueryHandler(IPlanRepository planRepository) : IRequestHandler<GetPlansQuery, List<PlanResponse>>
{
    public async Task<List<PlanResponse>> Handle(GetPlansQuery request, CancellationToken cancellationToken)
    {
        var plans = await planRepository.GetAllAsync(cancellationToken);
        return plans
            .OrderBy(x => x.SortOrder)
            .Select(x => new PlanResponse
            {
                Id = x.Id,
                Name = x.Name,
                MonthlyPriceSek = x.MonthlyPriceSek,
                IncludedAthletes = x.IncludedAthletes,
                IncludedCreditsPerCycle = x.IncludedCreditsPerCycle,
                ExtraAthletePriceSek = x.ExtraAthletePriceSek,
                SortOrder = x.SortOrder,
            })
            .ToList();
    }
}
