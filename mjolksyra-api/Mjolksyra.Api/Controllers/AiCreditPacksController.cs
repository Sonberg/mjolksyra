using MediatR;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.Domain.Database;

namespace Mjolksyra.Api.Controllers;

[ApiController]
[Route("api/ai-credit-packs")]
public class AiCreditPacksController(IAiCreditPackRepository packRepository) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AiCreditPackResponse>>> GetAll(CancellationToken ct)
    {
        var packs = await packRepository.GetAll(ct);
        return Ok(packs.Select(p => new AiCreditPackResponse
        {
            Id = p.Id,
            Name = p.Name,
            Credits = p.Credits,
            PriceSek = p.PriceSek,
        }));
    }
}

public class AiCreditPackResponse
{
    public required Guid Id { get; set; }
    public required string Name { get; set; }
    public required int Credits { get; set; }
    public required int PriceSek { get; set; }
}
