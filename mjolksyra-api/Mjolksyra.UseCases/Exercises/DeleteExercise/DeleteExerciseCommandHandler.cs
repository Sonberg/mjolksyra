using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.Exercises.DeleteExercise;

public class DeleteExerciseCommandHandler : IRequestHandler<DeleteExerciseCommand>
{
    private readonly IExerciseRepository _exerciseRepository;

    private readonly IUserContext _userContext;

    public DeleteExerciseCommandHandler(IExerciseRepository exerciseRepository, IUserContext userContext)
    {
        _exerciseRepository = exerciseRepository;
        _userContext = userContext;
    }

    public async Task Handle(DeleteExerciseCommand request, CancellationToken cancellationToken)
    {
        if (_userContext.UserId is not { } userId)
        {
            return;
        }

        var exercise = await _exerciseRepository.Get(request.ExerciseId, cancellationToken);
        if (exercise.CreatedBy != userId)
        {
            return;
        }

        await _exerciseRepository.Delete(request.ExerciseId, cancellationToken);
    }
}