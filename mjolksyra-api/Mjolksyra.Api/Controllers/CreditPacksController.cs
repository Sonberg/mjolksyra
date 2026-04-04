using Microsoft.AspNetCore.Mvc;
using Mjolksyra.Domain.Database;

namespace Mjolksyra.Api.Controllers;

[ApiController]
[Route("api/credit-packs")]
public class CreditPacksController(ICreditPackRepository packRepository) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CreditPackResponse>>> GetAll(CancellationToken ct)
    {
        var packs = await packRepository.GetAll(ct);
        return Ok(packs
            .Where(x => x.IsActive)
            .Select(p => new CreditPackResponse
            {
                Id = p.Id,
                Name = p.Name,
                Credits = p.Credits,
                PriceSek = p.PriceSek,
            }));
    }
}

public class CreditPackResponse
{
    public required Guid Id { get; set; }

    public required string Name { get; set; }

    public required int Credits { get; set; }

    public required int PriceSek { get; set; }
}
