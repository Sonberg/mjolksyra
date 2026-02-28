using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.Exercises.DeleteExercise;
using Mjolksyra.UseCases.Exercises.SearchExercises;

namespace Mjolksyra.UseCases.Tests.Exercises;

public class ExerciseHandlersTests
{
    [Fact]
    public async Task DeleteExercise_WhenNotOwner_DoesNotDelete()
    {
        var userId = Guid.NewGuid();
        var exercise = new Exercise
        {
            Id = Guid.NewGuid(),
            Name = "Exercise",
            CreatedBy = Guid.NewGuid(),
            CreatedAt = DateTimeOffset.UtcNow
        };

        var exerciseRepository = new Mock<IExerciseRepository>();
        exerciseRepository.Setup(x => x.Get(exercise.Id, It.IsAny<CancellationToken>())).ReturnsAsync(exercise);

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(userId);

        var sut = new DeleteExerciseCommandHandler(exerciseRepository.Object, userContext.Object);
        await sut.Handle(new DeleteExerciseCommand { ExerciseId = exercise.Id }, CancellationToken.None);

        exerciseRepository.Verify(x => x.Delete(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task SearchExercises_WhenFreeTextEmpty_ReturnsEmptyWithoutQueryingRepository()
    {
        var exerciseRepository = new Mock<IExerciseRepository>();
        var userContext = new Mock<IUserContext>();
        var sut = new SearchExercisesRequestHandler(exerciseRepository.Object, userContext.Object);

        var result = await sut.Handle(new SearchExercisesRequest
        {
            FreeText = ""
        }, CancellationToken.None);

        Assert.Empty(result.Data);
        exerciseRepository.Verify(x => x.Search(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}

