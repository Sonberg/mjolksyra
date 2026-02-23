using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;
using OneOf;
using OneOf.Types;

namespace Mjolksyra.UseCases.Exercises.CreateExercise;

public class CreateExerciseCommandHandler : IRequestHandler<CreateExerciseCommand, OneOf<ExerciseResponse, Error>>
{
    private readonly IExerciseRepository _exerciseRepository;

    private readonly IUserContext _userContext;

    public CreateExerciseCommandHandler(IExerciseRepository exerciseRepository, IUserContext userContext)
    {
        _exerciseRepository = exerciseRepository;
        _userContext = userContext;
    }

    public async Task<OneOf<ExerciseResponse, Error>> Handle(CreateExerciseCommand request, CancellationToken cancellationToken)
    {
        if (await _userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return new Error();
        }

        var exercise = new Exercise
        {
            Name = request.Name,
            Force = request.Force,
            Level = request.Level,
            Mechanic = request.Mechanic,
            Equipment = request.Equipment,
            Category = request.Category,
            CreatedBy = userId,
            CreatedAt = DateTimeOffset.UtcNow
        };

        return ExerciseResponse.From(
            await _exerciseRepository.Create(exercise, cancellationToken),
            userId);
    }
}