using MediatR;
using Mjolksyra.Domain.Database.Models;
using OneOf;
using OneOf.Types;

namespace Mjolksyra.UseCases.Exercises.CreateExercise;

public class CreateExerciseCommand : IRequest<OneOf<ExerciseResponse, Error>>
{
    public required string Name { get; set; }

    public ExerciseLevel? Level { get; set; }

    public ExerciseSport? Sport { get; set; }

    public ExerciseType Type { get; set; }
}
