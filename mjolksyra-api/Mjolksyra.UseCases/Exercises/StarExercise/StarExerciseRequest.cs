namespace Mjolksyra.UseCases.Exercises.StarExercise;

public class StarExerciseRequest
{
    public required bool State { get; set; }

    public StarExerciseCommand ToCommand(Guid exerciseId)
    {
        return new StarExerciseCommand
        {
            ExerciseId = exerciseId,
            State = State
        };
    }
}