using FluentValidation.TestHelper;
using Microsoft.Extensions.Options;
using Mjolksyra.UseCases.MediaStorage;
using Mjolksyra.UseCases.PlannedWorkouts.LogPlannedWorkout;

namespace Mjolksyra.UseCases.Tests.PlannedWorkouts;

public class LogPlannedWorkoutCommandValidatorTests
{
    private const string R2PublicBaseUrl = "https://media.example.com";

    private static LogPlannedWorkoutCommandValidator CreateValidator(string? publicBaseUrl = R2PublicBaseUrl)
        => new(Options.Create(new MediaStorageOptions { PublicBaseUrl = publicBaseUrl ?? string.Empty }));

    [Fact]
    public void Valid_R2_Url_Passes()
    {
        var validator = CreateValidator();
        var result = validator.TestValidate(CreateCommand([$"{R2PublicBaseUrl}/workouts/abc.webp"]));
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Valid_R2_Url_With_Query_Param_Passes()
    {
        var validator = CreateValidator();
        var result = validator.TestValidate(CreateCommand([$"{R2PublicBaseUrl}/workouts/abc.mp4?raw=1"]));
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Legacy_UtfsIo_Url_Passes()
    {
        var validator = CreateValidator();
        var result = validator.TestValidate(CreateCommand(["https://utfs.io/f/abc123"]));
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Legacy_UtfsIo_Url_With_Query_Param_Passes()
    {
        var validator = CreateValidator();
        var result = validator.TestValidate(CreateCommand(["https://utfs.io/f/abc123?ct=video"]));
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Multiple_Valid_Urls_Pass()
    {
        var validator = CreateValidator();
        var result = validator.TestValidate(CreateCommand([
            $"{R2PublicBaseUrl}/workouts/image1.webp",
            $"{R2PublicBaseUrl}/workouts/video1.mp4",
            "https://utfs.io/f/legacy-image",
        ]));
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Arbitrary_Url_Fails()
    {
        var validator = CreateValidator();
        var result = validator.TestValidate(CreateCommand(["https://evil.com/fake"]));
        result.ShouldHaveValidationErrorFor("Log.MediaUrls[0]");
    }

    [Fact]
    public void Subdomain_Of_R2Host_Fails()
    {
        var validator = CreateValidator();
        var result = validator.TestValidate(CreateCommand(["https://evil.media.example.com/workouts/abc.webp"]));
        result.ShouldHaveValidationErrorFor("Log.MediaUrls[0]");
    }

    [Fact]
    public void Subdomain_Of_UtfsIo_Fails()
    {
        var validator = CreateValidator();
        var result = validator.TestValidate(CreateCommand(["https://evil.utfs.io/f/abc123"]));
        result.ShouldHaveValidationErrorFor("Log.MediaUrls[0]");
    }

    [Fact]
    public void Non_Url_String_Fails()
    {
        var validator = CreateValidator();
        var result = validator.TestValidate(CreateCommand(["not-a-url"]));
        result.ShouldHaveValidationErrorFor("Log.MediaUrls[0]");
    }

    [Fact]
    public void Empty_MediaUrls_Passes()
    {
        var validator = CreateValidator();
        var result = validator.TestValidate(CreateCommand([]));
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
                MediaUrls = mediaUrls,
                Exercises = []
            }
        };
    }
}
