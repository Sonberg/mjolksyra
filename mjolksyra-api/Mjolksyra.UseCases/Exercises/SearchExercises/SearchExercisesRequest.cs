using MediatR;
using Mjolksyra.UseCases.Common.Models;

namespace Mjolksyra.UseCases.Exercises.SearchExercises;

public class SearchExercisesRequest : IRequest<PaginatedResponse<ExerciseResponse>>
{
    public string FreeText { get; set; } = string.Empty;

    public string? Force { get; set; }

    public string? Level { get; set; }

    public string? Mechanic { get; set; }

    public string? Category { get; set; }

    public bool CreatedByMe { get; set; }
}
