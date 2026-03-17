var builder = DistributedApplication.CreateBuilder(args);
var rabbitMq = builder.AddRabbitMQ("rabbitmq", port: 5672);
var redis = builder.AddRedis("redis");
var api = builder.AddProject<Projects.Mjolksyra_Api>("api")
    .WithReference(rabbitMq)
    .WaitFor(rabbitMq);

const string otlpEndpoint = "http://localhost:18890";

builder.AddNpmApp(
        name: "app",
        workingDirectory: "../../mjolksyra-app",
        scriptName: "dev")
    .WithHttpEndpoint(port: 3000, env: "PORT")
    .WithEnvironment("API_URL", api.GetEndpoint("http"))
    .WithEnvironment("NEXT_PUBLIC_API_URL", api.GetEndpoint("http"))
    .WithEnvironment("REDIS_URL", redis.GetEndpoint("tcp"))
    .WithEnvironment("OTEL_SERVICE_NAME", "mjolksyra-app")
    .WithEnvironment("OTEL_EXPORTER_OTLP_ENDPOINT", otlpEndpoint)
    .WithEnvironment("OTEL_EXPORTER_OTLP_PROTOCOL", "http/protobuf")
    .WaitFor(redis);

builder.Build().Run();
