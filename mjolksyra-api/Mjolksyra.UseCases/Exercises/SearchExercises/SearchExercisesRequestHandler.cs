using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.UseCases.Common.Models;

namespace Mjolksyra.UseCases.Exercises.SearchExercises;

public class SearchExercisesRequestHandler : IRequestHandler<SearchExercisesRequest, PaginatedResponse<ExerciseResponse>>
{
    private readonly IExerciseRepository _exerciseRepository;

    public SearchExercisesRequestHandler(IExerciseRepository exerciseRepository)
    {
        _exerciseRepository = exerciseRepository;
    }

    public async Task<PaginatedResponse<ExerciseResponse>> Handle(SearchExercisesRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(request.FreeText))
        {
            return new PaginatedResponse<ExerciseResponse>
            {
                Next = null,
                Data = Array.Empty<ExerciseResponse>()
            };
        }

        return new PaginatedResponse<ExerciseResponse>
        {
            Next = null,
            Data = await _exerciseRepository
                .Search(request.FreeText, cancellationToken)
                .ContinueWith(t => t.Result.Select(ExerciseResponse.From).ToList(), cancellationToken)
        };
    }
}