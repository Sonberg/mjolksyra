using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Tests.Database.Models;

public class PlannedWorkoutTests
{
    [Fact]
    public void IsEmpty_WhenNameNoteAndExercisesAreEmpty_ReturnsTrue()
    {
        // Arrange
        var workout = new PlannedWorkout
        {
            Name = null,
            Note = null,
            PublishedExercises = new List<PlannedExercise>()
        };

        // Act & Assert
        Assert.True(workout.IsEmpty);
    }

    [Fact]
    public void IsEmpty_WhenNameIsNotEmpty_ReturnsFalse()
    {
        // Arrange
        var workout = new PlannedWorkout
        {
            Name = "Morning Workout",
            Note = null,
            PublishedExercises = new List<PlannedExercise>()
        };

        // Act & Assert
        Assert.False(workout.IsEmpty);
    }

    [Fact]
    public void IsEmpty_WhenNoteIsNotEmpty_ReturnsFalse()
    {
        // Arrange
        var workout = new PlannedWorkout
        {
            Name = null,
            Note = "Some important notes.",
            PublishedExercises = new List<PlannedExercise>()
        };

        // Act & Assert
        Assert.False(workout.IsEmpty);
    }

    [Fact]
    public void IsEmpty_WhenExercisesAreNotEmpty_ReturnsFalse()
    {
        // Arrange
        var workout = new PlannedWorkout
        {
            Name = null,
            Note = null,
            PublishedExercises = new List<PlannedExercise> { new PlannedExercise { Name = "Squat" } }
        };

        // Act & Assert
        Assert.False(workout.IsEmpty);
    }

    [Fact]
    public void IsEmpty_WhenAllPropertiesHaveValues_ReturnsFalse()
    {
        // Arrange
        var workout = new PlannedWorkout
        {
            Name = "Full Workout",
            Note = "With notes.",
            PublishedExercises = new List<PlannedExercise> { new PlannedExercise { Name = "Squat" } }
        };

        // Act & Assert
        Assert.False(workout.IsEmpty);
    }
}
