using MediatR;
using OneOf;
using OneOf.Types;

namespace Mjolksyra.UseCases.Exercises.CreateExercise;

public class CreateExerciseCommand : IRequest<OneOf<ExerciseResponse, Error>>
{
    public required string Name { get; set; }

    public string? Force { get; set; }

    public string? Level { get; set; }

    public string? Mechanic { get; set; }

    public string? Category { get; set; }
}
