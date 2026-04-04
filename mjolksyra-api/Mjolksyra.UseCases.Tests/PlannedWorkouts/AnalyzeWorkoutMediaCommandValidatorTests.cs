using FluentValidation.TestHelper;
using Mjolksyra.UseCases.PlannedWorkouts;
using Mjolksyra.UseCases.PlannedWorkouts.AnalyzeWorkoutMedia;

namespace Mjolksyra.UseCases.Tests.PlannedWorkouts;

public class AnalyzeWorkoutMediaCommandValidatorTests
{
    private static AnalyzeWorkoutMediaCommandValidator CreateValidator() => new();

    [Fact]
    public void Valid_Text_Only_Passes()
    {
        var validator = CreateValidator();
        var result = validator.TestValidate(CreateCommand("Looks good", []));
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Empty_Text_And_Media_Passes()
    {
        var validator = CreateValidator();
        var result = validator.TestValidate(CreateCommand("   ", []));
        result.ShouldNotHaveAnyValidationErrors();
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
