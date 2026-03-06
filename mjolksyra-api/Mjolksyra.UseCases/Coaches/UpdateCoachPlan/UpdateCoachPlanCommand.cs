using MediatR;

namespace Mjolksyra.UseCases.Coaches.UpdateCoachPlan;

public record UpdateCoachPlanCommand(Guid UserId, Guid PlanId) : IRequest;
