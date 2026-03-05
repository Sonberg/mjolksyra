using MediatR;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.UseCases.Baseload;

namespace Mjolksyra.Api.Controllers;

[ApiController]
[Route("api/baseload")]
public class BaseloadController(IMediator mediator) : ControllerBase
{
    [HttpGet("transactions")]
    public async Task<ActionResult<BaseloadTransactionsResponse>> Transactions(CancellationToken ct)
        => Ok(await mediator.Send(new BaseloadTransactionsRequest(), ct));
}
