using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.UseCases.Common.Models;

namespace Mjolksyra.UseCases.Exercises.GetExercises;

public class GetExercisesRequestHandler : IRequestHandler<GetExercisesRequest, PaginatedResponse<ExerciseResponse>>
{
    private readonly IExerciseRepository _exerciseRepository;

    public GetExercisesRequestHandler(IExerciseRepository exerciseRepository)
    {
        _exerciseRepository = exerciseRepository;
    }

    public async Task<PaginatedResponse<ExerciseResponse>> Handle(GetExercisesRequest request, CancellationToken cancellationToken)
    {
        var result = request.Cursor is { } cursor
            ? await _exerciseRepository.Get(cursor, cancellationToken)
            : await _exerciseRepository.Get(request.Limit, cancellationToken);

        return new PaginatedResponse<ExerciseResponse>
        {
            Next = result.Cursor,
            Data = result.Data.Select(ExerciseResponse.From).ToList()
        };
    }
}