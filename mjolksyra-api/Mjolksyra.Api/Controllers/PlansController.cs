using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.UseCases.Coaches.GetPlans;

namespace Mjolksyra.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/plans")]
public class PlansController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetPlans(CancellationToken ct)
    {
        var result = await mediator.Send(new GetPlansQuery(), ct);
        return Ok(result);
    }
}
