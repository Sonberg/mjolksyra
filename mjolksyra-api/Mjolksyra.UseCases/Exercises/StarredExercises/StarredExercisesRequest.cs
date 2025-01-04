using MediatR;
using Mjolksyra.UseCases.Common.Models;

namespace Mjolksyra.UseCases.Exercises.StarredExercises;

public class StarredExercisesRequest : IRequest<PaginatedResponse<ExerciseResponse>>;