using System.Text.Json;
using System.ClientModel;
using Microsoft.Agents.AI;
using Microsoft.Extensions.Options;
using Mjolksyra.Domain.AI;
using OpenAI;
using OpenAI.Responses;

namespace Mjolksyra.Infrastructure.AI;

public class GeminiWorkoutMediaAnalysisAgent(IOptions<GeminiOptions> options) : IWorkoutMediaAnalysisAgent
{
    public async Task<WorkoutMediaAnalysis> AnalyzeAsync(WorkoutMediaAnalysisInput input, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(options.Value.ApiKey))
        {
            throw new InvalidOperationException("Gemini:ApiKey is required to analyze workout media.");
        }

        var client = new OpenAIClient(
            new ApiKeyCredential(options.Value.ApiKey),
            new OpenAIClientOptions
            {
                Endpoint = new Uri(options.Value.OpenAiCompatibleEndpoint)
            });

        #pragma warning disable OPENAI001
        var agent = client
            .GetResponsesClient()
            .AsAIAgent(
                model: options.Value.ModelName,
                name: "WorkoutAnalyzer",
                instructions: "You analyze athlete workout text, image, and video context. Always respond with strict JSON only.");
        #pragma warning restore OPENAI001

        var prompt = BuildPrompt(input);
        var rawResponse = await agent.RunAsync(prompt, cancellationToken: cancellationToken);
        var json = ExtractJson(rawResponse.ToString());

        return TryParse(json) ?? new WorkoutMediaAnalysis
        {
            Summary = string.IsNullOrWhiteSpace(rawResponse.ToString())
                ? "No analysis content returned."
                : rawResponse.ToString(),
            KeyFindings = [],
            TechniqueRisks = [],
            CoachSuggestions = [],
        };
    }

    private static string BuildPrompt(WorkoutMediaAnalysisInput input)
    {
        var mediaSection = input.MediaUrls.Count == 0
            ? "No media URLs were provided."
            : string.Join('\n', input.MediaUrls.Select(url => $"- [{GetMediaType(url)}] {url}"));

        return $@"You are analyzing a workout check-in.

Athlete text:
{input.Text}

Media references:
{mediaSection}

Use the text and media references to produce a coach-friendly summary.
If media cannot be accessed, explicitly mention that in keyFindings.

Return ONLY JSON with this exact shape:
{{
  ""summary"": ""string"",
  ""keyFindings"": [""string""],
  ""techniqueRisks"": [""string""],
  ""coachSuggestions"": [""string""]
}}";
    }

    private static string GetMediaType(string url)
    {
        return url.Contains(".mp4", StringComparison.OrdinalIgnoreCase)
               || url.Contains(".mov", StringComparison.OrdinalIgnoreCase)
               || url.Contains("ct=video", StringComparison.OrdinalIgnoreCase)
            ? "video"
            : "image";
    }

    private static string ExtractJson(string value)
    {
        var start = value.IndexOf('{');
        var end = value.LastIndexOf('}');

        if (start < 0 || end < start)
        {
            return value;
        }

        return value[start..(end + 1)];
    }

    private static WorkoutMediaAnalysis? TryParse(string json)
    {
        try
        {
            var payload = JsonSerializer.Deserialize<GeminiWorkoutMediaAnalysisPayload>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
            });

            if (payload is null || string.IsNullOrWhiteSpace(payload.Summary))
            {
                return null;
            }

            return new WorkoutMediaAnalysis
            {
                Summary = payload.Summary,
                KeyFindings = payload.KeyFindings ?? [],
                TechniqueRisks = payload.TechniqueRisks ?? [],
                CoachSuggestions = payload.CoachSuggestions ?? [],
            };
        }
        catch
        {
            return null;
        }
    }

    private class GeminiWorkoutMediaAnalysisPayload
    {
        public string Summary { get; set; } = string.Empty;

        public ICollection<string>? KeyFindings { get; set; }

        public ICollection<string>? TechniqueRisks { get; set; }

        public ICollection<string>? CoachSuggestions { get; set; }
    }
}
