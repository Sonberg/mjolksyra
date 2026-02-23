using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.Blocks.CreateBlock;

public class CreateBlockCommandHandler : IRequestHandler<CreateBlockCommand, BlockResponse>
{
    private readonly IBlockRepository _blockRepository;
    private readonly IUserContext _userContext;

    public CreateBlockCommandHandler(IBlockRepository blockRepository, IUserContext userContext)
    {
        _blockRepository = blockRepository;
        _userContext = userContext;
    }

    public async Task<BlockResponse> Handle(CreateBlockCommand request, CancellationToken cancellationToken)
    {
        var userId = await _userContext.GetUserId(cancellationToken) ?? throw new UnauthorizedAccessException();
        var block = await _blockRepository.Create(new Block
        {
            Id = Guid.NewGuid(),
            CoachId = userId,
            Name = request.Block.Name,
            NumberOfWeeks = request.Block.NumberOfWeeks,
            Workouts = request.Block.Workouts.Select(w => new BlockWorkout
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
            }).ToList(),
            CreatedAt = DateTimeOffset.UtcNow
        }, cancellationToken);

        return BlockResponse.From(block);
    }
}