using System.ClientModel;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Options;
using Mjolksyra.Domain.AI;
using OpenAI;

namespace Mjolksyra.Infrastructure.AI;

public class GeminiSurpriseBlockAgent(IOptions<GeminiOptions> options) : ISurpriseBlockAgent
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    public async Task<SurpriseBlockOutput> GenerateAsync(SurpriseBlockInput input, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(options.Value.ApiKey))
        {
            throw new InvalidOperationException("Gemini:ApiKey is required for surprise block generation.");
        }

        var clientOptions = new OpenAIClientOptions { Endpoint = new Uri(options.Value.OpenAiCompatibleEndpoint) };
        var openAiClient = new OpenAIClient(new ApiKeyCredential(options.Value.ApiKey), clientOptions);
        var chatClient = openAiClient.GetChatClient(options.Value.ModelName).AsIChatClient();

        var messages = new List<ChatMessage>
        {
            new(ChatRole.System, BuildSystemPrompt()),
            new(ChatRole.User, BuildUserPrompt(input)),
        };

        var response = await chatClient.GetResponseAsync(messages, cancellationToken: cancellationToken);
        var content = response.Text ?? string.Empty;
        var json = ExtractJson(content);

        return TryParse(json) ?? new SurpriseBlockOutput
        {
            Name = "Generated Block",
            NumberOfWeeks = 4,
            BlockType = "BuildPower",
            Workouts = []
        };
    }

    private static string BuildSystemPrompt() =>
        "You are an elite powerlifting coach AI. Generate a complete, immediately applicable training block. " +
        "Select the optimal block type based on the athlete's goals, experience, competition date, and previous training. " +
        "Use the athlete's preferred intensity method (weight, RPE, or RIR). " +
        "For beginners: limit to 3-4 core compound lifts. For advanced: include specialty variations. " +
        "Respect equipment constraints — only prescribe exercises the athlete can perform. " +
        "Never ask questions. Return ONLY valid JSON.\n\n" +
        "Block types: BuildPower (heavy compounds, 3-5 reps, 85-95%), Stretch (volume, 8-12 reps, 65-75%), " +
        "CompetitionReady (peak, heavy singles, competition openers), Recovery (deload, 50-60%, technique focus).\n\n" +
        "Return JSON with this exact shape:\n" +
        "{ \"name\": \"string\", \"numberOfWeeks\": int, \"blockType\": \"BuildPower|Stretch|CompetitionReady|Recovery\", " +
        "\"workouts\": [{ \"name\": \"string\", \"week\": int, \"dayOfWeek\": int, \"note\": \"string|null\", " +
        "\"exercises\": [{ \"name\": \"string\", \"note\": \"string|null\", \"repStyle\": \"Regular|Paused|Eccentric|null\", " +
        "\"sets\": [{ \"reps\": int|null, \"weightKg\": float|null, \"rpeTarget\": float|null, \"rirTarget\": int|null, \"note\": \"string|null\" }] }] }] }";

    private static string BuildUserPrompt(SurpriseBlockInput input)
    {
        var equipment = input.Equipment.Count == 0
            ? "Full gym access assumed"
            : string.Join(", ", input.Equipment);

        var goals = input.Athlete.Goals.Count == 0
            ? "General strength"
            : string.Join(", ", input.Athlete.Goals);

        var competitionSection = input.CompetitionDate is not null
            ? $"\nCompetition date: {input.CompetitionDate}"
            : string.Empty;

        var previousSection = input.PreviousBlockReflection is not null
            ? $"\nPrevious block ({input.PreviousBlockType}): {input.PreviousBlockReflection}"
            : string.Empty;

        var recentWorkouts = input.Athlete.RecentWorkoutsSummary is not null
            ? $"\nRecent workout history: {input.Athlete.RecentWorkoutsSummary}"
            : string.Empty;

        return $"Athlete profile:\n" +
               $"- Experience: {input.Athlete.ExperienceLevel}\n" +
               $"- Intensity method: {input.Athlete.IntensityMethod}\n" +
               $"- Rep style preference: {input.Athlete.PreferredRepStyle}\n" +
               $"- Workouts per week: {input.Athlete.WorkoutsPerWeek}\n" +
               $"- Goals: {goals}\n" +
               $"- Available equipment: {equipment}" +
               competitionSection +
               previousSection +
               recentWorkouts +
               "\n\nGenerate the optimal next training block for this athlete now.";
    }

    private static string ExtractJson(string value)
    {
        var start = value.IndexOf('{');
        var end = value.LastIndexOf('}');
        return start >= 0 && end > start ? value[start..(end + 1)] : value;
    }

    private static SurpriseBlockOutput? TryParse(string json)
    {
        try
        {
            return JsonSerializer.Deserialize<SurpriseBlockOutput>(json, JsonOptions);
        }
        catch
        {
            return null;
        }
    }
}
