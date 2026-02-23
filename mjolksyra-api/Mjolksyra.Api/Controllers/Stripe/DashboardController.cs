using Microsoft.AspNetCore.Mvc;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.UserContext;
using Stripe;

namespace Mjolksyra.Api.Controllers.Stripe;

[ApiController]
[Route("api/stripe/dashboard")]
public class DashboardController : Controller
{
    private readonly IStripeClient _stripeClient;

    private readonly IUserContext _userContext;

    private readonly IUserRepository _userRepository;

    public DashboardController(IStripeClient stripeClient, IUserContext userContext, IUserRepository userRepository)
    {
        _stripeClient = stripeClient;
        _userContext = userContext;
        _userRepository = userRepository;
    }

    [HttpGet]
    public async Task<ActionResult> Dashboard(CancellationToken cancellationToken)
    {
        if (await _userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return BadRequest();
        }

        var user = await _userRepository.GetById(userId, cancellationToken);
        if (user.Coach?.Stripe?.AccountId is not { } id)
        {
            return BadRequest();
        }

        var linkService = new AccountLoginLinkService(_stripeClient);
        var loginLink = await linkService.CreateAsync(id, cancellationToken: cancellationToken);

        return Ok(new
        {
            loginLink.Url
        });
    }
}