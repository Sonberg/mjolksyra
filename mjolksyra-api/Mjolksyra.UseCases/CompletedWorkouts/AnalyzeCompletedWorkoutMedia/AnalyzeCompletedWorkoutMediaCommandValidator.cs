using FluentValidation;

namespace Mjolksyra.UseCases.CompletedWorkouts.AnalyzeCompletedWorkoutMedia;

public class AnalyzeCompletedWorkoutMediaCommandValidator : AbstractValidator<AnalyzeCompletedWorkoutMediaCommand>
{
    private const int MaxTextLength = 4000;

    public AnalyzeCompletedWorkoutMediaCommandValidator()
    {
        RuleFor(x => x.Analysis.Text)
            .MaximumLength(MaxTextLength);
    }
}
