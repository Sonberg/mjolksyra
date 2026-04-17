using System.ClientModel;
using System.ComponentModel;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Options;
using Mjolksyra.Domain.AI;
using OpenAI;

namespace Mjolksyra.Infrastructure.AI;

public class GeminiTraineePlannerAgent(IOptions<GeminiOptions> options) : ITraineePlannerAgent
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    public async Task<AIPlannerClarifyOutput> ClarifyAsync(AIPlannerClarifyInput input, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(options.Value.ApiKey))
        {
            throw new InvalidOperationException("Gemini:ApiKey is required for workout planning.");
        }

        var chatClient = BuildChatClientWithTools();
        var tools = BuildClarifyTools(input.ToolDispatcher, cancellationToken);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var messages = new List<ChatMessage>
        {
            new(ChatRole.System,
                $"You are a workout planning assistant helping a coach design a program for an athlete. " +
                $"Today is {today:dddd, MMMM d, yyyy} ({today:yyyy-MM-dd}). Use this to resolve relative dates like 'monday next week', 'week 15', 'next monday'. " +
                $"ISO week numbers: week 1 starts on the first Monday of the year. Always convert dates to YYYY-MM-DD.\n\n" +
                $"This assistant is approval-first: never apply planner changes yourself. " +
                $"Inspect planner state with tools, then propose a single staged change set for coach approval.\n\n" +
                $"Allowed scope: future planned workouts only. Completed workouts are read-only. " +
                $"If the coach asks to change existing future workouts, use GetUpcomingWorkoutDetails to identify exact workout and exercise ids before proposing changes. " +
                $"For delete_workout, move_workout, update_workout, add_exercise, update_exercise, and delete_exercise actions, include both targetWorkoutId and targetDate whenever you can resolve them from the planner tools. " +
                $"For requests like 'delete all future workouts', interpret future as strictly after today, not including today. " +
                $"If any referenced workout is already completed, ignore it instead of proposing a delete for it.\n\n" +
                $"Use ConvertTimestampToWeekContext whenever the coach refers to week numbers or timestamps that need ISO week interpretation.\n\n" +
                $"For new block creation, gather what you need: start date, number of weeks, and conflict handling if relevant. " +
                $"Ask ONE focused question at a time. If the coach already answered something, do not ask again. " +
                $"When you have enough information to stage changes, set requiresApproval=true, isReadyToApply=true, and return proposedActionSet plus previewWorkouts.\n\n" +
                $"When your question has a fixed set of valid answers, include them in the 'options' array so the UI can render clickable choices. " +
                $"Examples: conflict strategy → [\"Skip\", \"Replace\", \"Append\"], days per week → [\"2\", \"3\", \"4\", \"5\"]. " +
                $"Leave options as [] for open-ended questions (e.g. start date in natural language).\n\n" +
                $"Always respond with strict JSON only:\n" +
                $"{{ \"message\": \"string\", \"isReadyToGenerate\": bool, \"isReadyToApply\": bool, \"requiresApproval\": bool, \"options\": [\"string\"], \"suggestedParams\": {{ \"startDate\": \"YYYY-MM-DD\", \"numberOfWeeks\": int, \"conflictStrategy\": \"Skip|Replace|Append\" }} | null, \"proposedActionSet\": {{ \"summary\": \"string\", \"explanation\": \"string | null\", \"actions\": [{{ \"actionType\": \"create_workout | update_workout | move_workout | delete_workout | add_exercise | update_exercise | delete_exercise\", \"summary\": \"string\", \"targetWorkoutId\": \"guid | null\", \"targetExerciseId\": \"guid | null\", \"targetDate\": \"YYYY-MM-DD | null\", \"previousDate\": \"YYYY-MM-DD | null\", \"workout\": {{ \"name\": \"string | null\", \"note\": \"string | null\", \"plannedAt\": \"YYYY-MM-DD\", \"exercises\": [{{ \"id\": \"guid | null\", \"exerciseId\": \"guid | null\", \"name\": \"string\", \"note\": \"string | null\", \"prescriptionType\": \"SetsReps | DurationSeconds | DistanceMeters | null\", \"sets\": [{{ \"reps\": int | null, \"weightKg\": float | null, \"durationSeconds\": int | null, \"distanceMeters\": float | null, \"note\": \"string | null\" }}] }}] }} | null }}] }} | null, \"previewWorkouts\": [{{ \"name\": \"string | null\", \"note\": \"string | null\", \"plannedAt\": \"YYYY-MM-DD\", \"exercises\": [{{ \"name\": \"string\", \"note\": \"string | null\", \"prescriptionType\": \"SetsReps | DurationSeconds | DistanceMeters | null\", \"sets\": [{{ \"reps\": int | null, \"weightKg\": float | null, \"durationSeconds\": int | null, \"distanceMeters\": float | null, \"note\": \"string | null\" }}] }}] }}] }}"),
            new(ChatRole.User, BuildClarifyPrompt(input)),
        };

        var response = await chatClient.GetResponseAsync(
            messages,
            new ChatOptions { Tools = tools },
            cancellationToken);

        var content = response.Text ?? string.Empty;
        var json = ExtractJson(content);

        return TryParseClarifyOutput(json) ?? new AIPlannerClarifyOutput
        {
            Message = string.IsNullOrWhiteSpace(content)
                ? "I'm ready to help you plan a workout program. Could you describe what you have in mind?"
                : content,
            IsReadyToGenerate = false,
        };
    }

    public async Task<ICollection<AIPlannerWorkoutOutput>> GenerateAsync(AIPlannerGenerateInput input, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(options.Value.ApiKey))
        {
            throw new InvalidOperationException("Gemini:ApiKey is required for workout planning.");
        }

        var chatClient = BuildChatClientWithTools();
        var tools = BuildGenerateTools(input.ToolDispatcher, cancellationToken);

        var messages = new List<ChatMessage>
        {
            new(ChatRole.System,
                "You are an expert strength and conditioning coach generating a structured workout program. " +
                "Use the available tools to review the athlete's training history, recent analyses, and exercise library before generating. " +
                "Match the training style, volume, and exercise preferences you observe in the history. " +
                "Incorporate any coaching notes from recent analyses. " +
                "Generate a realistic, progressive program that respects the athlete's current level. " +
                "Return ONLY a JSON array of workout objects with this exact shape:\n" +
                "[{ \"name\": \"string | null\", \"note\": \"string | null\", \"plannedAt\": \"YYYY-MM-DD\", " +
                "\"exercises\": [{ \"name\": \"string\", \"note\": \"string | null\", " +
                "\"prescriptionType\": \"SetsReps | DurationSeconds | DistanceMeters | null\", " +
                "\"sets\": [{ \"reps\": int | null, \"weightKg\": float | null, \"durationSeconds\": int | null, " +
                "\"distanceMeters\": float | null, \"note\": \"string | null\" }] }] }]"),
            new(ChatRole.User, BuildGeneratePrompt(input)),
        };

        var response = await chatClient.GetResponseAsync(
            messages,
            new ChatOptions { Tools = tools },
            cancellationToken);

        var content = response.Text ?? string.Empty;
        var json = ExtractJson(content, startChar: '[', endChar: ']');

        return TryParseWorkoutOutputs(json) ?? [];
    }

    private IChatClient BuildChatClient()
    {
        var clientOptions = new OpenAIClientOptions { Endpoint = new Uri(options.Value.OpenAiCompatibleEndpoint) };
        var openAiClient = new OpenAIClient(new ApiKeyCredential(options.Value.ApiKey), clientOptions);
        return openAiClient.GetChatClient(options.Value.ModelName).AsIChatClient();
    }

    private IChatClient BuildChatClientWithTools()
    {
        var clientOptions = new OpenAIClientOptions { Endpoint = new Uri(options.Value.OpenAiCompatibleEndpoint) };
        var openAiClient = new OpenAIClient(new ApiKeyCredential(options.Value.ApiKey), clientOptions);
        return new ChatClientBuilder(openAiClient.GetChatClient(options.Value.ModelName).AsIChatClient())
            .UseFunctionInvocation()
            .Build();
    }

    private static AIFunction[] BuildClarifyTools(ITraineePlannerToolDispatcher dispatcher, CancellationToken ct)
    {
        [Description("Returns all planned workouts (completed or upcoming) starting from a given date. Use to check what workouts are already scheduled before asking about start date or conflicts.")]
        async Task<string> GetUpcomingWorkouts(
            [Description("ISO 8601 date (YYYY-MM-DD). Return workouts from this date onwards.")] string after_date,
            [Description("Max number of workouts to return (1–50). Use 42 to cover 6 weeks at 7 days/week.")] int count = 42)
            => await dispatcher.GetUpcomingWorkoutsAsync(after_date, count, ct);

        [Description("Returns upcoming workout details including workout ids, exercise ids, notes, and sets. Use this before proposing edits, moves, deletes, or exercise changes.")]
        async Task<string> GetUpcomingWorkoutDetails(
            [Description("ISO 8601 date (YYYY-MM-DD). Return workouts from this date onwards.")] string after_date,
            [Description("Max number of workouts to return (1–50).")] int count = 20)
            => await dispatcher.GetUpcomingWorkoutDetailsAsync(after_date, count, ct);

        [Description("Searches the exercise library by name. Use to find canonical exercise names and IDs for proposals.")]
        async Task<string> SearchExercises(
            [Description("Exercise name to search for (e.g. 'squat', 'bench').")] string name)
            => await dispatcher.SearchExercisesAsync(name, ct);

        [Description("Converts a timestamp or date into ISO week context. Use for week-number reasoning in planning conversations.")]
        async Task<string> ConvertTimestampToWeekContext(
            [Description("A date or DateTimeOffset string, for example 2026-04-07 or 2026-04-07T05:31:21Z.")] string timestamp)
            => await dispatcher.ConvertTimestampToWeekContextAsync(timestamp, ct);

        return
        [
            AIFunctionFactory.Create(GetUpcomingWorkouts),
            AIFunctionFactory.Create(GetUpcomingWorkoutDetails),
            AIFunctionFactory.Create(SearchExercises),
            AIFunctionFactory.Create(ConvertTimestampToWeekContext),
        ];
    }

    private static AIFunction[] BuildGenerateTools(ITraineePlannerToolDispatcher dispatcher, CancellationToken ct)
    {
        [Description("Returns the N most recently completed workouts. Use to understand the athlete's training load, frequency, exercise selection, and volume patterns.")]
        async Task<string> GetRecentCompletedWorkouts(
            [Description("ISO 8601 date (YYYY-MM-DD). Return workouts completed before this date.")] string before_date,
            [Description("Number of workouts to return (1–10). Defaults to 5.")] int count = 5)
            => await dispatcher.GetRecentCompletedWorkoutsAsync(before_date, count, ct);

        [Description("Returns workouts containing a specific exercise. Use to understand the athlete's progression and history on key lifts.")]
        async Task<string> GetWorkoutsForExercise(
            [Description("Exact or approximate exercise name (e.g. 'Back Squat', 'Bench Press').")] string exercise_name,
            [Description("Number of workouts to return (1–10). Defaults to 5.")] int count = 5,
            [Description("Optional. ISO 8601 date (YYYY-MM-DD). Return completed workouts on or before this date.")] string? before_date = null,
            [Description("Optional. ISO 8601 date (YYYY-MM-DD). Return planned workouts on or after this date.")] string? after_date = null)
            => await dispatcher.GetWorkoutsForExerciseAsync(exercise_name, count, before_date, after_date, ct);

        [Description("Returns recent workout media analyses with coach feedback and technique notes. Use to understand coaching priorities and areas of focus.")]
        async Task<string> GetRecentWorkoutAnalyses(
            [Description("Number of analyses to return (1–5). Defaults to 3.")] int count = 3)
            => await dispatcher.GetRecentWorkoutAnalysesAsync(count, ct);

        [Description("Searches the exercise library by name. Use to find canonical exercise names and IDs to include in the program.")]
        async Task<string> SearchExercises(
            [Description("Exercise name to search for (e.g. 'squat', 'deadlift').")] string name)
            => await dispatcher.SearchExercisesAsync(name, ct);

        [Description("Returns the latest AI-generated insights for the athlete including fatigue risk, training age, progression summary, strengths, weaknesses, and top recommendations. Use to personalize program design and volume decisions.")]
        async Task<string> GetTraineeInsights()
            => await dispatcher.GetTraineeInsightsAsync(ct);

        [Description("Returns the coach's style profile and cross-athlete effectiveness patterns. Use to align new programs with the coach's proven coaching patterns and preferences.")]
        async Task<string> GetCoachInsights()
            => await dispatcher.GetCoachInsightsAsync(ct);

        return
        [
            AIFunctionFactory.Create(GetRecentCompletedWorkouts),
            AIFunctionFactory.Create(GetWorkoutsForExercise),
            AIFunctionFactory.Create(GetRecentWorkoutAnalyses),
            AIFunctionFactory.Create(SearchExercises),
            AIFunctionFactory.Create(GetTraineeInsights),
            AIFunctionFactory.Create(GetCoachInsights),
        ];
    }

    private static string BuildClarifyPrompt(AIPlannerClarifyInput input)
    {
        var fileSection = input.FilesContent.Count == 0
            ? "No files uploaded."
            : string.Join('\n', input.FilesContent.Select(f => $"--- File: {f.Name} ({f.Type}) ---\n{f.Content}"));

        var historySection = input.ConversationHistory.Count == 0
            ? string.Empty
            : "\n\nConversation so far:\n" + string.Join('\n',
                input.ConversationHistory.Select(m => $"[{m.Role}]: {m.Content}"));

        return $"Workout program request:\n{input.Description}\n\nAttached files:\n{fileSection}{historySection}";
    }

    private static string BuildGeneratePrompt(AIPlannerGenerateInput input)
    {
        var fileSection = input.FilesContent.Count == 0
            ? "No files uploaded."
            : string.Join('\n', input.FilesContent.Select(f => $"--- File: {f.Name} ({f.Type}) ---\n{f.Content}"));

        var historySection = input.ConversationHistory.Count == 0
            ? string.Empty
            : "\n\nPlanning conversation:\n" + string.Join('\n',
                input.ConversationHistory.Select(m => $"[{m.Role}]: {m.Content}"));

        return $"Generate a workout program based on this request:\n{input.Description}\n\n" +
               $"Parameters:\n" +
               $"- Start date: {input.Params.StartDate}\n" +
               $"- Number of weeks: {input.Params.NumberOfWeeks}\n" +
               $"- Conflict strategy: {input.Params.ConflictStrategy}\n\n" +
               $"Attached files:\n{fileSection}{historySection}\n\n" +
               $"Use the tools to review training history and match the athlete's style. " +
               $"Generate workouts for every training day. Today is {DateOnly.FromDateTime(DateTime.UtcNow):yyyy-MM-dd}.";
    }

    private static string ExtractJson(string value, char startChar = '{', char endChar = '}')
    {
        var start = value.IndexOf(startChar);
        var end = value.LastIndexOf(endChar);

        if (start < 0 || end < start)
        {
            return value;
        }

        return value[start..(end + 1)];
    }

    private static AIPlannerClarifyOutput? TryParseClarifyOutput(string json)
    {
        try
        {
            var payload = JsonSerializer.Deserialize<ClarifyPayload>(json, JsonOptions);

            if (payload is null || string.IsNullOrWhiteSpace(payload.Message))
            {
                return null;
            }

            return new AIPlannerClarifyOutput
            {
                Message = payload.Message,
                IsReadyToGenerate = payload.IsReadyToGenerate,
                IsReadyToApply = payload.IsReadyToApply,
                RequiresApproval = payload.RequiresApproval,
                Options = payload.Options ?? [],
                SuggestedParams = payload.SuggestedParams is null ? null : new AIPlannerSuggestedParams
                {
                    StartDate = payload.SuggestedParams.StartDate,
                    NumberOfWeeks = payload.SuggestedParams.NumberOfWeeks,
                    ConflictStrategy = payload.SuggestedParams.ConflictStrategy ?? "Skip",
                },
                ProposedActionSet = payload.ProposedActionSet is null ? null : new AIPlannerActionSet
                {
                    Summary = payload.ProposedActionSet.Summary,
                    Explanation = payload.ProposedActionSet.Explanation,
                    Actions = (payload.ProposedActionSet.Actions ?? []).Select(action => new AIPlannerActionProposal
                    {
                        ActionType = action.ActionType,
                        Summary = action.Summary,
                        TargetWorkoutId = Guid.TryParse(action.TargetWorkoutId, out var twId) ? twId : null,
                        TargetExerciseId = Guid.TryParse(action.TargetExerciseId, out var teId) ? teId : null,
                        TargetDate = action.TargetDate,
                        PreviousDate = action.PreviousDate,
                        Workout = action.Workout is null ? null : new PlannedWorkoutRequestPayload
                        {
                            Name = action.Workout.Name,
                            Note = action.Workout.Note,
                            PlannedAt = action.Workout.PlannedAt,
                            Exercises = (action.Workout.Exercises ?? []).Select(exercise => new PlannedExerciseRequestPayload
                            {
                                Id = Guid.TryParse(exercise.Id, out var eId) ? eId : null,
                                ExerciseId = Guid.TryParse(exercise.ExerciseId, out var exId) ? exId : null,
                                Name = exercise.Name,
                                Note = exercise.Note,
                                PrescriptionType = exercise.PrescriptionType,
                                Sets = (exercise.Sets ?? []).Select(set => new AIPlannerSetOutput
                                {
                                    Reps = set.Reps,
                                    WeightKg = set.WeightKg,
                                    DurationSeconds = set.DurationSeconds,
                                    DistanceMeters = set.DistanceMeters,
                                    Note = set.Note,
                                }).ToList(),
                            }).ToList(),
                        },
                    }).ToList(),
                },
                PreviewWorkouts = (payload.PreviewWorkouts ?? []).Select(p => new AIPlannerWorkoutOutput
                {
                    Name = p.Name,
                    Note = p.Note,
                    PlannedAt = p.PlannedAt,
                    Exercises = (p.Exercises ?? []).Select(e => new AIPlannerExerciseOutput
                    {
                        Name = e.Name,
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
                }).ToList(),
            };
        }
        catch
        {
            return null;
        }
    }

    private static ICollection<AIPlannerWorkoutOutput>? TryParseWorkoutOutputs(string json)
    {
        try
        {
            var payloads = JsonSerializer.Deserialize<List<WorkoutPayload>>(json, JsonOptions);

            if (payloads is null || payloads.Count == 0)
            {
                return null;
            }

            return payloads.Select(p => new AIPlannerWorkoutOutput
            {
                Name = p.Name,
                Note = p.Note,
                PlannedAt = p.PlannedAt ?? string.Empty,
                Exercises = (p.Exercises ?? []).Select(e => new AIPlannerExerciseOutput
                {
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
            }).ToList();
        }
        catch
        {
            return null;
        }
    }

    private class ClarifyPayload
    {
        public string Message { get; set; } = string.Empty;

        public bool IsReadyToGenerate { get; set; }

        public bool IsReadyToApply { get; set; }

        public bool RequiresApproval { get; set; }

        public List<string>? Options { get; set; }

        public SuggestedParamsPayload? SuggestedParams { get; set; }

        public ProposedActionSetPayload? ProposedActionSet { get; set; }

        public List<WorkoutPayload>? PreviewWorkouts { get; set; }
    }

    private class SuggestedParamsPayload
    {
        public string StartDate { get; set; } = string.Empty;

        public int NumberOfWeeks { get; set; }

        public string? ConflictStrategy { get; set; }
    }

    private class WorkoutPayload
    {
        public string? Name { get; set; }

        public string? Note { get; set; }

        public string? PlannedAt { get; set; }

        public List<ExercisePayload>? Exercises { get; set; }
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

        public string? TargetDate { get; set; }

        public string? PreviousDate { get; set; }

        public WorkoutPayload? Workout { get; set; }
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
