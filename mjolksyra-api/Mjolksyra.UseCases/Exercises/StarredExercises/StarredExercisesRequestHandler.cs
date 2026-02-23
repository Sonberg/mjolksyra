using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.Common.Models;

namespace Mjolksyra.UseCases.Exercises.StarredExercises;

public class StarredExercisesRequestHandler : IRequestHandler<StarredExercisesRequest, PaginatedResponse<ExerciseResponse>>
{
    private readonly IExerciseRepository _exerciseRepository;

    private readonly IUserContext _userContext;

    public StarredExercisesRequestHandler(IExerciseRepository exerciseRepository, IUserContext userContext)
    {
        _exerciseRepository = exerciseRepository;
        _userContext = userContext;
    }

    public async Task<PaginatedResponse<ExerciseResponse>> Handle(StarredExercisesRequest request, CancellationToken cancellationToken)
    {
        var userId = await _userContext.GetUserId(cancellationToken);
        return await _exerciseRepository
            .Starred(userId!.Value, cancellationToken)
            .ContinueWith(t => new PaginatedResponse<ExerciseResponse>
            {
                Next = t.Result.Cursor,
                Data = t.Result.Data.Select(x => ExerciseResponse.From(x, userId)).ToList()
            }, cancellationToken);
    }
}