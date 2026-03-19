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
        ICollection<string>? mediaUrls,
        CancellationToken cancellationToken)
    {
        var settings = options.Value;
        if (string.IsNullOrWhiteSpace(settings.ApiKey))
            throw new InvalidOperationException("Workout text AI API key is not configured.");

        httpClient.BaseAddress = new Uri(settings.BaseUrl);
        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", settings.ApiKey);

        var hasMedia = mediaUrls is { Count: > 0 };
        var model = hasMedia ? settings.MediaModel : settings.Model;
        var userPrompt = $"Analyze this workout note context and suggest coaching actions. WorkoutId: {workout.Id}\n\n{workoutText}";

        object userMessageContent = hasMedia
            ? BuildMultiModalContent(userPrompt, mediaUrls!)
            : userPrompt;

        var requestPayload = new
        {
            model,
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
                    content = userMessageContent
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

    private static object[] BuildMultiModalContent(string prompt, ICollection<string> mediaUrls)
    {
        var items = new List<object>
        {
            new { type = "text", text = prompt }
        };

        foreach (var url in mediaUrls)
            items.Add(new { type = "image_url", image_url = new { url } });

        return [.. items];
    }

    private class WorkoutTextAnalysisResponse
    {
        public string Summary { get; set; } = string.Empty;
        public ICollection<string>? KeyPoints { get; set; }
        public ICollection<string>? Recommendations { get; set; }
    }
}

