namespace Mjolksyra.Infrastructure.AI;

public class GeminiOptions
{
    public const string SectionName = "Gemini";

    public string ApiKey { get; set; } = string.Empty;

    public string ModelName { get; set; } = "gemini-2.5-pro";

    public string OpenAiCompatibleEndpoint { get; set; } = "https://generativelanguage.googleapis.com/v1beta/openai/";
}
