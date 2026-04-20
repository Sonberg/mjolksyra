using MediatR;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Constants;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Common;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.Adaptive.GenerateSurpriseBlock;

public class GenerateSurpriseBlockCommand : IRequest<GenerateSurpriseBlockResponse>
{
    public required Guid TraineeId { get; set; }

    public required Guid AthleteUserId { get; set; }
}

public class GenerateSurpriseBlockResponse
{
    public Guid BlockId { get; set; }

    public Guid TraineeId { get; set; }

    public DateOnly StartDate { get; set; }
}

public class GenerateSurpriseBlockCommandHandler(
    ISurpriseBlockAgent agent,
    IUserRepository userRepository,
    IEquipmentProfileRepository equipmentProfileRepository,
    IBlockCompletionContextRepository blockCompletionContextRepository,
    IBlockRepository blockRepository,
    IPlannedWorkoutRepository plannedWorkoutRepository
) : IRequestHandler<GenerateSurpriseBlockCommand, GenerateSurpriseBlockResponse>
{
    public async Task<GenerateSurpriseBlockResponse> Handle(GenerateSurpriseBlockCommand request, CancellationToken cancellationToken)
    {
        var athlete = await userRepository.GetById(request.AthleteUserId, cancellationToken);
        var equipment = await equipmentProfileRepository.GetByUserId(request.AthleteUserId, cancellationToken);
        var lastContext = await blockCompletionContextRepository.GetLatestByTraineeId(request.TraineeId, cancellationToken);

        var profile = athlete.AthleteProfile ?? new AthleteTrainingProfile();
        var equipmentItems = equipment?.Items.Where(x => x.Available).Select(x => x.Name).ToList() ?? [];

        var athleteContext = new AthleteContext
        {
            ExperienceLevel = profile.ExperienceLevel.ToString(),
            IntensityMethod = profile.IntensityMethod.ToString(),
            PreferredRepStyle = profile.PreferredRepStyle.ToString(),
            WorkoutsPerWeek = profile.WorkoutsPerWeek,
            Goals = profile.Goals,
        };

        var input = new SurpriseBlockInput
        {
            Athlete = athleteContext,
            Equipment = equipmentItems,
            PreviousBlockReflection = lastContext?.AthleteReflection,
            CompetitionDate = profile.CompetitionDate?.ToString("yyyy-MM-dd"),
        };

        var output = await agent.GenerateAsync(input, cancellationToken);

        var blockType = Enum.TryParse<BlockType>(output.BlockType, out var bt) ? bt : BlockType.BuildPower;

        var block = new Block
        {
            Id = Guid.NewGuid(),
            CoachId = AiCoachConstants.UserId,
            Name = output.Name,
            NumberOfWeeks = output.NumberOfWeeks,
            BlockType = blockType,
            Workouts = output.Workouts.Select(w => new BlockWorkout
            {
                Id = Guid.NewGuid(),
                Name = w.Name,
                Note = w.Note,
                Week = w.Week,
                DayOfWeek = w.DayOfWeek,
                Exercises = w.Exercises.Select(e => new BlockExercise
                {
                    Id = Guid.NewGuid(),
                    Name = e.Name,
                    Note = e.Note,
                    RepStyle = Enum.TryParse<RepStyle>(e.RepStyle, out var rs) ? rs : null,
                    Prescription = new ExercisePrescription
                    {
                        Type = ExerciseType.SetsReps,
                        Sets = e.Sets.Select(s => new ExercisePrescriptionSet
                        {
                            Target = new ExercisePrescriptionSetTarget
                            {
                                Reps = s.Reps,
                                WeightKg = s.WeightKg,
                                RpeTarget = s.RpeTarget,
                                RirTarget = s.RirTarget,
                                Note = s.Note,
                            }
                        }).ToList()
                    }
                }).ToList()
            }).ToList(),
            CreatedAt = DateTimeOffset.UtcNow,
        };

        await blockRepository.Create(block, cancellationToken);

        var startDate = GetNextMonday(DateOnly.FromDateTime(DateTime.UtcNow));
        var endDate = startDate.AddDays(block.NumberOfWeeks * 7 - 1);

        var existing = await plannedWorkoutRepository.Get(new PlannedWorkoutCursor
        {
            Page = 0,
            Size = 1000,
            TraineeId = request.TraineeId,
            FromDate = startDate,
            ToDate = endDate,
            SortBy = null,
            Order = SortOrder.Asc,
            DraftOnly = false
        }, cancellationToken);

        await Task.WhenAll(existing.Data.Select(w =>
            plannedWorkoutRepository.Delete(w.Id, cancellationToken)));

        var creates = block.Workouts.Select(bw =>
        {
            var daysOffset = (bw.Week - 1) * 7 + (bw.DayOfWeek - 1);
            var plannedAt = startDate.AddDays(daysOffset);

            return plannedWorkoutRepository.Create(new PlannedWorkout
            {
                Id = Guid.NewGuid(),
                TraineeId = request.TraineeId,
                Name = bw.Name,
                Note = bw.Note,
                PlannedAt = plannedAt,
                PublishedExercises = bw.Exercises.Select(e => new PlannedExercise
                {
                    Id = Guid.NewGuid(),
                    Name = e.Name,
                    Note = e.Note,
                    RepStyle = Enum.TryParse<RepStyle>(e.RepStyle, out var rs) ? rs : null,
                    Prescription = MapPrescription(e.Prescription),
                    IsPublished = true
                }).ToList(),
                CreatedAt = DateTimeOffset.UtcNow,
                AppliedBlock = new PlannedWorkoutAppliedBlock
                {
                    BlockId = block.Id,
                    BlockName = block.Name,
                    StartDate = startDate,
                    WeekNumber = bw.Week,
                    TotalWeeks = block.NumberOfWeeks
                }
            }, cancellationToken);
        });

        await Task.WhenAll(creates);

        return new GenerateSurpriseBlockResponse
        {
            BlockId = block.Id,
            TraineeId = request.TraineeId,
            StartDate = startDate,
        };
    }

    private static DateOnly GetNextMonday(DateOnly today)
    {
        var daysUntilMonday = ((int)DayOfWeek.Monday - (int)today.DayOfWeek + 7) % 7;
        return daysUntilMonday == 0 ? today : today.AddDays(daysUntilMonday);
    }

    private static ExercisePrescription? MapPrescription(ExercisePrescription? source)
    {
        if (source is null) return null;

        return new ExercisePrescription
        {
            Type = source.Type,
            Sets = source.Sets?.Select(set => new ExercisePrescriptionSet
            {
                Target = set.Target is null ? null : new ExercisePrescriptionSetTarget
                {
                    Reps = set.Target.Reps,
                    WeightKg = set.Target.WeightKg,
                    RpeTarget = set.Target.RpeTarget,
                    RirTarget = set.Target.RirTarget,
                    Note = set.Target.Note,
                }
            }).ToList()
        };
    }
}
