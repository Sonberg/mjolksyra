using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.Coaches.AnalyzeWorkoutText;

public class OpenAiWorkoutTextAnalysisGateway(
    HttpClient httpClient,
    IOptions<WorkoutTextAnalysisAiOptions> options) : IWorkoutTextAnalysisGateway
{
    public async Task<WorkoutTextAnalysisResult> AnalyzeAsync(
        PlannedWorkout workout,
        string workoutText,
        CancellationToken cancellationToken)
    {
        var settings = options.Value;
        if (string.IsNullOrWhiteSpace(settings.ApiKey))
            throw new InvalidOperationException("Workout text AI API key is not configured.");

        httpClient.BaseAddress = new Uri(settings.BaseUrl);
        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", settings.ApiKey);

        var requestPayload = new
        {
            model = settings.Model,
            temperature = 0.2,
            response_format = new { type = "json_object" },
            messages = new object[]
            {
                new
                {
                    role = "system",
                    content =
                        "You are a strength coach assistant. Return strict JSON with keys: summary (string), keyPoints (string[]), recommendations (string[]). Keep recommendations practical and brief."
                },
                new
                {
                    role = "user",
                    content =
                        $"Analyze this workout note context and suggest coaching actions. WorkoutId: {workout.Id}\n\n{workoutText}"
                }
            }
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, "chat/completions")
        {
            Content = new StringContent(
                JsonSerializer.Serialize(requestPayload),
                Encoding.UTF8,
                "application/json")
        };

        using var response = await httpClient.SendAsync(request, cancellationToken);
        var json = await response.Content.ReadAsStringAsync(cancellationToken);
        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException($"AI request failed ({response.StatusCode}): {json}");

        using var doc = JsonDocument.Parse(json);
        var content = doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString();

        if (string.IsNullOrWhiteSpace(content))
            throw new InvalidOperationException("AI returned empty content.");

        var parsed = JsonSerializer.Deserialize<WorkoutTextAnalysisResponse>(
            content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        if (parsed is null || string.IsNullOrWhiteSpace(parsed.Summary))
            throw new InvalidOperationException("AI response did not match expected schema.");

        return new WorkoutTextAnalysisResult(
            parsed.Summary,
            parsed.KeyPoints?.Where(x => !string.IsNullOrWhiteSpace(x)).ToList() ?? [],
            parsed.Recommendations?.Where(x => !string.IsNullOrWhiteSpace(x)).ToList() ?? []);
    }

    private class WorkoutTextAnalysisResponse
    {
        public string Summary { get; set; } = string.Empty;
        public ICollection<string>? KeyPoints { get; set; }
        public ICollection<string>? Recommendations { get; set; }
    }
}

