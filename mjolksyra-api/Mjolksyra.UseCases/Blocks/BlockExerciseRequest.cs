namespace Mjolksyra.UseCases.Blocks;

public class BlockExerciseRequest
{
    public Guid Id { get; set; }

    public Guid? ExerciseId { get; set; }

    public required string Name { get; set; }

    public string? Note { get; set; }
}
