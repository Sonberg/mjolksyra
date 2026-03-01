using FluentValidation;
using Mjolksyra.Domain.Database;

namespace Mjolksyra.UseCases.Exercises.CreateExercise;

public class CreateExerciseValidator : AbstractValidator<CreateExerciseCommand>
{
    public CreateExerciseValidator(IExerciseRepository exerciseRepository)
    {
        RuleFor(x => x.Name).NotEmpty();
        RuleFor(x => x).CustomAsync(async (cmd, ctx, ct) =>
        {
            var options = await exerciseRepository.Options(ct);

            if (cmd.Category != null && !options.Category.Contains(cmd.Category))
            {
                ctx.AddFailure(
                    nameof(CreateExerciseCommand.Category),
                    $"Category must be one of {string.Join(", ", options.Category)}");
            }

            if (cmd.Force != null && !options.Force.Contains(cmd.Force))
            {
                ctx.AddFailure(
                    nameof(CreateExerciseCommand.Force),
                    $"Force must be one of {string.Join(", ", options.Force)}");
            }

            if (cmd.Level != null && !options.Level.Contains(cmd.Level))
            {
                ctx.AddFailure(
                    nameof(CreateExerciseCommand.Level),
                    $"Level must be one of {string.Join(", ", options.Level)}");
            }

            if (cmd.Mechanic != null && !options.Mechanic.Contains(cmd.Mechanic))
            {
                ctx.AddFailure(
                    nameof(CreateExerciseCommand.Mechanic),
                    $"Mechanic must be one of {string.Join(", ", options.Mechanic)}");
            }
        });
    }
}
