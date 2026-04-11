using FluentValidation.TestHelper;
using Mjolksyra.UseCases.CompletedWorkouts;
using Mjolksyra.UseCases.CompletedWorkouts.AnalyzeCompletedWorkoutMedia;

namespace Mjolksyra.UseCases.Tests.CompletedWorkouts;

public class AnalyzeCompletedWorkoutMediaCommandValidatorTests
{
    private static AnalyzeCompletedWorkoutMediaCommandValidator CreateValidator() => new();

    [Fact]
    public void Valid_Text_Only_Passes()
    {
        var validator = CreateValidator();
        var result = validator.TestValidate(CreateCommand("Looks good"));
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Empty_Text_And_Media_Passes()
    {
        var validator = CreateValidator();
        var result = validator.TestValidate(CreateCommand("   "));
        result.ShouldNotHaveAnyValidationErrors();
    }

    private static AnalyzeCompletedWorkoutMediaCommand CreateCommand(string text)
    {
        return new AnalyzeCompletedWorkoutMediaCommand
        {
            TraineeId = Guid.NewGuid(),
            CompletedWorkoutId = Guid.NewGuid(),
            Analysis = new CompletedWorkoutMediaAnalysisRequest
            {
                Text = text,
            }
        };
    }
}
