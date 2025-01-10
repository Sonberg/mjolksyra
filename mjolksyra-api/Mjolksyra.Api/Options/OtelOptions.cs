namespace Mjolksyra.Api.Options;

public class OtelOptions
{
    public static string SectionName = "Otel";

    public required string Endpoint { get; set; }
    
    public required string EndpointTraces { get; set; }
    
    public required string EndpointMetrics { get; set; }

    public required string ServiceName { get; set; }


    public required string? Protocol { get; set; }

    public required string? Headers { get; set; }

    public ICollection<(string Name, string? Value)> EnvironmentVariables =>
    [
        ("OTEL_EXPORTER_OTLP_ENDPOINT", Endpoint),
        ("OTEL_EXPORTER_OTLP_TRACES_ENDPOINT", EndpointTraces),
        ("OTEL_EXPORTER_OTLP_METRICS_ENDPOINT", EndpointMetrics),
        ("OTEL_SERVICE_NAME", ServiceName),
        ("OTEL_EXPORTER_OTLP_PROTOCOL", Protocol),
        ("OTEL_EXPORTER_OTLP_HEADERS", Headers),
        ("OTEL_LOG_LEVEL", "debug")
    ];
}