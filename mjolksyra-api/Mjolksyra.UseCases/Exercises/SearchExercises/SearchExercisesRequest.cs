using MediatR;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.UseCases.Common.Models;

namespace Mjolksyra.UseCases.Exercises.SearchExercises;

public class SearchExercisesRequest : IRequest<PaginatedResponse<ExerciseResponse>>
{
    public string FreeText { get; set; } = string.Empty;

    public ICollection<ExerciseSport> Sports { get; set; } = [];

    public ICollection<ExerciseLevel> Levels { get; set; } = [];

    public bool CreatedByMe { get; set; }
}
