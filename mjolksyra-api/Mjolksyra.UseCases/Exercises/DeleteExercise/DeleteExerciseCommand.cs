using MediatR;

namespace Mjolksyra.UseCases.Exercises.DeleteExercise;

public class DeleteExerciseCommand : IRequest
{
    public required Guid ExerciseId { get; set; }
}