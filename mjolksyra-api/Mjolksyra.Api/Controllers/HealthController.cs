using Microsoft.AspNetCore.Mvc;

namespace Mjolksyra.Api.Controllers;

[ApiController]
[Route("health")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public ActionResult Get()
    {
        return Ok(new { status = "ok" });
    }
}
