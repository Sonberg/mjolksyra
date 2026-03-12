namespace Mjolksyra.Domain.Database.Models;

public class ExerciseOptions
{
    public required ICollection<string> Level { get; set; }

    public required ICollection<string> Sport { get; set; }
}
