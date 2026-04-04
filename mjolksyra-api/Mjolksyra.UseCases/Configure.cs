using FluentValidation;
using Ganss.Xss;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Mjolksyra.UseCases.Baseload;
using Mjolksyra.UseCases.Behaviors;
using Mjolksyra.UseCases.Coaches.EnsureCoachPlatformSubscription;
using Mjolksyra.UseCases.Coaches.GetAppliedDiscountCode;
using Mjolksyra.UseCases.Coaches.PurchaseCreditPack;
using Mjolksyra.UseCases.Trainees;
using Mjolksyra.UseCases.Trainees.RefundTraineeTransaction;

namespace Mjolksyra.UseCases;

public static class Configure
{
    public static void AddUseCases(this IServiceCollection services)
    {
        var sanitizer = new HtmlSanitizer();
        sanitizer.AllowedTags.Clear();
        services.AddSingleton(sanitizer);
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(SanitizationBehavior<,>));
        services.AddMediatR(opt => opt.RegisterServicesFromAssemblyContaining<UseCasesAssemblyMarker>());
        services.AddValidatorsFromAssemblyContaining<UseCasesAssemblyMarker>();
        services.AddScoped<ITraineeResponseBuilder, TraineeResponseBuilder>();
        services.AddScoped<ICoachPlatformBillingStripeGateway, CoachPlatformBillingStripeGateway>();
        services.AddScoped<ICoachDiscountConfigurationStripeGateway, CoachDiscountConfigurationStripeGateway>();
        services.AddScoped<IStripeCreditPackGateway, StripeCreditPackGateway>();
        services.AddScoped<IStripeRefundGateway, StripeRefundGateway>();
        services.AddScoped<IStripeInvoiceListGateway, StripeInvoiceListGateway>();
    }
}
