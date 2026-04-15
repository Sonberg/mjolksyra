using System.ClientModel;
using System.ComponentModel;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Options;
using Mjolksyra.Domain.AI;
using OpenAI;

namespace Mjolksyra.Infrastructure.AI;

public class GeminiTraineeInsightsAgent(IOptions<GeminiOptions> options) : ITraineeInsightsAgent
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    public async Task<TraineeInsightsGenerationResult> GenerateAsync(TraineeInsightsGenerationInput input, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(options.Value.ApiKey))
        {
            return new TraineeInsightsGenerationResult { Success = false };
        }

        var chatClient = BuildChatClientWithTools();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var twelveWeeksAgo = today.AddDays(-84).ToString("yyyy-MM-dd");

        var tools = BuildTools(input.ToolDispatcher, ct);

        var messages = new List<ChatMessage>
        {
            new(ChatRole.System,
                $"You are a sports science analyst generating structured athlete performance insights. " +
                $"Today is {today:yyyy-MM-dd}. " +
                $"Use GetRecentCompletedWorkouts with before_date={today:yyyy-MM-dd} and count=10 for fatigue and recommendation analysis (focus on last 12 weeks: after {twelveWeeksAgo}). " +
                $"Use GetWorkoutsForExercise for each major compound lift to build the progression summary (use all available history). " +
                $"Infer training age from total volume and complexity of programming: beginner (<1 year equivalent), intermediate (1-3 years), advanced (3+ years). " +
                $"Respond with ONLY valid JSON matching this exact schema:\n" +
                $"{{" +
                $"\"athleteProfile\": {{\"summary\": \"string\", \"trainingAge\": \"beginner|intermediate|advanced\"}}," +
                $"\"fatigueRisk\": {{\"level\": \"low|medium|high\", \"score\": 0-100, \"explanation\": \"string\"}}," +
                $"\"progressionSummary\": {{\"overall\": \"improving|plateauing|declining\", \"summary\": \"string\", \"exercises\": [{{\"name\": \"string\", \"trend\": \"improving|plateauing|declining\", \"detail\": \"string\"}}]}}," +
                $"\"strengths\": [{{\"label\": \"string\", \"detail\": \"string\", \"exerciseRef\": \"string|null\"}}]," +
                $"\"weaknesses\": [{{\"label\": \"string\", \"detail\": \"string\", \"exerciseRef\": \"string|null\"}}]," +
                $"\"recommendations\": [{{\"label\": \"string\", \"detail\": \"string\", \"priority\": \"high|medium|low\"}}]" +
                $"}}"),
            new(ChatRole.User, $"Generate insights for trainee {input.TraineeId}. Use all available tools to gather data before producing the JSON output."),
        };

        try
        {
            var response = await chatClient.GetResponseAsync(messages, new ChatOptions { Tools = tools }, ct);
            var content = response.Text ?? string.Empty;
            var json = ExtractJson(content);
            return TryParseResult(json) ?? new TraineeInsightsGenerationResult { Success = false };
        }
        catch
        {
            return new TraineeInsightsGenerationResult { Success = false };
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

    private static AIFunction[] BuildTools(IWorkoutAnalysisToolDispatcher dispatcher, CancellationToken ct)
    {
        [Description("Returns the N most recently completed workouts for fatigue and load analysis.")]
        async Task<string> GetRecentCompletedWorkouts(
            [Description("ISO 8601 date (YYYY-MM-DD). Return workouts completed before this date.")] string before_date,
            [Description("Number of workouts to return (1–10).")] int count = 10)
            => await dispatcher.GetRecentCompletedWorkoutsAsync(before_date, count, ct);

        [Description("Returns workouts containing a specific exercise across all time for progression analysis.")]
        async Task<string> GetWorkoutsForExercise(
            [Description("Exercise name (e.g. 'Back Squat', 'Bench Press').")] string exercise_name,
            [Description("Number of workouts to return (1–10).")] int count = 10,
            [Description("Optional ISO 8601 date. Return completed workouts on or before this date.")] string? before_date = null,
            [Description("Optional ISO 8601 date. Return planned workouts on or after this date.")] string? after_date = null)
            => await dispatcher.GetWorkoutsForExerciseAsync(exercise_name, count, before_date, after_date, ct);

        return [AIFunctionFactory.Create(GetRecentCompletedWorkouts), AIFunctionFactory.Create(GetWorkoutsForExercise)];
    }

    private static string ExtractJson(string content)
    {
        var start = content.IndexOf('{');
        var end = content.LastIndexOf('}');
        if (start < 0 || end < 0 || end <= start) return content;
        return content[start..(end + 1)];
    }

    private static TraineeInsightsGenerationResult? TryParseResult(string json)
    {
        try
        {
            var payload = JsonSerializer.Deserialize<InsightsPayload>(json, JsonOptions);
            if (payload is null) return null;

            return new TraineeInsightsGenerationResult
            {
                Success = true,
                AthleteProfile = payload.AthleteProfile is null ? null : new TraineeInsightsAthleteProfileResult
                {
                    Summary = payload.AthleteProfile.Summary ?? string.Empty,
                    TrainingAge = payload.AthleteProfile.TrainingAge ?? "beginner",
                },
                FatigueRisk = payload.FatigueRisk is null ? null : new TraineeInsightsFatigueRiskResult
                {
                    Level = payload.FatigueRisk.Level ?? "low",
                    Score = payload.FatigueRisk.Score,
                    Explanation = payload.FatigueRisk.Explanation ?? string.Empty,
                },
                ProgressionSummary = payload.ProgressionSummary is null ? null : new TraineeInsightsProgressionSummaryResult
                {
                    Overall = payload.ProgressionSummary.Overall ?? "improving",
                    Summary = payload.ProgressionSummary.Summary ?? string.Empty,
                    Exercises = (payload.ProgressionSummary.Exercises ?? [])
                        .Select(e => new TraineeInsightsExerciseTrendResult
                        {
                            Name = e.Name ?? string.Empty,
                            Trend = e.Trend ?? "improving",
                            Detail = e.Detail ?? string.Empty,
                        }).ToList(),
                },
                Strengths = (payload.Strengths ?? [])
                    .Select(s => new TraineeInsightsStrengthResult
                    {
                        Label = s.Label ?? string.Empty,
                        Detail = s.Detail ?? string.Empty,
                        ExerciseRef = s.ExerciseRef,
                    }).ToList(),
                Weaknesses = (payload.Weaknesses ?? [])
                    .Select(w => new TraineeInsightsWeaknessResult
                    {
                        Label = w.Label ?? string.Empty,
                        Detail = w.Detail ?? string.Empty,
                        ExerciseRef = w.ExerciseRef,
                    }).ToList(),
                Recommendations = (payload.Recommendations ?? [])
                    .Select(r => new TraineeInsightsRecommendationResult
                    {
                        Label = r.Label ?? string.Empty,
                        Detail = r.Detail ?? string.Empty,
                        Priority = r.Priority ?? "medium",
                    }).ToList(),
            };
        }
        catch
        {
            return null;
        }
    }

    private class InsightsPayload
    {
        public AthleteProfilePayload? AthleteProfile { get; set; }
        public FatigueRiskPayload? FatigueRisk { get; set; }
        public ProgressionSummaryPayload? ProgressionSummary { get; set; }
        public List<StrengthPayload>? Strengths { get; set; }
        public List<WeaknessPayload>? Weaknesses { get; set; }
        public List<RecommendationPayload>? Recommendations { get; set; }
    }

    private class AthleteProfilePayload
    {
        public string? Summary { get; set; }
        public string? TrainingAge { get; set; }
    }

    private class FatigueRiskPayload
    {
        public string? Level { get; set; }
        public int Score { get; set; }
        public string? Explanation { get; set; }
    }

    private class ProgressionSummaryPayload
    {
        public string? Overall { get; set; }
        public string? Summary { get; set; }
        public List<ExerciseTrendPayload>? Exercises { get; set; }
    }

    private class ExerciseTrendPayload
    {
        public string? Name { get; set; }
        public string? Trend { get; set; }
        public string? Detail { get; set; }
    }

    private class StrengthPayload
    {
        public string? Label { get; set; }
        public string? Detail { get; set; }
        public string? ExerciseRef { get; set; }
    }

    private class WeaknessPayload
    {
        public string? Label { get; set; }
        public string? Detail { get; set; }
        public string? ExerciseRef { get; set; }
    }

    private class RecommendationPayload
    {
        public string? Label { get; set; }
        public string? Detail { get; set; }
        public string? Priority { get; set; }
    }
}
