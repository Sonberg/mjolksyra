using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Mjolksyra.UseCases.Baseload;
using Mjolksyra.UseCases.Coaches.EnsureCoachPlatformSubscription;
using Mjolksyra.UseCases.Trainees;
using Mjolksyra.UseCases.Trainees.RefundTraineeTransaction;

namespace Mjolksyra.UseCases;

public static class Configure
{
    public static void AddUseCases(this IServiceCollection services)
    {
        services.AddMediatR(opt => opt.RegisterServicesFromAssemblyContaining<UseCasesAssemblyMarker>());
        services.AddValidatorsFromAssemblyContaining<UseCasesAssemblyMarker>();
        services.AddScoped<ITraineeResponseBuilder, TraineeResponseBuilder>();
        services.AddScoped<ICoachPlatformBillingStripeGateway, CoachPlatformBillingStripeGateway>();
        services.AddScoped<IStripeRefundGateway, StripeRefundGateway>();
        services.AddScoped<IStripeInvoiceListGateway, StripeInvoiceListGateway>();
    }
}
