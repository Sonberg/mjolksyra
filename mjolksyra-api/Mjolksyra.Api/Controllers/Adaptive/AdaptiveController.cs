using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.Adaptive.GenerateSurpriseBlock;

namespace Mjolksyra.Api.Controllers.Adaptive;

[Authorize]
[ApiController]
[Route("api/adaptive")]
public class AdaptiveController(IMediator mediator, IUserContext userContext) : Controller
{
    [HttpPost("trainees/{traineeId:guid}/blocks/surprise")]
    public async Task<ActionResult<GenerateSurpriseBlockResponse>> GenerateSurpriseBlock(
        Guid traineeId,
        CancellationToken cancellationToken)
    {
        if (await userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return Unauthorized();
        }

        var result = await mediator.Send(new GenerateSurpriseBlockCommand
        {
            TraineeId = traineeId,
            AthleteUserId = userId,
        }, cancellationToken);

        return Ok(result);
    }
}
