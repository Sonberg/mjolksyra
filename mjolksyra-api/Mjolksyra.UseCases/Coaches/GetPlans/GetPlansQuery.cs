using MediatR;

namespace Mjolksyra.UseCases.Coaches.GetPlans;

public record GetPlansQuery : IRequest<List<PlanResponse>>;
