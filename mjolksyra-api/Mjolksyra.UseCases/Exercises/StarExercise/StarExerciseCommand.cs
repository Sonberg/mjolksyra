using MediatR;
using OneOf;
using OneOf.Types;

namespace Mjolksyra.UseCases.Exercises.StarExercise;

public class StarExerciseCommand : IRequest<OneOf<Success, Error>>
{
    public required Guid ExerciseId { get; set; }

    public required bool State { get; set; }
}