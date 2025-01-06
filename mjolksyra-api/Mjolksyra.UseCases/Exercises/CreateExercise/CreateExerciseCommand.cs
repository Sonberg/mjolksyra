using MediatR;

namespace Mjolksyra.UseCases.Exercises.CreateExercise;

public class CreateExerciseCommand : IRequest<ExerciseResponse>
{
    public required string Name { get; set; }

    public string? Force { get; set; }

    public string? Level { get; set; }

    public string? Mechanic { get; set; }

    public string? Equipment { get; set; }

    public string? Category { get; set; }
}