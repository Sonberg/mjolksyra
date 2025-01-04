using MediatR;
using Mjolksyra.UseCases.Common.Models;

namespace Mjolksyra.UseCases.Exercises.SearchExercises;

public class SearchExercisesRequest : IRequest<PaginatedResponse<ExerciseResponse>>
{
    public required string FreeText { get; set; }
}