using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.UseCases.Common.Models;

namespace Mjolksyra.UseCases.Exercises.StarredExercises;

public class StarredExercisesRequestHandler : IRequestHandler<StarredExercisesRequest, PaginatedResponse<ExerciseResponse>>
{
    private readonly IExerciseRepository _exerciseRepository;

    public StarredExercisesRequestHandler(IExerciseRepository exerciseRepository)
    {
        _exerciseRepository = exerciseRepository;
    }

    public async Task<PaginatedResponse<ExerciseResponse>> Handle(StarredExercisesRequest request, CancellationToken cancellationToken)
    {
        return await _exerciseRepository
            .Starred(Guid.Empty, cancellationToken)
            .ContinueWith(t => new PaginatedResponse<ExerciseResponse>
            {
                Next = t.Result.Cursor,
                Data = t.Result.Data.Select(ExerciseResponse.From).ToList()
            }, cancellationToken);
    }
}