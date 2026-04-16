using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Infrastructure.Database;
namespace Mjolksyra.Infrastructure.Tests.Database;

public class NotificationRepositoryTests
{
    [Fact]
    public void IsConnectedToCompletedWorkout_ReturnsTrue_WhenCompletedWorkoutIdMatches()
    {
        var completedWorkoutId = Guid.Parse("2e01bc76-3e07-4d0f-a26a-e4dd0a71fa19");
        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Type = "workout.completed",
            Title = "Workout completed",
            CompletedWorkoutId = completedWorkoutId,
            CreatedAt = DateTimeOffset.UtcNow,
        };

        var result = NotificationRepository.IsConnectedToCompletedWorkout(
            notification,
            completedWorkoutId);

        Assert.True(result);
    }

    [Fact]
    public void IsConnectedToCompletedWorkout_ReturnsTrue_WhenHrefContainsWorkoutId()
    {
        var completedWorkoutId = Guid.Parse("2e01bc76-3e07-4d0f-a26a-e4dd0a71fa19");
        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Type = "workout.chat.athlete",
            Title = "New workout message",
            Href = $"/app/coach/athletes/trainee-1/workouts?tab=changes&workoutId={completedWorkoutId}",
            CreatedAt = DateTimeOffset.UtcNow,
        };

        var result = NotificationRepository.IsConnectedToCompletedWorkout(
            notification,
            completedWorkoutId);

        Assert.True(result);
    }

    [Fact]
    public void IsConnectedToCompletedWorkout_ReturnsFalse_ForDifferentWorkout()
    {
        var completedWorkoutId = Guid.Parse("2e01bc76-3e07-4d0f-a26a-e4dd0a71fa19");
        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Type = "workout.chat.athlete",
            Title = "New workout message",
            Href = "/app/coach/athletes/trainee-1/workouts/9a5dbe36-b5ec-4a12-bb21-681cfde7f4c1",
            CreatedAt = DateTimeOffset.UtcNow,
        };

        var result = NotificationRepository.IsConnectedToCompletedWorkout(
            notification,
            completedWorkoutId);

        Assert.False(result);
    }
}
