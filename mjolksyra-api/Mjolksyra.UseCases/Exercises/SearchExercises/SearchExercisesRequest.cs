using MediatR;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.UseCases.Common.Models;

namespace Mjolksyra.UseCases.Exercises.SearchExercises;

public class SearchExercisesRequest : IRequest<PaginatedResponse<ExerciseResponse>>
{
    public string FreeText { get; set; } = string.Empty;

    public ExerciseSport? Sport { get; set; }

    public ExerciseLevel? Level { get; set; }

    public bool CreatedByMe { get; set; }
}
