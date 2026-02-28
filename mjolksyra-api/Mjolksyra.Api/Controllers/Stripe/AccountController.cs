using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using Mjolksyra.Api.Common.UserEvents;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.Coaches.EnsureCoachPlatformSubscription;
using Stripe;

namespace Mjolksyra.Api.Controllers.Stripe;

public class AccountLinkPostBody
{
    public required string AccountId { get; set; }

    public required string BaseUrl { get; set; }
}

public class AccountSyncResponse
{
    public required bool HasAccount { get; set; }

    public required bool Completed { get; set; }

    public string? Status { get; set; }

    public string? Message { get; set; }
}

[Authorize]
[ApiController]
[Route("api/stripe/account")]
public class AccountController : Controller
{
    private readonly IStripeClient _stripeClient;

    private readonly IUserContext _userContext;

    private readonly IUserRepository _userRepository;
    private readonly ITraineeRepository _traineeRepository;
    private readonly IUserEventPublisher _userEvents;
    private readonly IMediator _mediator;

    public AccountController(
        IStripeClient stripeClient,
        IUserContext userContext,
        IUserRepository userRepository,
        ITraineeRepository traineeRepository,
        IUserEventPublisher userEvents,
        IMediator mediator)
    {
        _stripeClient = stripeClient;
        _userContext = userContext;
        _userRepository = userRepository;
        _traineeRepository = traineeRepository;
        _userEvents = userEvents;
        _mediator = mediator;
    }

    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<ActionResult> Get(string id)
    {
        var linkService = new AccountLoginLinkService(_stripeClient);
        var accountService = new AccountService(_stripeClient);
        //var loginLink = await linkService.CreateAsync(id);
        var account = await accountService.GetAsync(id);

        return Ok(account);
    }

    [HttpPost]
    public async Task<ActionResult> Create(CancellationToken cancellationToken)
    {
        try
        {
            var user = await _userContext.GetUser(cancellationToken);
            if (user?.Coach?.Stripe?.AccountId is { } accountId)
            {
                return Json(new
                {
                    accountId
                });
            }

            var service = new AccountService(_stripeClient);
            var options = new AccountCreateOptions
            {
                Controller = new AccountControllerOptions
                {
                    StripeDashboard = new AccountControllerStripeDashboardOptions
                    {
                        Type = "express"
                    },
                    Fees = new AccountControllerFeesOptions
                    {
                        Payer = "application"
                    },
                    Losses = new AccountControllerLossesOptions
                    {
                        Payments = "application"
                    },
                },
                Capabilities = new AccountCapabilitiesOptions
                {
                    CardPayments = new AccountCapabilitiesCardPaymentsOptions
                    {
                        Requested = true,
                    },
                    Transfers = new AccountCapabilitiesTransfersOptions
                    {
                        Requested = true,
                    },
                    KlarnaPayments = new AccountCapabilitiesKlarnaPaymentsOptions
                    {
                        Requested = true
                    }
                },
                Country = "SE",
                Email = user!.Email,
                Metadata = new Dictionary<string, string>
                {
                    {
                        "UserId", user.Id.ToString()
                    }
                }
            };

            var account = await service.CreateAsync(options, null, cancellationToken);

            user.Coach ??= new UserCoach();
            user.Coach.Stripe ??= new UserCoachStripe();
            user.Coach.Stripe.AccountId = account.Id;
            user.Coach.Stripe.Status = StripeStatus.RequiresAction;
            user.Coach.Stripe.Message = "Please complete the onboarding process";

            await _userRepository.Update(user, cancellationToken);
            await _userEvents.Publish(user.Id, "user.updated", new
            {
                scope = "coach-stripe",
                status = user.Coach.Stripe.Status.ToString()
            }, cancellationToken);

            return Json(new
            {
                accountId = account.Id
            });
        }
        catch (Exception ex)
        {
            Console.Write("An error occurred when calling the Stripe API to create an account:  " + ex.Message);
            Response.StatusCode = 500;
            return Json(new
            {
                error = ex.Message
            });
        }
    }

    [HttpPost("link")]
    public async Task<ActionResult> Link([FromBody] AccountLinkPostBody body)
    {
        try
        {
            var accountId = body.AccountId;
            var service = new AccountLinkService(_stripeClient);

            var accountLink = await service.CreateAsync(
                new AccountLinkCreateOptions
                {
                    Account = accountId,
                    ReturnUrl = $"{body.BaseUrl}/app/coach",
                    RefreshUrl = $"{body.BaseUrl}/account/refresh/{accountId}",
                    Type = "account_onboarding",
                }
            );

            return Json(new
            {
                url = accountLink.Url
            });
        }
        catch (Exception ex)
        {
            Console.Write("An error occurred when calling the Stripe API to create an account link:  " + ex.Message);
            Response.StatusCode = 500;
            return Json(new
            {
                error = ex.Message
            });
        }
    }

    [HttpPost("sync")]
    public async Task<ActionResult<AccountSyncResponse>> Sync(CancellationToken cancellationToken)
    {
        var user = await _userContext.GetUser(cancellationToken);
        if (user?.Coach?.Stripe?.AccountId is not { } accountId)
        {
            return Ok(new AccountSyncResponse
            {
                HasAccount = false,
                Completed = false,
            });
        }

        var service = new AccountService(_stripeClient);
        var account = await service.GetAsync(accountId, cancellationToken: cancellationToken);
        var status = MapCoachStripeStatus(account);
        var message = account.Requirements?.CurrentlyDue?.Count > 0
            ? "Please complete the onboarding process"
            : "Onboarding completed";

        user.Coach ??= new UserCoach();
        user.Coach.Stripe ??= new UserCoachStripe();
        user.Coach.Stripe.AccountId = account.Id;
        user.Coach.Stripe.Status = status;
        user.Coach.Stripe.Message = message;

        await _userRepository.Update(user, cancellationToken);
        await _userEvents.Publish(user.Id, "user.updated", new
        {
            scope = "coach-stripe",
            status = user.Coach.Stripe.Status.ToString()
        }, cancellationToken);

        if (status == StripeStatus.Succeeded)
        {
            await _mediator.Send(new EnsureCoachPlatformSubscriptionCommand(user.Id), cancellationToken);
        }

        return Ok(new AccountSyncResponse
        {
            HasAccount = true,
            Completed = status == StripeStatus.Succeeded,
            Status = status.ToString(),
            Message = message,
        });
    }

    [HttpDelete]
    public async Task<ActionResult> Delete(CancellationToken cancellationToken)
    {
        var user = await _userContext.GetUser(cancellationToken);
        if (user is null) return Unauthorized();
        if (user.Coach is null) return NoContent();

        var trainees = await _traineeRepository.Get(user.Id, cancellationToken);
        var activeCoachTrainees = trainees
            .Where(t => t.CoachUserId == user.Id && t.Status == TraineeStatus.Active)
            .ToList();

        var subscriptionService = new SubscriptionService(_stripeClient);
        foreach (var trainee in activeCoachTrainees)
        {
            if (trainee.StripeSubscriptionId is not null)
            {
                await subscriptionService.CancelAsync(trainee.StripeSubscriptionId, cancellationToken: cancellationToken);
                trainee.StripeSubscriptionId = null;
            }

            trainee.Status = TraineeStatus.Cancelled;
            trainee.DeletedAt = DateTimeOffset.UtcNow;
            await _traineeRepository.Update(trainee, cancellationToken);
        }

        user.Coach = null;
        await _userRepository.Update(user, cancellationToken);
        await _userEvents.Publish(user.Id, "user.updated", new
        {
            scope = "coach-offboard"
        }, cancellationToken);

        return NoContent();
    }

    private static StripeStatus MapCoachStripeStatus(Account account) =>
        account.PayoutsEnabled && (account.Requirements?.CurrentlyDue?.Count ?? 0) == 0
            ? StripeStatus.Succeeded
            : StripeStatus.RequiresAction;
}
