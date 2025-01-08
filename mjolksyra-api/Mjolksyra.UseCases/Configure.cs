using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Mjolksyra.UseCases.Trainees;

namespace Mjolksyra.UseCases;

public static class Configure
{
    public static void AddUseCases(this IServiceCollection services)
    {
        services.AddMediatR(opt => opt.RegisterServicesFromAssemblyContaining<UseCasesAssemblyMarker>());
        services.AddValidatorsFromAssemblyContaining<UseCasesAssemblyMarker>();
        services.AddScoped<ITraineeResponseBuilder, TraineeResponseBuilder>();
    }
}