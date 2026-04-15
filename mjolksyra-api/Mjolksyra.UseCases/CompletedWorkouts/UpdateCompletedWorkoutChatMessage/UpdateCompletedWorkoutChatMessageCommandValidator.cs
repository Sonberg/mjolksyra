using FluentValidation;

namespace Mjolksyra.UseCases.CompletedWorkouts.UpdateCompletedWorkoutChatMessage;

public class UpdateCompletedWorkoutChatMessageCommandValidator : AbstractValidator<UpdateCompletedWorkoutChatMessageCommand>
{
    public UpdateCompletedWorkoutChatMessageCommandValidator()
    {
        RuleFor(x => x.Message.Message)
            .NotEmpty()
            .MaximumLength(4000);
    }
}
