using MediatR;
using Mjolksyra.Domain.Database.Common;
using Mjolksyra.UseCases.Common.Models;

namespace Mjolksyra.UseCases.Exercises.GetExercises;

public class GetExercisesRequest : IRequest<PaginatedResponse<ExerciseResponse>>
{
    public required Cursor? Cursor { get; set; }

    public required int Limit { get; set; }
}