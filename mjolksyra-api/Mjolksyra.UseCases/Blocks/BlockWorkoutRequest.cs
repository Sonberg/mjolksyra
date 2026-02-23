namespace Mjolksyra.UseCases.Blocks;

public class BlockWorkoutRequest
{
    public Guid Id { get; set; }

    public string? Name { get; set; }

    public string? Note { get; set; }

    public required ICollection<BlockExerciseRequest> Exercises { get; set; }

    public int Week { get; set; }

    public int DayOfWeek { get; set; }
}
