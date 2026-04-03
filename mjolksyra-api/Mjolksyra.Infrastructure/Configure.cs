using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Clerk;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Email;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.Domain.Notifications;
using Mjolksyra.Infrastructure.Clerk;
using Mjolksyra.Infrastructure.AI;
using Mjolksyra.Infrastructure.Database;
using Mjolksyra.Infrastructure.Email;
using Mjolksyra.Infrastructure.Messaging;
using Mjolksyra.Infrastructure.Media;
using Mjolksyra.Infrastructure.Messaging.Consumers;
using Mjolksyra.Infrastructure.Notifications;
using Mjolksyra.Infrastructure.Stripe;
using Mjolksyra.Infrastructure.R2;
using Mjolksyra.UseCases.MediaStorage;
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

        services
            .AddOptions<R2Options>()
            .Bind(configuration.GetSection(R2Options.SectionName))
            .ValidateOnStart();

        services
            .AddOptions<GeminiOptions>()
            .Bind(configuration.GetSection(GeminiOptions.SectionName));

        services
            .AddOptions<MediaStorageOptions>()
            .Configure(opts => opts.PublicBaseUrl = configuration[$"{R2Options.SectionName}:PublicBaseUrl"] ?? string.Empty);

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
        services.AddScoped<ITraineeTransactionRepository, TraineeTransactionRepository>();
        services.AddScoped<IPlannedWorkoutRepository, PlannedWorkoutRepository>();
        services.AddScoped<IPlannedWorkoutChatMessageRepository, PlannedWorkoutChatMessageRepository>();
        services.AddScoped<IBlockRepository, BlockRepository>();
        services.AddScoped<ITraineeInvitationsRepository, TraineeInvitationsRepository>();
        services.AddScoped<IDiscountCodeRepository, DiscountCodeRepository>();
        services.AddScoped<IPlanRepository, PlanRepository>();
        services.AddScoped<IWorkoutMediaAnalysisRepository, WorkoutMediaAnalysisRepository>();
        services.AddHostedService<PlanSeeder>();
        services.AddHostedService<FfmpegInitializer>();
        services.AddScoped<BrevoEmailSender>();
        services.AddKeyedScoped<IEmailSender, BrevoEmailSender>("direct");
        services.AddScoped<NotificationService>();
        services.AddScoped<IEmailSender, MassTransitEmailSender>();
        services.AddScoped<INotificationService, MassTransitNotificationService>();
        services.AddScoped<ITraineeSubscriptionSyncPublisher, MassTransitTraineeSubscriptionSyncPublisher>();
        services.AddScoped<ITraineeCancellationPublisher, MassTransitTraineeCancellationPublisher>();
        services.AddScoped<IPlannedWorkoutDeletedPublisher, MassTransitPlannedWorkoutDeletedPublisher>();
        services.AddScoped<IR2FileUploader, R2FileUploader>();
        services.AddScoped<IR2FileDeleter, R2FileDeleter>();
        services.AddScoped<IMediaCompressionPublisher, MassTransitMediaCompressionPublisher>();
        services.AddScoped<IWorkoutMediaAnalysisAgent, GeminiWorkoutMediaAnalysisAgent>();
        services.AddScoped<IStripePriceService>(sp =>
            new StripePriceServiceAdapter(sp.GetRequiredService<IStripeClient>()));
        services.AddScoped<IStripeSubscriptionService>(sp =>
            new StripeSubscriptionServiceAdapter(sp.GetRequiredService<IStripeClient>()));
        services.AddScoped<IStripeInvoiceService>(sp =>
            new StripeInvoiceServiceAdapter(sp.GetRequiredService<IStripeClient>()));
        services.AddScoped<IStripeRefundService>(sp =>
            new StripeRefundServiceAdapter(sp.GetRequiredService<IStripeClient>()));

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
