using Mjolksyra.Domain.Database.Models;
using Mjolksyra.UseCases.PlannedWorkouts;

namespace Mjolksyra.UseCases.CompletedWorkouts;

public class WorkoutResponse
{
    // CompletedWorkout.Id when session exists, PlannedWorkout.Id as fallback
    public required Guid Id { get; set; }

    public required Guid PlannedWorkoutId { get; set; }

    public required Guid TraineeId { get; set; }

    public required string? Name { get; set; }

    public required string? Note { get; set; }

    public required DateOnly PlannedAt { get; set; }

    // What the coach prescribed (from PlannedWorkout.PublishedExercises)
    public required ICollection<PlannedExerciseResponse> PrescribedExercises { get; set; }

    // What the athlete is actually doing (from CompletedWorkout.Exercises, empty if no session)
    public required ICollection<CompletedExerciseResponse> Exercises { get; set; }

    public required DateTimeOffset CreatedAt { get; set; }

    public PlannedWorkoutAppliedBlockResponse? AppliedBlock { get; set; }

    // Session metadata — null means no session started yet
    public WorkoutSessionResponse? Session { get; set; }

    public static WorkoutResponse From(
        PlannedWorkout plannedWorkout,
        CompletedWorkout? session,
        ICollection<Exercise> planExercises,
        ICollection<Exercise> sessionExercises)
    {
        return new WorkoutResponse
        {
            Id = session?.Id ?? plannedWorkout.Id,
            PlannedWorkoutId = plannedWorkout.Id,
            TraineeId = plannedWorkout.TraineeId,
            Name = plannedWorkout.Name,
            Note = plannedWorkout.Note,
            PlannedAt = plannedWorkout.PlannedAt,
            PrescribedExercises = plannedWorkout.PublishedExercises
                .Select(x => PlannedExerciseResponse.From(x, planExercises))
                .ToList(),
            Exercises = session?.Exercises
                .Select(e => CompletedExerciseResponse.From(e, sessionExercises))
                .ToList() ?? [],
            CreatedAt = plannedWorkout.CreatedAt,
            AppliedBlock = plannedWorkout.AppliedBlock is null
                ? null
                : new PlannedWorkoutAppliedBlockResponse
                {
                    BlockId = plannedWorkout.AppliedBlock.BlockId,
                    BlockName = plannedWorkout.AppliedBlock.BlockName,
                    StartDate = plannedWorkout.AppliedBlock.StartDate,
                    WeekNumber = plannedWorkout.AppliedBlock.WeekNumber,
                    TotalWeeks = plannedWorkout.AppliedBlock.TotalWeeks
                },
            Session = session is null ? null : new WorkoutSessionResponse
            {
                Id = session.Id,
                CompletedAt = session.CompletedAt,
                ReviewedAt = session.ReviewedAt,
                Media = session.Media
                    .Select(m => new CompletedWorkoutMediaResponse
                    {
                        RawUrl = m.RawUrl,
                        CompressedUrl = m.CompressedUrl,
                        Type = m.Type,
                    })
                    .ToList(),
                CreatedAt = session.CreatedAt,
            }
        };
    }
}

public class WorkoutSessionResponse
{
    public required Guid Id { get; set; }

    public DateTimeOffset? CompletedAt { get; set; }

    public DateTimeOffset? ReviewedAt { get; set; }

    public ICollection<CompletedWorkoutMediaResponse> Media { get; set; } = [];

    public required DateTimeOffset CreatedAt { get; set; }
}
