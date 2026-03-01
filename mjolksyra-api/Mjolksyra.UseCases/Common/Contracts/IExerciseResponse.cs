namespace Mjolksyra.UseCases.Common.Contracts;

public interface IExerciseResponse
{
    public string? Force { get; set; }

    public string? Level { get; set; }

    public string? Mechanic { get; set; }

    public string? Category { get; set; }

    public ICollection<string> Instructions { get; set; }
}
