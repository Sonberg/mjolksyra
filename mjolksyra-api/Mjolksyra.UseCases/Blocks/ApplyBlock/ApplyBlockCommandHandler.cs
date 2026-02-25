using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Common;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.Blocks.ApplyBlock;

public class ApplyBlockCommandHandler : IRequestHandler<ApplyBlockCommand>
{
    private readonly IBlockRepository _blockRepository;
    private readonly IPlannedWorkoutRepository _plannedWorkoutRepository;
    private readonly ITraineeRepository _traineeRepository;
    private readonly IUserContext _userContext;

    public ApplyBlockCommandHandler(
        IBlockRepository blockRepository,
        IPlannedWorkoutRepository plannedWorkoutRepository,
        ITraineeRepository traineeRepository,
        IUserContext userContext)
    {
        _blockRepository = blockRepository;
        _plannedWorkoutRepository = plannedWorkoutRepository;
        _traineeRepository = traineeRepository;
        _userContext = userContext;
    }

    public async Task Handle(ApplyBlockCommand request, CancellationToken cancellationToken)
    {
        if (await _userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return;
        }

        var block = await _blockRepository.Get(request.BlockId, cancellationToken);

        if (block is null || block.CoachId != userId)
        {
            return;
        }

        if (!await _traineeRepository.HasAccess(request.TraineeId, userId, cancellationToken))
        {
            return;
        }

        var endDate = request.StartDate.AddDays(block.NumberOfWeeks * 7 - 1);

        // Fetch all existing planned workouts in the date range
        var existing = await _plannedWorkoutRepository.Get(new PlannedWorkoutCursor
        {
            Page = 0,
            Size = 1000,
            TraineeId = request.TraineeId,
            FromDate = request.StartDate,
            ToDate = endDate,
            SortBy = null,
            Order = SortOrder.Asc
        }, cancellationToken);

        // Delete all existing workouts in the range
        await Task.WhenAll(existing.Data.Select(w =>
            _plannedWorkoutRepository.Delete(w.Id, cancellationToken)));

        // Create new planned workouts from block workouts
        var creates = block.Workouts.Select(blockWorkout =>
        {
            var daysOffset = (blockWorkout.Week - 1) * 7 + (blockWorkout.DayOfWeek - 1);
            var plannedAt = request.StartDate.AddDays(daysOffset);

            return _plannedWorkoutRepository.Create(new PlannedWorkout
            {
                Id = Guid.NewGuid(),
                TraineeId = request.TraineeId,
                Name = blockWorkout.Name,
                Note = blockWorkout.Note,
                PlannedAt = plannedAt,
                Exercises = blockWorkout.Exercises.Select(e => new PlannedExercise
                {
                    Id = Guid.NewGuid(),
                    ExerciseId = e.ExerciseId,
                    Name = e.Name,
                    Note = e.Note
                }).ToList(),
                CreatedAt = DateTimeOffset.UtcNow,
                AppliedBlock = new PlannedWorkoutAppliedBlock
                {
                    BlockId = block.Id,
                    BlockName = block.Name,
                    StartDate = request.StartDate,
                    WeekNumber = blockWorkout.Week,
                    TotalWeeks = block.NumberOfWeeks
                }
            }, cancellationToken);
        });

        await Task.WhenAll(creates);
    }
}
