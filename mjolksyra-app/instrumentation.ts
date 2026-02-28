type OTelModule = {
  registerOTel: (options: { serviceName: string }) => void;
};

const importModule = (specifier: string): Promise<OTelModule> =>
  Function("s", "return import(s)")(specifier) as Promise<OTelModule>;

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  process.env.OTEL_SERVICE_NAME ??= "mjolksyra-app";
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT ??= "http://localhost:18890";
  process.env.OTEL_EXPORTER_OTLP_PROTOCOL ??= "http/protobuf";

  try {
    const { registerOTel } = await importModule("@vercel/otel");
    registerOTel({
      serviceName: process.env.OTEL_SERVICE_NAME,
    });
  } catch (error) {
    console.warn("[otel] @vercel/otel failed to initialize.", error);
  }
}
