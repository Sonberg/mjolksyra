using System.ClientModel;
using System.ComponentModel;
using System.Text.Json;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Options;
using Mjolksyra.Domain.AI;
using OpenAI;
using Xabe.FFmpeg;

namespace Mjolksyra.Infrastructure.AI;

public class GeminiWorkoutMediaAnalysisAgent(
    IOptions<GeminiOptions> options,
    IHttpClientFactory httpClientFactory) : IWorkoutMediaAnalysisAgent
{
    private const int MaxVideoFrames = 30;

    public async Task<WorkoutMediaAnalysis> AnalyzeAsync(WorkoutMediaAnalysisInput input, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(options.Value.ApiKey))
        {
            throw new InvalidOperationException("Gemini:ApiKey is required to analyze workout media.");
        }

        var clientOptions = new OpenAIClientOptions { Endpoint = new Uri(options.Value.OpenAiCompatibleEndpoint) };
        var openAiClient = new OpenAIClient(new ApiKeyCredential(options.Value.ApiKey), clientOptions);

        IChatClient chatClient = new ChatClientBuilder(
                openAiClient.GetChatClient(options.Value.ModelName).AsIChatClient())
            .UseFunctionInvocation()
            .Build();

        var tools = BuildTools(input.ToolDispatcher, cancellationToken);
        var userContent = await BuildUserContentAsync(input, cancellationToken);

        var messages = new List<ChatMessage>
        {
            new(ChatRole.System,
                "You analyze athlete workout text, image, and video context. " +
                "You have tools to query the athlete's historical workouts — use them to give progression-aware coaching feedback. " +
                "Always respond with strict JSON only once you have gathered enough context."),
            new(ChatRole.User, userContent),
        };

        var response = await chatClient.GetResponseAsync(
            messages,
            new ChatOptions { Tools = tools },
            cancellationToken);

        var content = response.Text ?? string.Empty;
        var json = ExtractJson(content);

        return TryParse(json) ?? new WorkoutMediaAnalysis
        {
            Summary = string.IsNullOrWhiteSpace(content) ? "No analysis content returned." : content,
            KeyFindings = [],
            TechniqueRisks = [],
            CoachSuggestions = [],
        };
    }

    private async Task<IList<AIContent>> BuildUserContentAsync(WorkoutMediaAnalysisInput input, CancellationToken cancellationToken)
    {
        var http = httpClientFactory.CreateClient();
        var contents = new List<AIContent>();

        var videoFrameCount = 0;

        foreach (var url in input.ImageUrls)
        {
            var bytes = await http.GetByteArrayAsync(url, cancellationToken);
            contents.Add(new DataContent(bytes, GetImageMimeType(url)));
        }

        foreach (var url in input.VideoUrls)
        {
            var frames = await ExtractVideoFramesAsync(url, http, cancellationToken);
            videoFrameCount += frames.Count;
            foreach (var frame in frames)
                contents.Add(new DataContent(frame, "image/jpeg"));
        }

        contents.Insert(0, new TextContent(BuildPrompt(input, videoFrameCount)));

        return contents;
    }

    private static async Task<IReadOnlyList<byte[]>> ExtractVideoFramesAsync(
        string videoUrl,
        HttpClient http,
        CancellationToken cancellationToken)
    {
        var inputPath = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid():N}.mp4");
        var framesDir = Path.Combine(Path.GetTempPath(), $"frames_{Guid.NewGuid():N}");

        try
        {
            Directory.CreateDirectory(framesDir);

            var videoBytes = await http.GetByteArrayAsync(videoUrl, cancellationToken);
            await File.WriteAllBytesAsync(inputPath, videoBytes, cancellationToken);

            var framePattern = Path.Combine(framesDir, "frame_%03d.jpg");

            await FFmpeg.Conversions.New()
                .AddParameter($"-i \"{inputPath}\"")
                .AddParameter($"-vf fps=1,scale=1280:-2")
                .AddParameter($"-frames:v {MaxVideoFrames}")
                .AddParameter("-q:v 2")
                .SetOutput(framePattern)
                .Start(cancellationToken);

            return Directory
                .GetFiles(framesDir, "*.jpg")
                .OrderBy(f => f)
                .Select(f => File.ReadAllBytes(f))
                .ToList();
        }
        finally
        {
            TryDelete(inputPath);
            TryDeleteDirectory(framesDir);
        }
    }

    private static string GetImageMimeType(string url)
    {
        if (url.Contains(".png", StringComparison.OrdinalIgnoreCase)) return "image/png";
        if (url.Contains(".jpg", StringComparison.OrdinalIgnoreCase) ||
            url.Contains(".jpeg", StringComparison.OrdinalIgnoreCase)) return "image/jpeg";
        if (url.Contains(".gif", StringComparison.OrdinalIgnoreCase)) return "image/gif";
        return "image/webp";
    }

    private static AIFunction[] BuildTools(IWorkoutAnalysisToolDispatcher dispatcher, CancellationToken ct)
    {
        [Description("Returns the N most recently completed workouts before a given date. Use to understand training load, recovery, and progression trends across sessions.")]
        async Task<string> GetRecentCompletedWorkouts(
            [Description("ISO 8601 date (YYYY-MM-DD). Return workouts completed before this date.")] string before_date,
            [Description("Number of workouts to return (1–10). Defaults to 5.")] int count = 5)
            => await dispatcher.GetRecentCompletedWorkoutsAsync(before_date, count, ct);

        [Description("Returns workouts containing a specific exercise. Use before_date to review past progression, after_date to see upcoming planned sessions. Response includes a 'completed' flag per workout.")]
        async Task<string> GetWorkoutsForExercise(
            [Description("Exact or approximate exercise name (e.g. 'Back Squat', 'Bench Press').")] string exercise_name,
            [Description("Number of workouts to return (1–10). Defaults to 5.")] int count = 5,
            [Description("Optional. ISO 8601 date (YYYY-MM-DD). Return only workouts on or before this date (completed sessions).")] string? before_date = null,
            [Description("Optional. ISO 8601 date (YYYY-MM-DD). Return workouts on or after this date, including upcoming planned sessions.")] string? after_date = null)
            => await dispatcher.GetWorkoutsForExerciseAsync(exercise_name, count, before_date, after_date, ct);

        return
        [
            AIFunctionFactory.Create(GetRecentCompletedWorkouts),
            AIFunctionFactory.Create(GetWorkoutsForExercise),
        ];
    }

    private static string BuildPrompt(WorkoutMediaAnalysisInput input, int videoFrameCount)
    {
        var imageCount = input.ImageUrls.Count;
        var videoCount = input.VideoUrls.Count;

        string mediaSection;
        if (imageCount == 0 && videoCount == 0)
        {
            mediaSection = "No media was provided.";
        }
        else
        {
            var parts = new List<string>();
            if (imageCount > 0) parts.Add($"{imageCount} image(s)");
            if (videoCount > 0) parts.Add($"{videoCount} video(s) sampled as {videoFrameCount} frame(s) at 1 frame per second");
            mediaSection = $"Media attached: {string.Join(", ", parts)}. Inspect all attached media for technique, form, and safety risks.";
        }

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

Use the text and media to produce a coach-friendly summary.
Use the available tools to look up historical workouts and provide progression-aware feedback.
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

    private static void TryDelete(string path)
    {
        try { File.Delete(path); }
        catch { /* ignore */ }
    }

    private static void TryDeleteDirectory(string path)
    {
        try { Directory.Delete(path, recursive: true); }
        catch { /* ignore */ }
    }

    private class GeminiWorkoutMediaAnalysisPayload
    {
        public string Summary { get; set; } = string.Empty;

        public ICollection<string>? KeyFindings { get; set; }

        public ICollection<string>? TechniqueRisks { get; set; }

        public ICollection<string>? CoachSuggestions { get; set; }
    }
}
