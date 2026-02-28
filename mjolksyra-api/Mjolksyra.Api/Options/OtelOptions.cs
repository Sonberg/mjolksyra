namespace Mjolksyra.Api.Options;

public class OtelOptions
{
    public static string SectionName = "Otel";

    public required string Endpoint { get; set; }

    public required string ServiceName { get; set; }

    public string? Headers { get; set; }
}
