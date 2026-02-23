using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.UserContext;
using OneOf;
using OneOf.Types;

namespace Mjolksyra.UseCases.Exercises.StarExercise;

public class StarExerciseCommandHandler : IRequestHandler<StarExerciseCommand, OneOf<Success, Error>>
{
    private readonly IExerciseRepository _exerciseRepository;

    private readonly IUserContext _userContext;

    public StarExerciseCommandHandler(IExerciseRepository exerciseRepository, IUserContext userContext)
    {
        _exerciseRepository = exerciseRepository;
        _userContext = userContext;
    }

    public async Task<OneOf<Success, Error>> Handle(StarExerciseCommand request, CancellationToken cancellationToken)
    {
        if (await _userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return new Error();
        }

        var success = request.State
            ? await _exerciseRepository.Star(request.ExerciseId, userId, cancellationToken)
            : await _exerciseRepository.Unstar(request.ExerciseId, userId, cancellationToken);

        return success ? new Success() : new Error();
    }
}