using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.Blocks.UpdateBlock;

public class UpdateBlockCommandHandler : IRequestHandler<UpdateBlockCommand, BlockResponse?>
{
    private readonly IBlockRepository _blockRepository;
    private readonly IUserContext _userContext;

    public UpdateBlockCommandHandler(IBlockRepository blockRepository, IUserContext userContext)
    {
        _blockRepository = blockRepository;
        _userContext = userContext;
    }

    public async Task<BlockResponse?> Handle(UpdateBlockCommand request, CancellationToken cancellationToken)
    {
        if (_userContext.UserId is not { } userId)
        {
            return null;
        }

        var existing = await _blockRepository.Get(request.BlockId, cancellationToken);

        if (existing is null || existing.CoachId != userId)
        {
            return null;
        }

        existing.Name = request.Block.Name;
        existing.NumberOfWeeks = request.Block.NumberOfWeeks;
        existing.Workouts = request.Block.Workouts.Select(w => new BlockWorkout
        {
            Id = w.Id == Guid.Empty ? Guid.NewGuid() : w.Id,
            Name = w.Name,
            Note = w.Note,
            Week = w.Week,
            DayOfWeek = w.DayOfWeek,
            Exercises = w.Exercises.Select(e => new BlockExercise
            {
                Id = e.Id == Guid.Empty ? Guid.NewGuid() : e.Id,
                ExerciseId = e.ExerciseId,
                Name = e.Name,
                Note = e.Note
            }).ToList()
        }).ToList();

        await _blockRepository.Update(existing, cancellationToken);

        return BlockResponse.From(existing);
    }
}
