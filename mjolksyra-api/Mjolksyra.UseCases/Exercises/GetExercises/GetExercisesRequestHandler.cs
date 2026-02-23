using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.Common.Models;

namespace Mjolksyra.UseCases.Exercises.GetExercises;

public class GetExercisesRequestHandler : IRequestHandler<GetExercisesRequest, PaginatedResponse<ExerciseResponse>>
{
    private readonly IExerciseRepository _exerciseRepository;

    private readonly IUserContext _userContext;

    public GetExercisesRequestHandler(IExerciseRepository exerciseRepository, IUserContext userContext)
    {
        _exerciseRepository = exerciseRepository;
        _userContext = userContext;
    }

    public async Task<PaginatedResponse<ExerciseResponse>> Handle(GetExercisesRequest request, CancellationToken cancellationToken)
    {
        var userId = await _userContext.GetUserId(cancellationToken);
        var result = request.Cursor is { } cursor
            ? await _exerciseRepository.Get(cursor, cancellationToken)
            : await _exerciseRepository.Get(request.Limit, cancellationToken);

        return new PaginatedResponse<ExerciseResponse>
        {
            Next = result.Cursor,
            Data = result.Data.Select(x => ExerciseResponse.From(x, userId)).ToList()
        };
    }
}