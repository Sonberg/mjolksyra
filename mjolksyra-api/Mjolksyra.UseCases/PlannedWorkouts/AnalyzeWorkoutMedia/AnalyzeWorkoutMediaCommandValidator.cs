using FluentValidation;

namespace Mjolksyra.UseCases.PlannedWorkouts.AnalyzeWorkoutMedia;

public class AnalyzeWorkoutMediaCommandValidator : AbstractValidator<AnalyzeWorkoutMediaCommand>
{
    private const int MaxTextLength = 4000;

    public AnalyzeWorkoutMediaCommandValidator()
    {
        RuleFor(x => x.Analysis.Text)
            .MaximumLength(MaxTextLength);
    }
}
