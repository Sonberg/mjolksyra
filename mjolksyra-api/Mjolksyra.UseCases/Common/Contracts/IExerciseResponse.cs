namespace Mjolksyra.UseCases.Common.Contracts;

public interface IExerciseResponse
{
    public string? Force { get; set; }

    public string? Level { get; set; }

    public string? Mechanic { get; set; }

    public string? Equipment { get; set; }

    public string? Category { get; set; }

    public ICollection<string> Instructions { get; set; }

    public ICollection<string> PrimaryMuscles { get; set; }

    public ICollection<string> SecondaryMuscles { get; set; }
}