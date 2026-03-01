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
        var userId = await _userContext.GetUserId(cancellationToken);
        var hasText = !string.IsNullOrWhiteSpace(request.FreeText);
        var hasFilters = request.Force != null
                         || request.Level != null
                         || request.Mechanic != null
                         || request.Category != null
                         || request.CreatedByMe;

        if (!hasText && !hasFilters)
        {
            return new PaginatedResponse<ExerciseResponse>
            {
                Next = null,
                Data = []
            };
        }

        return new PaginatedResponse<ExerciseResponse>
        {
            Next = null,
            Data = await _exerciseRepository
                .Search(
                    request.FreeText,
                    request.Force,
                    request.Level,
                    request.Mechanic,
                    request.Category,
                    request.CreatedByMe ? userId : null,
                    cancellationToken)
                .ContinueWith(t => t.Result.Select(x => ExerciseResponse.From(x, userId)).ToList(), cancellationToken)
        };
    }
}
