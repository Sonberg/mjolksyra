using Microsoft.Extensions.DependencyInjection;

namespace Mjolksyra.UseCases;

public static class Configure
{
    public static void AddUseCases(this IServiceCollection serviceCollection)
    {
        serviceCollection.AddMediatR(opt => opt.RegisterServicesFromAssemblyContaining<UseCasesAssemblyMarker>());
    }
}