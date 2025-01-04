using MediatR;
using Mjolksyra.Domain.Database;
using OneOf;
using OneOf.Types;

namespace Mjolksyra.UseCases.Exercises.StarExercise;

public class StarExerciseCommandHandler : IRequestHandler<StarExerciseCommand, OneOf<Success, Error>>
{
    private readonly IExerciseRepository _exerciseRepository;

    public StarExerciseCommandHandler(IExerciseRepository exerciseRepository)
    {
        _exerciseRepository = exerciseRepository;
    }

    public async Task<OneOf<Success, Error>> Handle(StarExerciseCommand request, CancellationToken cancellationToken)
    {
        var success = request.State
            ? await _exerciseRepository.Star(request.ExerciseId, Guid.Empty, cancellationToken)
            : await _exerciseRepository.Unstar(request.ExerciseId, Guid.Empty, cancellationToken);

        return success ? new Success() : new Error();
    }
}