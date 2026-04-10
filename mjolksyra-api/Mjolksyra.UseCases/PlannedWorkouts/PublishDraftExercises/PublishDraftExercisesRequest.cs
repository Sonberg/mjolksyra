namespace Mjolksyra.UseCases.PlannedWorkouts.PublishDraftExercises;

public class PublishDraftExercisesRequest
{
    public ICollection<PlannedExerciseRequest>? Exercises { get; set; }
}
