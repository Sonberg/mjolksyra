using System.ClientModel;
using System.ComponentModel;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Options;
using Mjolksyra.Domain.AI;
using OpenAI;

namespace Mjolksyra.Infrastructure.AI;

public class GeminiBlockPlannerAgent(IOptions<GeminiOptions> options) : IBlockPlannerAgent
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    public async Task<BlockPlannerClarifyOutput> ClarifyAsync(BlockPlannerClarifyInput input, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(options.Value.ApiKey))
        {
            throw new InvalidOperationException("Gemini:ApiKey is required for block planning.");
        }

        var chatClient = BuildChatClientWithTools();
        var tools = BuildClarifyTools(input.ToolDispatcher, cancellationToken);

        var messages = new List<ChatMessage>
        {
            new(ChatRole.System,
                "You are a workout block design assistant helping a coach create a reusable training block template. " +
                "A block is a multi-week training template: workouts are positioned by week number (1-based) and day of week (1=Monday … 7=Sunday). " +
                "There are no calendar dates — positions are always week + dayOfWeek.\n\n" +
                "This assistant is approval-first: never apply changes yourself. " +
                "Inspect the current block structure with GetBlockStructure first, then propose a staged change set for coach approval.\n\n" +
                "Use SearchExercises to find canonical exercise names and IDs before proposing exercises. " +
                "If the coach optionally mentions a specific athlete, you may call GetTraineeInsights with their trainee ID for context.\n\n" +
                "Ask ONE focused question at a time. If the coach has already answered something, do not ask again. " +
                "When you have enough information, set requiresApproval=true, isReadyToApply=true, and return proposedActionSet.\n\n" +
                "When your question has a fixed set of valid answers, include them in the 'options' array. " +
                "Leave options as [] for open-ended questions.\n\n" +
                "Always respond with strict JSON only:\n" +
                "{ \"message\": \"string\", \"isReadyToApply\": bool, \"requiresApproval\": bool, \"options\": [\"string\"], " +
                "\"proposedActionSet\": { \"summary\": \"string\", \"explanation\": \"string | null\", " +
                "\"actions\": [{ \"actionType\": \"create_block_workout | update_block_workout | delete_block_workout | add_block_exercise | update_block_exercise | delete_block_exercise\", " +
                "\"summary\": \"string\", \"targetWorkoutId\": \"guid | null\", \"targetExerciseId\": \"guid | null\", " +
                "\"targetWeek\": int | null, \"targetDayOfWeek\": int | null, \"previousWeek\": int | null, \"previousDayOfWeek\": int | null, " +
                "\"workout\": { \"name\": \"string | null\", \"note\": \"string | null\", \"week\": int, \"dayOfWeek\": int, " +
                "\"exercises\": [{ \"id\": \"guid | null\", \"exerciseId\": \"guid | null\", \"name\": \"string\", \"note\": \"string | null\", " +
                "\"prescriptionType\": \"SetsReps | DurationSeconds | DistanceMeters | null\", " +
                "\"sets\": [{ \"reps\": int | null, \"weightKg\": float | null, \"durationSeconds\": int | null, " +
                "\"distanceMeters\": float | null, \"note\": \"string | null\" }] }] } | null }] } | null }"),
            new(ChatRole.User, BuildClarifyPrompt(input)),
        };

        var response = await chatClient.GetResponseAsync(
            messages,
            new ChatOptions { Tools = tools },
            cancellationToken);

        var content = response.Text ?? string.Empty;
        var json = ExtractJson(content);

        return TryParseClarifyOutput(json) ?? new BlockPlannerClarifyOutput
        {
            Message = string.IsNullOrWhiteSpace(content)
                ? "I'm ready to help you design a training block. Describe what you have in mind."
                : content,
            IsReadyToApply = false,
        };
    }

    private IChatClient BuildChatClientWithTools()
    {
        var clientOptions = new OpenAIClientOptions { Endpoint = new Uri(options.Value.OpenAiCompatibleEndpoint) };
        var openAiClient = new OpenAIClient(new ApiKeyCredential(options.Value.ApiKey), clientOptions);
        return new ChatClientBuilder(openAiClient.GetChatClient(options.Value.ModelName).AsIChatClient())
            .UseFunctionInvocation()
            .Build();
    }

    private static AIFunction[] BuildClarifyTools(IBlockPlannerToolDispatcher dispatcher, CancellationToken ct)
    {
        [Description("Returns the current structure of the block including all workouts and exercises. Always call this first to understand what already exists.")]
        async Task<string> GetBlockStructure()
            => await dispatcher.GetBlockStructureAsync(ct);

        [Description("Searches the exercise library by name. Use to find canonical exercise names and IDs for proposals.")]
        async Task<string> SearchExercises(
            [Description("Exercise name to search for (e.g. 'squat', 'bench').")] string name)
            => await dispatcher.SearchExercisesAsync(name, ct);

        [Description("Returns insights for a specific trainee. Use when the coach mentions an athlete and wants to tailor the block to their profile.")]
        async Task<string> GetTraineeInsights(
            [Description("Trainee GUID.")] string trainee_id)
            => Guid.TryParse(trainee_id, out var id)
                ? await dispatcher.GetTraineeInsightsAsync(id, ct)
                : "{}";

        return
        [
            AIFunctionFactory.Create(GetBlockStructure),
            AIFunctionFactory.Create(SearchExercises),
            AIFunctionFactory.Create(GetTraineeInsights),
        ];
    }

    private static string BuildClarifyPrompt(BlockPlannerClarifyInput input)
    {
        var fileSection = input.FilesContent.Count == 0
            ? "No files uploaded."
            : string.Join('\n', input.FilesContent.Select(f => $"--- File: {f.Name} ({f.Type}) ---\n{f.Content}"));

        var historySection = input.ConversationHistory.Count == 0
            ? string.Empty
            : "\n\nConversation so far:\n" + string.Join('\n',
                input.ConversationHistory.Select(m => $"[{m.Role}]: {m.Content}"));

        return $"Block design request:\n{input.Description}\n\nAttached files:\n{fileSection}{historySection}";
    }

    private static string ExtractJson(string value)
    {
        var start = value.IndexOf('{');
        var end = value.LastIndexOf('}');
        return start >= 0 && end > start ? value[start..(end + 1)] : value;
    }

    private static BlockPlannerClarifyOutput? TryParseClarifyOutput(string json)
    {
        try
        {
            var payload = JsonSerializer.Deserialize<ClarifyPayload>(json, JsonOptions);
            if (payload is null || string.IsNullOrWhiteSpace(payload.Message))
            {
                return null;
            }

            return new BlockPlannerClarifyOutput
            {
                Message = payload.Message,
                IsReadyToApply = payload.IsReadyToApply,
                RequiresApproval = payload.RequiresApproval,
                Options = payload.Options ?? [],
                ProposedActionSet = payload.ProposedActionSet is null ? null : new BlockPlannerActionSet
                {
                    Summary = payload.ProposedActionSet.Summary,
                    Explanation = payload.ProposedActionSet.Explanation,
                    Actions = (payload.ProposedActionSet.Actions ?? []).Select(action => new BlockPlannerActionProposal
                    {
                        ActionType = action.ActionType,
                        Summary = action.Summary,
                        TargetWorkoutId = Guid.TryParse(action.TargetWorkoutId, out var twId) ? twId : null,
                        TargetExerciseId = Guid.TryParse(action.TargetExerciseId, out var teId) ? teId : null,
                        TargetWeek = action.TargetWeek,
                        TargetDayOfWeek = action.TargetDayOfWeek,
                        PreviousWeek = action.PreviousWeek,
                        PreviousDayOfWeek = action.PreviousDayOfWeek,
                        Workout = action.Workout is null ? null : new BlockWorkoutRequestPayload
                        {
                            Name = action.Workout.Name,
                            Note = action.Workout.Note,
                            Week = action.Workout.Week,
                            DayOfWeek = action.Workout.DayOfWeek,
                            Exercises = (action.Workout.Exercises ?? []).Select(e => new PlannedExerciseRequestPayload
                            {
                                Id = Guid.TryParse(e.Id, out var eId) ? eId : null,
                                ExerciseId = Guid.TryParse(e.ExerciseId, out var exId) ? exId : null,
                                Name = e.Name ?? string.Empty,
                                Note = e.Note,
                                PrescriptionType = e.PrescriptionType,
                                Sets = (e.Sets ?? []).Select(s => new AIPlannerSetOutput
                                {
                                    Reps = s.Reps,
                                    WeightKg = s.WeightKg,
                                    DurationSeconds = s.DurationSeconds,
                                    DistanceMeters = s.DistanceMeters,
                                    Note = s.Note,
                                }).ToList(),
                            }).ToList(),
                        },
                    }).ToList(),
                },
            };
        }
        catch
        {
            return null;
        }
    }

    private class ClarifyPayload
    {
        public string Message { get; set; } = string.Empty;
        public bool IsReadyToApply { get; set; }
        public bool RequiresApproval { get; set; }
        public List<string>? Options { get; set; }
        public ProposedActionSetPayload? ProposedActionSet { get; set; }
    }

    private class ProposedActionSetPayload
    {
        public string Summary { get; set; } = string.Empty;
        public string? Explanation { get; set; }
        public List<ActionPayload>? Actions { get; set; }
    }

    private class ActionPayload
    {
        public string ActionType { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public string? TargetWorkoutId { get; set; }
        public string? TargetExerciseId { get; set; }
        public int? TargetWeek { get; set; }
        public int? TargetDayOfWeek { get; set; }
        public int? PreviousWeek { get; set; }
        public int? PreviousDayOfWeek { get; set; }
        public WorkoutPayload? Workout { get; set; }
    }

    private class WorkoutPayload
    {
        public string? Name { get; set; }
        public string? Note { get; set; }
        public int Week { get; set; }
        public int DayOfWeek { get; set; }
        public List<ExercisePayload>? Exercises { get; set; }
    }

    private class ExercisePayload
    {
        public string? Id { get; set; }
        public string? ExerciseId { get; set; }
        public string? Name { get; set; }
        public string? Note { get; set; }
        public string? PrescriptionType { get; set; }
        public List<SetPayload>? Sets { get; set; }
    }

    private class SetPayload
    {
        public int? Reps { get; set; }
        public double? WeightKg { get; set; }
        public int? DurationSeconds { get; set; }
        public double? DistanceMeters { get; set; }
        public string? Note { get; set; }
    }
}
