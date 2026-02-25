using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.Api.Common.UserEvents;
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
    private readonly IUserEventPublisher _userEvents;

    public SetupIntentController(
        IStripeClient stripeClient,
        IUserContext userContext,
        IUserRepository userRepository,
        IUserEventPublisher userEvents)
    {
        _stripeClient = stripeClient;
        _userContext = userContext;
        _userRepository = userRepository;
        _userEvents = userEvents;
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
                    "UserId", await _userContext
                        .GetUserId(cancellationToken)
                        .ContinueWith(x => x.Result!.Value.ToString(), cancellationToken)
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

    [HttpPost("sync")]
    public async Task<ActionResult> Sync([FromBody] SyncSetupIntentRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.SetupIntentId))
        {
            return BadRequest();
        }

        var user = await _userContext.GetUser(cancellationToken);
        if (user?.Athlete?.Stripe?.CustomerId is not { } customerId)
        {
            return BadRequest();
        }

        var setupIntentService = new SetupIntentService(_stripeClient);
        var setupIntent = await setupIntentService.GetAsync(request.SetupIntentId, cancellationToken: cancellationToken);

        if (setupIntent.CustomerId != customerId)
        {
            return Forbid();
        }

        user.Athlete ??= new UserAthlete();
        user.Athlete.Stripe ??= new UserAthleteStripe();

        user.Athlete.Stripe.Status = setupIntent.Status switch
        {
            "succeeded" => Domain.Database.Enum.StripeStatus.Succeeded,
            "processing" => Domain.Database.Enum.StripeStatus.Processing,
            "requires_action" => Domain.Database.Enum.StripeStatus.RequiresAction,
            "requires_confirmation" => Domain.Database.Enum.StripeStatus.RequiresConfirmation,
            "canceled" => Domain.Database.Enum.StripeStatus.Canceled,
            _ => Domain.Database.Enum.StripeStatus.RequiresPaymentMethod,
        };
        user.Athlete.Stripe.PaymentMethodId = setupIntent.PaymentMethodId ?? user.Athlete.Stripe.PaymentMethodId;
        user.Athlete.Stripe.Message = setupIntent.LastSetupError?.Message;

        await _userRepository.Update(user, cancellationToken);
        await _userEvents.Publish(user.Id, "user.updated", new
        {
            scope = "athlete-stripe",
            status = user.Athlete.Stripe.Status.ToString()
        }, cancellationToken);

        return Ok(new
        {
            status = setupIntent.Status,
            paymentMethodId = setupIntent.PaymentMethodId,
            completed = setupIntent.Status == "succeeded"
        });
    }

    private async Task<string> GetCustomerId(CancellationToken cancellationToken)
    {
        var user = await _userContext.GetUser(cancellationToken);
        if (user?.Athlete?.Stripe?.CustomerId is { } customerId)
        {
            return customerId;
        }

        var service = new CustomerService(_stripeClient);
        var options = new CustomerCreateOptions
        {
            Email = user!.Email,
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

public class SyncSetupIntentRequest
{
    public required string SetupIntentId { get; set; }
}
