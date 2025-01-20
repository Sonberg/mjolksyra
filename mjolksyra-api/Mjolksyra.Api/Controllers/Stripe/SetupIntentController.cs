using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;
using Stripe;

namespace Mjolksyra.Api.Controllers.Stripe;

// [Authorize]
[ApiController]
[Route("api/stripe/setup-intent")]
public class SetupIntentController : Controller
{
    private readonly IStripeClient _stripeClient;

    private readonly IUserContext _userContext;

    private readonly IUserRepository _userRepository;

    public SetupIntentController(
        IStripeClient stripeClient,
        IUserContext userContext,
        IUserRepository userRepository)
    {
        _stripeClient = stripeClient;
        _userContext = userContext;
        _userRepository = userRepository;
    }

    [AllowAnonymous]
    [HttpGet("{customerId}")]
    public async Task<ActionResult> Get(string customerId, CancellationToken cancellationToken)
    {
        var ss = new PaymentMethodService(_stripeClient);
        var methods = await ss.ListAsync(new PaymentMethodListOptions
        {
            Customer = customerId
        }, cancellationToken: cancellationToken);
        var service = new CustomerService(_stripeClient);
        var customer = await service.GetAsync(customerId, cancellationToken: cancellationToken);

        return Ok(new
        {
            methods,
            customer
        });
    }

    [HttpPost]
    public async Task<ActionResult> Create(CancellationToken cancellationToken)
    {
        var setupIntentOptions = new SetupIntentCreateOptions
        {
            Customer = await GetCustomerId(cancellationToken),
            Metadata = new Dictionary<string, string>
            {
                {
                    "UserId", _userContext.UserId!.Value.ToString()
                }
            }
        };
        var setupIntentService = new SetupIntentService(_stripeClient);
        var setupIntent = await setupIntentService.CreateAsync(setupIntentOptions, cancellationToken: cancellationToken);

        return Ok(new
        {
            setupIntent.ClientSecret
        });
    }

    private async Task<string> GetCustomerId(CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetById(_userContext.UserId!.Value, cancellationToken);
        if (user.Athlete?.Stripe?.CustomerId is { } customerId)
        {
            return customerId;
        }

        var service = new CustomerService(_stripeClient);
        var options = new CustomerCreateOptions
        {
            Email = user.Email,
            Name = $"{user.GivenName} {user.FamilyName}",
            Metadata = new Dictionary<string, string>
            {
                {
                    "UserId", user.Id.ToString()
                }
            }
        };

        var customer = await service.CreateAsync(options, cancellationToken: cancellationToken);

        user.Athlete ??= new UserAthlete();
        user.Athlete.Stripe ??= new UserAthleteStripe();
        user.Athlete.Stripe.CustomerId = customer.Id;

        await _userRepository.Update(user, cancellationToken);

        return customer.Id;
    }
}