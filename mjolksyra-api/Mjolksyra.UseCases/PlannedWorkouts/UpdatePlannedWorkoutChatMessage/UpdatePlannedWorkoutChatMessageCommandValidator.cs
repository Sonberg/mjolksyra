using FluentValidation;

namespace Mjolksyra.UseCases.PlannedWorkouts.UpdatePlannedWorkoutChatMessage;

public class UpdatePlannedWorkoutChatMessageCommandValidator : AbstractValidator<UpdatePlannedWorkoutChatMessageCommand>
{
    public UpdatePlannedWorkoutChatMessageCommandValidator()
    {
        RuleFor(x => x.Message.Message)
            .NotEmpty()
            .MaximumLength(4000);
    }
}
