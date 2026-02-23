using System.Text.Json.Serialization;
using Azure.Identity;
using MassTransit;
using MassTransit.Logging;
using MassTransit.Monitoring;
using Microsoft.ApplicationInsights.AspNetCore.Extensions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Mjolksyra.Api.Common;
using Mjolksyra.Api.Converters;
using Mjolksyra.Api.Migration;
using Mjolksyra.Api.Options;
using Mjolksyra.Domain;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.Infrastructure;
using Mjolksyra.UseCases;
using OpenTelemetry.Logs;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Scalar.AspNetCore;
using Stripe;

var builder = WebApplication.CreateBuilder(args);

if (Environment.GetEnvironmentVariable("KEY_VAULT_URL") is { } keyVaultUrl)
{
    builder.Configuration.AddAzureKeyVault(new Uri(keyVaultUrl), new DefaultAzureCredential());
}

if (Environment.GetEnvironmentVariable("APPLICATIONINSIGHTS_CONNECTION_STRING") is { } appInsights)
{
    builder.Services.AddApplicationInsightsTelemetry(new ApplicationInsightsServiceOptions
    {
        ConnectionString = appInsights
    });
}

var oTel = builder.Configuration
    .GetSection(OtelOptions.SectionName)
    .Get<OtelOptions>();

var stripe = builder.Configuration
    .GetSection(StripeOptions.SectionName)
    .Get<StripeOptions>();

foreach (var variable in oTel!.EnvironmentVariables)
{
    Environment.SetEnvironmentVariable(variable.Name, variable.Value);
}

builder.Services
    .AddOptions<StripeOptions>()
    .Bind(builder.Configuration.GetSection(StripeOptions.SectionName))
    .ValidateOnStart();

builder.Services
    .AddOptions<ClerkOptions>()
    .Bind(builder.Configuration.GetSection(ClerkOptions.SectionName))
    .ValidateOnStart();

builder.Logging.AddOpenTelemetry(logging =>
{
    logging.SetResourceBuilder(ResourceBuilder.CreateDefault().AddService(oTel.ServiceName));
    logging.AddOtlpExporter(opt =>
    {
        opt.Endpoint = new Uri(oTel.Endpoint);
        opt.Headers = oTel.Headers;
    });
    logging.IncludeFormattedMessage = true;
    logging.IncludeScopes = true;
    logging.ParseStateValues = true;
});

builder.Services.AddSingleton(Options.Create(stripe!));
builder.Services.ConfigureHttpJsonOptions(opt =>
{
    opt.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

builder.Services.AddOpenApi(opt =>
{
    opt.AddOperationTransformer((operation, context, _) =>
    {
        if (context.Description.ActionDescriptor is ControllerActionDescriptor descriptor)
        {
            operation.OperationId = descriptor.ControllerName + descriptor.ActionName;
        }

        return Task.CompletedTask;
    });
});
builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.Converters.Add(new DateOnlyJsonConverter());
        options.AllowInputFormatterExceptionMessages = true;
    });

builder.Services
    .AddOpenTelemetry()
    .ConfigureResource(x =>
    {
        x.Clear();
        x.AddService(oTel.ServiceName);
    })
    .WithLogging(opt =>
    {
        opt.AddOtlpExporter(x =>
        {
            x.Endpoint = new Uri(oTel.Endpoint);
            x.Headers = oTel.Headers;
        });
    })
    .WithMetrics(opt =>
    {
        opt.AddAspNetCoreInstrumentation();
        opt.AddHttpClientInstrumentation();
        opt.AddMeter(InstrumentationOptions.MeterName);
        opt.AddOtlpExporter(x =>
        {
            x.Endpoint = new Uri(oTel.Endpoint);
            x.Headers = oTel.Headers;
        });
    })
    .WithTracing(opt =>
    {
        opt.AddSource("MongoDB.Driver.Core.Extensions.DiagnosticSources");
        opt.AddSource(DiagnosticHeaders.DefaultListenerName);
        opt.AddAspNetCoreInstrumentation();
        opt.AddHttpClientInstrumentation();
        opt.AddOtlpExporter(x =>
        {
            x.Endpoint = new Uri(oTel.Endpoint);
            x.Headers = oTel.Headers;
        });
    });

builder.Services
    .AddMassTransit(opt => { opt.UsingInMemory((context, cfg) => cfg.ConfigureEndpoints(context)); });

builder.Services.AddAuthorization();
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        var clerk = builder.Configuration.GetSection(ClerkOptions.SectionName).Get<ClerkOptions>()!;
        opt.Authority = $"https://{clerk.Domain}";
        opt.MapInboundClaims = false;
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = false,
            NameClaimType = "sub",
        };
    });

builder.Services.AddHttpClient("Stripe");
builder.Services.AddTransient<IStripeClient, StripeClient>(s =>
{
    var clientFactory = s.GetRequiredService<IHttpClientFactory>();
    var httpClient = new SystemNetHttpClient(
        httpClient: clientFactory.CreateClient("Stripe"),
        maxNetworkRetries: StripeConfiguration.MaxNetworkRetries,
        enableTelemetry: StripeConfiguration.EnableTelemetry);

    return new StripeClient(apiKey: stripe!.ApiKey, httpClient: httpClient);
});

builder.Services.AddHttpContextAccessor();
 builder.Services.AddHostedService<ExerciseSeeder>();
builder.Services.AddHostedService<SearchIndexBuilder>();
builder.Services.AddHostedService<PlannedExerciseIndexBuilder>();
builder.Services.AddHostedService<TraineeIndexBuilder>();
builder.Services.AddScoped<IUserContext, UserContext>();
builder.Services.AddUseCases();
builder.Services.AddDomain(builder.Configuration);
builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

if (app.Environment.IsProduction())
{
    app.UseHttpsRedirection();
}

app.MapOpenApi();
app.MapScalarApiReference();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
