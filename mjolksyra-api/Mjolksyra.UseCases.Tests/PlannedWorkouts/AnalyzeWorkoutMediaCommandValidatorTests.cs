using FluentValidation.TestHelper;
using Microsoft.Extensions.Options;
using Mjolksyra.UseCases.MediaStorage;
using Mjolksyra.UseCases.PlannedWorkouts;
using Mjolksyra.UseCases.PlannedWorkouts.AnalyzeWorkoutMedia;

namespace Mjolksyra.UseCases.Tests.PlannedWorkouts;

public class AnalyzeWorkoutMediaCommandValidatorTests
{
    private const string R2PublicBaseUrl = "https://media.example.com";

    private static AnalyzeWorkoutMediaCommandValidator CreateValidator(string? publicBaseUrl = R2PublicBaseUrl)
        => new(Options.Create(new MediaStorageOptions { PublicBaseUrl = publicBaseUrl ?? string.Empty }));

    [Fact]
    public void Valid_Text_Only_Passes()
    {
        var validator = CreateValidator();
        var result = validator.TestValidate(CreateCommand("Looks good", []));
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Valid_Media_Only_Passes()
    {
        var validator = CreateValidator();
        var result = validator.TestValidate(CreateCommand("", [$"{R2PublicBaseUrl}/workouts/abc.webp"]));
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Empty_Text_And_Media_Fails()
    {
        var validator = CreateValidator();
        var result = validator.TestValidate(CreateCommand("   ", []));
        result.ShouldHaveValidationErrorFor(x => x.Analysis);
    }

    [Fact]
    public void Invalid_Media_Url_Fails()
    {
        var validator = CreateValidator();
        var result = validator.TestValidate(CreateCommand("review", ["https://evil.com/video.mp4"]));
        result.ShouldHaveValidationErrorFor("Analysis.MediaUrls[0]");
    }

    [Fact]
    public void Too_Many_Media_Urls_Fails()
    {
        var validator = CreateValidator();
        var urls = Enumerable.Range(0, 11)
            .Select(i => $"{R2PublicBaseUrl}/workouts/{i}.webp")
            .ToArray();
        var result = validator.TestValidate(CreateCommand("review", urls));
        result.ShouldHaveValidationErrorFor(x => x.Analysis.MediaUrls);
    }

    private static AnalyzeWorkoutMediaCommand CreateCommand(string text, ICollection<string> mediaUrls)
    {
        return new AnalyzeWorkoutMediaCommand
        {
            TraineeId = Guid.NewGuid(),
            PlannedWorkoutId = Guid.NewGuid(),
            Analysis = new WorkoutMediaAnalysisRequest
            {
                Text = text,
                MediaUrls = mediaUrls,
            }
        };
    }
}
