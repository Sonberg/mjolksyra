using FluentValidation.TestHelper;
using Mjolksyra.UseCases.PlannedWorkouts.LogPlannedWorkout;

namespace Mjolksyra.UseCases.Tests.PlannedWorkouts;

public class LogPlannedWorkoutCommandValidatorTests
{
    private readonly LogPlannedWorkoutCommandValidator _validator = new();

    [Fact]
    public void Valid_UtfsIo_Url_Passes()
    {
        var result = _validator.TestValidate(CreateCommand(["https://utfs.io/f/abc123"]));
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Valid_UtfsIo_Url_With_Query_Param_Passes()
    {
        var result = _validator.TestValidate(CreateCommand(["https://utfs.io/f/abc123?ct=video"]));
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Multiple_Valid_UtfsIo_Urls_Pass()
    {
        var result = _validator.TestValidate(CreateCommand([
            "https://utfs.io/f/image1.jpg",
            "https://utfs.io/f/video1?ct=video"
        ]));
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Arbitrary_Url_Fails()
    {
        var result = _validator.TestValidate(CreateCommand(["https://evil.com/fake"]));
        result.ShouldHaveValidationErrorFor("Log.MediaUrls[0]");
    }

    [Fact]
    public void Subdomain_Of_UtfsIo_Fails()
    {
        var result = _validator.TestValidate(CreateCommand(["https://evil.utfs.io/f/abc123"]));
        result.ShouldHaveValidationErrorFor("Log.MediaUrls[0]");
    }

    [Fact]
    public void Non_Url_String_Fails()
    {
        var result = _validator.TestValidate(CreateCommand(["not-a-url"]));
        result.ShouldHaveValidationErrorFor("Log.MediaUrls[0]");
    }

    [Fact]
    public void Empty_MediaUrls_Passes()
    {
        var result = _validator.TestValidate(CreateCommand([]));
        result.ShouldNotHaveAnyValidationErrors();
    }

    private static LogPlannedWorkoutCommand CreateCommand(ICollection<string> mediaUrls)
    {
        return new LogPlannedWorkoutCommand
        {
            TraineeId = Guid.NewGuid(),
            PlannedWorkoutId = Guid.NewGuid(),
            Log = new LogPlannedWorkoutRequest
            {
                CompletedAt = DateTimeOffset.UtcNow,
                CompletionNote = null,
                MediaUrls = mediaUrls,
                Exercises = []
            }
        };
    }
}
