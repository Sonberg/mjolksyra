var builder = DistributedApplication.CreateBuilder(args);

var apiBaseUrl = "http://localhost:5107";

var api = builder.AddProject<Projects.Mjolksyra_Api>("api")
    .WithEnvironment("ASPNETCORE_URLS", apiBaseUrl);

builder.AddNpmApp(
        name: "app",
        workingDirectory: "../../mjolksyra-app",
        scriptName: "dev")
    .WithReference(api)
    .WithEnvironment("API_URL", apiBaseUrl)
    .WithEnvironment("NEXT_PUBLIC_API_URL", apiBaseUrl)
    .WithEnvironment("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:18889")
    .WithEnvironment("OTEL_EXPORTER_OTLP_PROTOCOL", "http/protobuf");

builder.Build().Run();
