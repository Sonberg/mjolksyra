using System.Text.Json.Serialization;
using MassTransit;
using MassTransit.Logging;
using MassTransit.Monitoring;
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


var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}


app.MapControllers();
app.UseHttpsRedirection();
app.Run();