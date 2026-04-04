using System.Text.Json;
using System.Net.Http.Headers;
using System.Text;
using Microsoft.Extensions.Options;
using Mjolksyra.Domain.AI;

namespace Mjolksyra.Infrastructure.AI;

public class GeminiWorkoutMediaAnalysisAgent(IOptions<GeminiOptions> options) : IWorkoutMediaAnalysisAgent
{
    public async Task<WorkoutMediaAnalysis> AnalyzeAsync(WorkoutMediaAnalysisInput input, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(options.Value.ApiKey))
        {
            throw new InvalidOperationException("Gemini:ApiKey is required to analyze workout media.");
        }

        var prompt = BuildPrompt(input);
        var rawResponse = await CreateCompletionAsync(prompt, cancellationToken);
        var json = ExtractJson(rawResponse);

        return TryParse(json) ?? new WorkoutMediaAnalysis
        {
            Summary = string.IsNullOrWhiteSpace(rawResponse)
                ? "No analysis content returned."
                : rawResponse,
            KeyFindings = [],
            TechniqueRisks = [],
            CoachSuggestions = [],
        };
    }

    private async Task<string> CreateCompletionAsync(string prompt, CancellationToken cancellationToken)
    {
        var baseUri = new Uri(options.Value.OpenAiCompatibleEndpoint);

        using var httpClient = new HttpClient
        {
            BaseAddress = baseUri,
        };

        httpClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", options.Value.ApiKey);

        var body = JsonSerializer.Serialize(new
        {
            model = options.Value.ModelName,
            messages = new[]
            {
                new { role = "system", content = "You analyze athlete workout text, image, and video context. Always respond with strict JSON only." },
                new { role = "user", content = prompt },
            }
        });

        using var request = new HttpRequestMessage(HttpMethod.Post, "chat/completions")
        {
            Content = new StringContent(body, Encoding.UTF8, "application/json"),
        };

        using var response = await httpClient.SendAsync(request, cancellationToken);
        var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                $"Gemini analysis request failed with {(int)response.StatusCode} ({response.ReasonPhrase}). Body: {responseBody}");
        }

        try
        {
            using var document = JsonDocument.Parse(responseBody);
            var content = document.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();

            return content ?? string.Empty;
        }
        catch
        {
            return responseBody;
        }
    }

    private static string BuildPrompt(WorkoutMediaAnalysisInput input)
    {
        var mediaSection = input.MediaUrls.Count == 0
            ? "No media URLs were provided."
            : string.Join('\n', input.MediaUrls.Select(url => $"- [{GetMediaType(url)}] {url}"));

        var exerciseSection = input.Exercises.Count == 0
            ? "No exercise data was provided."
            : string.Join('\n', input.Exercises.Select(FormatExercise));

        return $@"You are analyzing a workout check-in.

Athlete text:
{input.Text}

Workout exercises (prescribed vs actual):
{exerciseSection}

Media references:
{mediaSection}

Use the text and media references to produce a coach-friendly summary.
If media cannot be accessed, explicitly mention that in keyFindings.

Hard rules:
- Treat ""Workout exercises (prescribed vs actual)"" as authoritative workout log data.
- If actual reps are present, never report a conflicting exact rep count.
- If video cannot be reliably inspected, do not guess exact rep counts from media.

Return ONLY JSON with this exact shape:
{{
  ""summary"": ""string"",
  ""keyFindings"": [""string""],
  ""techniqueRisks"": [""string""],
  ""coachSuggestions"": [""string""]
}}";
    }

    private static string FormatExercise(WorkoutExerciseAnalysisInput exercise)
    {
        if (exercise.Sets.Count == 0)
        {
            return $"- {exercise.Name}: no sets";
        }

        var setLines = exercise.Sets.Select(set =>
            $"  - Set {set.SetNumber}: target(reps={FormatNumber(set.TargetReps)}, weightKg={FormatNumber(set.TargetWeightKg)}, durationSeconds={FormatNumber(set.TargetDurationSeconds)}, distanceMeters={FormatNumber(set.TargetDistanceMeters)}, note={FormatText(set.TargetNote)}) | actual(reps={FormatNumber(set.ActualReps)}, weightKg={FormatNumber(set.ActualWeightKg)}, durationSeconds={FormatNumber(set.ActualDurationSeconds)}, distanceMeters={FormatNumber(set.ActualDistanceMeters)}, note={FormatText(set.ActualNote)}, isDone={FormatBool(set.ActualIsDone)})");

        return $"- {exercise.Name}\n{string.Join('\n', setLines)}";
    }

    private static string FormatNumber<T>(T? value) where T : struct
        => value?.ToString() ?? "null";

    private static string FormatText(string? value)
        => string.IsNullOrWhiteSpace(value) ? "null" : value;

    private static string FormatBool(bool? value)
        => value.HasValue ? value.Value.ToString().ToLowerInvariant() : "null";

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
