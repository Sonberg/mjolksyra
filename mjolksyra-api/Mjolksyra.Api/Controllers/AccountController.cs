using Microsoft.AspNetCore.Mvc;
using Stripe;

namespace Mjolksyra.Api.Controllers;

public class AccountLinkPostBody
{
    public required string Account { get; set; }

    public required string BaseUrl { get; set; }
}

[Route("api/account")]
[ApiController]
public class AccountController : Controller
{
    private readonly IStripeClient _stripeClient;

    public AccountController(IStripeClient stripeClient)
    {
        _stripeClient = stripeClient;
    }

    [HttpPost]
    public ActionResult Create()
    {
        try
        {
            var service = new AccountService(_stripeClient);
            var options = new AccountCreateOptions
            {
                Controller = new AccountControllerOptions
                {
                    StripeDashboard = new AccountControllerStripeDashboardOptions
                    {
                        Type = "none"
                    },
                    Fees = new AccountControllerFeesOptions
                    {
                        Payer = "application"
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
                },
                Country = "SE",
            };

            var account = service.Create(options);

            return Json(new
            {
                account = account.Id
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
    public ActionResult Link([FromBody] AccountLinkPostBody body)
    {
        try
        {
            var connectedAccountId = body.Account;
            var service = new AccountLinkService(_stripeClient);

            AccountLink accountLink = service.Create(
                new AccountLinkCreateOptions
                {
                    Account = connectedAccountId,
                    ReturnUrl = $"{body.BaseUrl}/account/return/{connectedAccountId}",
                    RefreshUrl = $"{body.BaseUrl}/account/refresh/{connectedAccountId}",
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
}