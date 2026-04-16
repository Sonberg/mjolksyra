using System.ClientModel;
using System.ComponentModel;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Options;
using Mjolksyra.Domain.AI;
using OpenAI;

namespace Mjolksyra.Infrastructure.AI;

public class GeminiCoachInsightsAgent(IOptions<GeminiOptions> options) : ICoachInsightsAgent
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    public async Task<CoachInsightsGenerationResult> GenerateAsync(CoachInsightsGenerationInput input, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(options.Value.ApiKey))
        {
            return new CoachInsightsGenerationResult { Success = false };
        }

        var chatClient = BuildChatClientWithTools();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var incrementalContext = input.LastRebuiltAt.HasValue
            ? $"You are performing an INCREMENTAL update. The coach's existing profile is:\n\"{input.ExistingStyleSummary}\"\n\nFocus on workouts and plans since {input.LastRebuiltAt.Value:yyyy-MM-dd}. Merge new findings with the existing profile."
            : "You are generating the INITIAL coach profile. Analyze all available history.";

        var tools = BuildTools(input.TraineeDispatchers, ct);

        var messages = new List<ChatMessage>
        {
            new(ChatRole.System,
                $"You are a coaching analytics engine analyzing cross-athlete patterns to build a coach profile. " +
                $"Today is {today:yyyy-MM-dd}. " +
                $"{incrementalContext}\n\n" +
                $"Use the available workout tools (one per athlete dispatcher slot) to gather data. " +
                $"Identify: the coach's preferred exercise selection, typical volume, progression methodology, and what consistently produces results across athletes. " +
                $"Respond with ONLY valid JSON:\n" +
                $"{{" +
                $"\"coachingStyleSummary\": \"string\"," +
                $"\"effectivenessPatterns\": [{{\"pattern\": \"string\", \"detail\": \"string\"}}]" +
                $"}}"),
            new(ChatRole.User, $"Analyze training data for coach {input.CoachUserId} across {input.TraineeDispatchers.Count} athletes. Use the tools to gather recent workout data, then produce the JSON profile."),
        };

        try
        {
            var response = await chatClient.GetResponseAsync(messages, new ChatOptions { Tools = tools }, ct);
            var content = response.Text ?? string.Empty;
            var json = ExtractJson(content);
            return TryParseResult(json) ?? new CoachInsightsGenerationResult { Success = false };
        }
        catch
        {
            return new CoachInsightsGenerationResult { Success = false };
        }
    }

    private IChatClient BuildChatClientWithTools()
    {
        var clientOptions = new OpenAIClientOptions { Endpoint = new Uri(options.Value.OpenAiCompatibleEndpoint) };
        var openAiClient = new OpenAIClient(new ApiKeyCredential(options.Value.ApiKey), clientOptions);
        return new ChatClientBuilder(openAiClient.GetChatClient(options.Value.ModelName).AsIChatClient())
            .UseFunctionInvocation()
            .Build();
    }

    private static AIFunction[] BuildTools(ICollection<IWorkoutAnalysisToolDispatcher> dispatchers, CancellationToken ct)
    {
        var tools = new List<AIFunction>();
        var dispatcherList = dispatchers.ToList();

        for (var i = 0; i < dispatcherList.Count; i++)
        {
            var dispatcher = dispatcherList[i];
            var index = i;

            [Description("Returns recent completed workouts for athlete {index}. Use to analyze training patterns for this athlete.")]
            async Task<string> GetRecentWorkouts(
                [Description("ISO 8601 date (YYYY-MM-DD). Return workouts before this date.")] string before_date,
                [Description("Number of workouts (1–10).")] int count = 5)
                => await dispatcher.GetRecentCompletedWorkoutsAsync(before_date, count, ct);

            tools.Add(AIFunctionFactory.Create(GetRecentWorkouts, $"GetRecentWorkoutsAthlete{index}",
                $"Returns recent completed workouts for athlete slot {index}. Use to understand this athlete's training patterns under this coach."));
        }

        return [.. tools];
    }

    private static string ExtractJson(string content)
    {
        var start = content.IndexOf('{');
        var end = content.LastIndexOf('}');
        if (start < 0 || end < 0 || end <= start) return content;
        return content[start..(end + 1)];
    }

    private static CoachInsightsGenerationResult? TryParseResult(string json)
    {
        try
        {
            var payload = JsonSerializer.Deserialize<CoachInsightsPayload>(json, JsonOptions);
            if (payload is null) return null;

            return new CoachInsightsGenerationResult
            {
                Success = true,
                CoachingStyleSummary = payload.CoachingStyleSummary ?? string.Empty,
                EffectivenessPatterns = (payload.EffectivenessPatterns ?? [])
                    .Select(p => new CoachEffectivenessPatternResult
                    {
                        Pattern = p.Pattern ?? string.Empty,
                        Detail = p.Detail ?? string.Empty,
                    }).ToList(),
            };
        }
        catch
        {
            return null;
        }
    }

    private class CoachInsightsPayload
    {
        public string? CoachingStyleSummary { get; set; }
        public List<EffectivenessPatternPayload>? EffectivenessPatterns { get; set; }
    }

    private class EffectivenessPatternPayload
    {
        public string? Pattern { get; set; }
        public string? Detail { get; set; }
    }
}
