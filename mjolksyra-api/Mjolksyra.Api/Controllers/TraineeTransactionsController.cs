using MediatR;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.UseCases.Trainees;
using Mjolksyra.UseCases.Trainees.GetTraineeTransactions;

namespace Mjolksyra.Api.Controllers;

[ApiController]
[Route("api/trainees/{traineeId:guid}/transactions")]
public class TraineeTransactionsController(IMediator mediator) : Controller
{
    [HttpGet]
    public async Task<ActionResult<ICollection<TraineeTransactionResponse>>> GetAll(
        Guid traineeId, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new GetTraineeTransactionsRequest { TraineeId = traineeId }, cancellationToken);

        if (result is null) return NoContent();
        return Ok(result);
    }
}
