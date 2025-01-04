using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.Exercises.SearchExercises;

public class SearchExercisesRequest : IRequest<ICollection<ExerciseResponse>>
{
    public required string FreeText { get; set; }
}

public class SearchExercisesRequestHandler : IRequestHandler<SearchExercisesRequest, ICollection<ExerciseResponse>>
{
    private readonly IExerciseRepository _exerciseRepository;

    public SearchExercisesRequestHandler(IExerciseRepository exerciseRepository)
    {
        _exerciseRepository = exerciseRepository;
    }

    public async Task<ICollection<ExerciseResponse>> Handle(SearchExercisesRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(request.FreeText))
        {
            return Array.Empty<ExerciseResponse>();
        }

        return await _exerciseRepository
            .SearchAsync(request.FreeText, cancellationToken)
            .ContinueWith(t => t.Result.Select(ExerciseResponse.From).ToList(), cancellationToken);
    }
}

public class ExerciseResponse
{
    public Guid Id { get; set; }

    public required string Name { get; set; }

    public string? Force { get; set; }

    public string? Level { get; set; }

    public string? Mechanic { get; set; }

    public string? Equipment { get; set; }

    public string? Category { get; set; }

    public bool Starred { get; set; }

    public static ExerciseResponse From(Exercise exercise)
    {
        return new ExerciseResponse
        {
            Id = exercise.Id,
            Name = exercise.Name,
            Category = exercise.Category,
            Equipment = exercise.Equipment,
            Force = exercise.Force,
            Level = exercise.Level,
            Mechanic = exercise.Mechanic
        };
    }
}