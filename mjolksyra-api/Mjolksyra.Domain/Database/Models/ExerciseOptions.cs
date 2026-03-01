namespace Mjolksyra.Domain.Database.Models;

public class ExerciseOptions
{
    public required ICollection<string> Force { get; set; }

    public required ICollection<string> Level { get; set; }

    public required ICollection<string> Mechanic { get; set; }

    public required ICollection<string> Category { get; set; }
}
