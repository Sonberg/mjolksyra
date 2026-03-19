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
        ICollection<string>? imageUrls,
        CancellationToken cancellationToken)
    {
        var settings = options.Value;
        if (string.IsNullOrWhiteSpace(settings.ApiKey))
            throw new InvalidOperationException("Workout text AI API key is not configured.");

        var hasImages = imageUrls is { Count: > 0 };
        var model = hasImages ? settings.MediaModel : settings.Model;
        var userPrompt = $"Analyze this workout note context and suggest coaching actions. WorkoutId: {workout.Id}\n\n{workoutText}";

        object userMessageContent = hasImages
            ? BuildMultiModalContent(userPrompt, imageUrls!)
            : userPrompt;

        var requestPayload = new
        {
            model,
            temperature = 0.2,
            response_format = new
            {
                type = "json_schema",
                json_schema = new
                {
                    name = "workout_analysis",
                    strict = true,
                    schema = new
                    {
                        type = "object",
                        properties = new
                        {
                            summary = new { type = "string" },
                            keyPoints = new { type = "array", items = new { type = "string" } },
                            recommendations = new { type = "array", items = new { type = "string" } }
                        },
                        required = new[] { "summary", "keyPoints", "recommendations" },
                        additionalProperties = false
                    }
                }
            },
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

        var endpoint = new Uri(new Uri(settings.BaseUrl), "chat/completions");
        using var request = new HttpRequestMessage(HttpMethod.Post, endpoint);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", settings.ApiKey);
        request.Content = new StringContent(
            JsonSerializer.Serialize(requestPayload),
            Encoding.UTF8,
            "application/json");

        using var response = await httpClient.SendAsync(request, cancellationToken);
        var json = await response.Content.ReadAsStringAsync(cancellationToken);
        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException($"AI request failed ({response.StatusCode}): {json}");

        using var doc = JsonDocument.Parse(json);
        if (!doc.RootElement.TryGetProperty("choices", out var choices) ||
            choices.GetArrayLength() == 0 ||
            !choices[0].TryGetProperty("message", out var message) ||
            !message.TryGetProperty("content", out var contentElement))
            throw new InvalidOperationException($"AI response did not match expected shape: {json}");

        var content = contentElement.GetString();
        if (string.IsNullOrWhiteSpace(content))
            throw new InvalidOperationException("AI returned empty content.");

        var parsed = JsonSerializer.Deserialize<WorkoutAnalysisJsonResponse>(
            content,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        if (parsed is null || string.IsNullOrWhiteSpace(parsed.Summary))
            throw new InvalidOperationException("AI response did not match expected schema.");

        return new WorkoutTextAnalysisResult(
            parsed.Summary,
            parsed.KeyPoints?.Where(x => !string.IsNullOrWhiteSpace(x)).Take(5).ToList() ?? [],
            parsed.Recommendations?.Where(x => !string.IsNullOrWhiteSpace(x)).Take(5).ToList() ?? []);
    }

    private static object[] BuildMultiModalContent(string prompt, ICollection<string> imageUrls)
    {
        var items = new List<object>
        {
            new { type = "text", text = prompt }
        };

        foreach (var url in imageUrls)
            items.Add(new { type = "image_url", image_url = new { url } });

        return [.. items];
    }
}

internal record WorkoutAnalysisJsonResponse(
    string Summary,
    ICollection<string>? KeyPoints,
    ICollection<string>? Recommendations);
