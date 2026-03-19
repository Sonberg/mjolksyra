namespace Mjolksyra.UseCases.Coaches.AnalyzeWorkoutText;

public class WorkoutTextAnalysisAiOptions
{
    public const string SectionName = "WorkoutTextAnalysisAi";

    public string BaseUrl { get; set; } = "https://api.openai.com/v1/";

    public string Model { get; set; } = "gpt-4.1-mini";

    public string MediaModel { get; set; } = "gpt-4o";

    public string? ApiKey { get; set; }
}

