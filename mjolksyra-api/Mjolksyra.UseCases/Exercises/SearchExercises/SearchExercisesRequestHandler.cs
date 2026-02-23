using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.Common.Models;

namespace Mjolksyra.UseCases.Exercises.SearchExercises;

public class SearchExercisesRequestHandler : IRequestHandler<SearchExercisesRequest, PaginatedResponse<ExerciseResponse>>
{
    private readonly IExerciseRepository _exerciseRepository;

    private readonly IUserContext _userContext;

    public SearchExercisesRequestHandler(IExerciseRepository exerciseRepository, IUserContext userContext)
    {
        _exerciseRepository = exerciseRepository;
        _userContext = userContext;
    }

    public async Task<PaginatedResponse<ExerciseResponse>> Handle(SearchExercisesRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(request.FreeText))
        {
            return new PaginatedResponse<ExerciseResponse>
            {
                Next = null,
                Data = []
            };
        }

        var userId = await _userContext.GetUserId(cancellationToken);

        return new PaginatedResponse<ExerciseResponse>
        {
            Next = null,
            Data = await _exerciseRepository
                .Search(request.FreeText, cancellationToken)
                .ContinueWith(t => t.Result.Select(x => ExerciseResponse.From(x, userId)).ToList(), cancellationToken)
        };
    }
}