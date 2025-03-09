using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Email;
using Mjolksyra.Infrastructure.Database;
using Mjolksyra.Infrastructure.Email;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Conventions;
using MongoDB.Bson.Serialization.Serializers;

namespace Mjolksyra.Infrastructure;

public static class Configure
{
    public static void AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services
            .AddOptions<MongoOptions>()
            .Bind(configuration.GetSection(MongoOptions.SectionName))
            .ValidateOnStart();
        
        services
            .AddOptions<BrevoOptions>()
            .Bind(configuration.GetSection(BrevoOptions.SectionName))
            .ValidateOnStart();

#pragma warning disable EXTEXP0018
        services.AddHybridCache();
#pragma warning restore EXTEXP0018

        services.AddSingleton<IMongoDbContext, MongoDbContext>();
        services.AddScoped<IExerciseRepository, ExerciseRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<ITraineeRepository, TraineeRepository>();
        services.AddScoped<IPlannedWorkoutRepository, PlannedWorkoutRepository>();
        services.AddScoped<ITraineeInvitationsRepository, TraineeInvitationsRepository>();
        services.AddScoped<IEmailSender, BrevoEmailSender>();

        ConventionRegistry.Register("EnumStringConvention", new ConventionPack
        {
            new EnumRepresentationConvention(BsonType.String)
        }, _ => true);

        ConventionRegistry.Register("camelCase", new ConventionPack
        {
            new CamelCaseElementNameConvention()
        }, _ => true);

        BsonSerializer.RegisterSerializer(new GuidSerializer(GuidRepresentation.Standard));
    }
}