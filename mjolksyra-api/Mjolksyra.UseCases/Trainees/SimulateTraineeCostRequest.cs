using MediatR;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.UseCases.Common.Extensions;

namespace Mjolksyra.UseCases.Trainees;

public class SimulateTraineeCostResponse : TraineeTransactionCost
{
    public static SimulateTraineeCostResponse From(int amount)
    {
        var cost = TraineeTransactionCost.From(new TraineeCost
        {
            Amount = amount
        });

        return new SimulateTraineeCostResponse
        {
            ApplicationFee = cost.ApplicationFee,
            Coach = cost.Coach,
            Total = cost.Total
        };
    }
}

public class SimulateTraineeCostRequest : IRequest<SimulateTraineeCostResponse>
{
    public int Amount { get; set; }
}

public class SimulateTraineeCostRequestHandler : IRequestHandler<SimulateTraineeCostRequest, SimulateTraineeCostResponse>
{
    public Task<SimulateTraineeCostResponse> Handle(SimulateTraineeCostRequest request, CancellationToken cancellationToken)
    {
        return SimulateTraineeCostResponse.From(request.Amount).AsTask();
    }
}