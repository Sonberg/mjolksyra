using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.Common.Contracts;

public interface IExerciseResponse
{
    public ExerciseLevel? Level { get; set; }

    public ExerciseSport? Sport { get; set; }
}
