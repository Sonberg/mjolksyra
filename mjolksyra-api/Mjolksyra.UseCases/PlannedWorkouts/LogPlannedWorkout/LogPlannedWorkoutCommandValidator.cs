using FluentValidation;

namespace Mjolksyra.UseCases.PlannedWorkouts.LogPlannedWorkout;

public class LogPlannedWorkoutCommandValidator : AbstractValidator<LogPlannedWorkoutCommand>
{
    public LogPlannedWorkoutCommandValidator()
    {
        RuleForEach(x => x.Log.MediaUrls)
            .Must(url => Uri.TryCreate(url, UriKind.Absolute, out var u) && u.Host == "utfs.io")
            .WithMessage("'{PropertyValue}' is not a valid UploadThing URL.");
    }
}
