namespace Mjolksyra.UseCases.Blocks;

public class BlockRequest
{
    public required string Name { get; set; }

    public int NumberOfWeeks { get; set; }

    public required ICollection<BlockWorkoutRequest> Workouts { get; set; }
}
