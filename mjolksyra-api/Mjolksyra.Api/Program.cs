using System.Text.Json.Serialization;
using MassTransit;
using MassTransit.Logging;
using MassTransit.Monitoring;
using Mjolksyra.Api.Migration;
using Mjolksyra.Infrastructure;
using Mjolksyra.UseCases;
using OpenTelemetry.Logs;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.AllowInputFormatterExceptionMessages = true;
    });

builder.Services
    .AddOpenTelemetry()
    .ConfigureResource(opt => opt.AddService("mjolksyra-api"))
    .WithLogging(opt => { opt.AddOtlpExporter(); })
    .WithMetrics(opt =>
    {
        opt.AddAspNetCoreInstrumentation();
        opt.AddHttpClientInstrumentation();
        opt.AddMeter(InstrumentationOptions.MeterName);
        opt.AddOtlpExporter();
    })
    .WithTracing(opt =>
    {
        opt.AddSource("MongoDB.Driver.Core.Extensions.DiagnosticSources");
        opt.AddSource(DiagnosticHeaders.DefaultListenerName);
        opt.AddAspNetCoreInstrumentation();
        opt.AddHttpClientInstrumentation();
        opt.AddOtlpExporter();
    });

builder.Services
    .AddMassTransit(opt => { opt.UsingInMemory((context, cfg) => cfg.ConfigureEndpoints(context)); });


builder.Services.AddHostedService<ExerciseSeeder>();
builder.Services.AddHostedService<IndexBuilder>();

builder.Services.AddUseCases();
builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}


app.MapControllers();
app.UseHttpsRedirection();
app.Run();