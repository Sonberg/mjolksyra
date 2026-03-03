using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Mjolksyra.Domain.Clerk;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Email;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.Domain.Notifications;
using Mjolksyra.Infrastructure.Clerk;
using Mjolksyra.Infrastructure.Database;
using Mjolksyra.Infrastructure.Email;
using Mjolksyra.Infrastructure.Messaging;
using Mjolksyra.Infrastructure.Notifications;
using Mjolksyra.Infrastructure.Stripe;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Conventions;
using MongoDB.Bson.Serialization.Serializers;
using Stripe;

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
        services.AddScoped<INotificationRepository, NotificationRepository>();
        services.AddScoped<IFeedbackReportRepository, FeedbackReportRepository>();
        services.AddHttpClient<IClerkRepository, ClerkRepository>(client =>
        {
            client.BaseAddress = new Uri("https://api.clerk.com/");
        });
        services.AddScoped<ITraineeRepository, TraineeRepository>();
        services.AddScoped<IPlannedWorkoutRepository, PlannedWorkoutRepository>();
        services.AddScoped<IBlockRepository, BlockRepository>();
        services.AddScoped<ITraineeInvitationsRepository, TraineeInvitationsRepository>();
        services.AddScoped<BrevoEmailSender>();
        services.AddKeyedScoped<IEmailSender, BrevoEmailSender>("direct");
        services.AddScoped<NotificationService>();
        services.AddScoped<IEmailSender, MassTransitEmailSender>();
        services.AddScoped<INotificationService, MassTransitNotificationService>();
        services.AddScoped<ITraineeSubscriptionSyncPublisher, MassTransitTraineeSubscriptionSyncPublisher>();
        services.AddScoped<ITraineeCancellationPublisher, MassTransitTraineeCancellationPublisher>();
        services.AddScoped<IStripePriceService>(sp =>
            new StripePriceServiceAdapter(sp.GetRequiredService<IStripeClient>()));
        services.AddScoped<IStripeSubscriptionService>(sp =>
            new StripeSubscriptionServiceAdapter(sp.GetRequiredService<IStripeClient>()));

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
