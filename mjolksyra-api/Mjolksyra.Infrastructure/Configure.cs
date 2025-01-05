using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Mjolksyra.Domain.Database;
using Mjolksyra.Infrastructure.Database;
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

#pragma warning disable EXTEXP0018
        services.AddHybridCache();
#pragma warning restore EXTEXP0018
        
        services.AddSingleton<IMongoDbContext, MongoDbContext>();
        services.AddScoped<IExerciseRepository, ExerciseRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();

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