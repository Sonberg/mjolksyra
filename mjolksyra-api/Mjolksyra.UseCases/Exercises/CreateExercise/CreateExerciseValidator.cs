using FluentValidation;

namespace Mjolksyra.UseCases.Exercises.CreateExercise;

public class CreateExerciseValidator : AbstractValidator<CreateExerciseCommand>
{
    public CreateExerciseValidator()
    {
        RuleFor(x => x.Name).NotEmpty();
    }
}
