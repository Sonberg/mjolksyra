using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.CompletedWorkouts;
using Mjolksyra.UseCases.CompletedWorkouts.UpdateCompletedWorkoutChatMessage;

namespace Mjolksyra.UseCases.Tests.CompletedWorkouts;

public class UpdateCompletedWorkoutChatMessageCommandHandlerTests
{
    [Fact]
    public async Task Handle_WhenMessageBelongsToUser_UpdatesMessage()
    {
        var traineeId = Guid.NewGuid();
        var workoutId = Guid.NewGuid();
        var chatMessageId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var plannedWorkoutRepository = new Mock<ICompletedWorkoutRepository>();
        plannedWorkoutRepository
            .Setup(x => x.GetById(workoutId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new CompletedWorkout
            {
                Id = workoutId,
                TraineeId = traineeId,
                PlannedAt = new DateOnly(2026, 4, 2),
                CreatedAt = DateTimeOffset.UtcNow,
                Exercises = [],
            });

        var chatRepository = new Mock<ICompletedWorkoutChatMessageRepository>();
        chatRepository
            .Setup(x => x.GetById(chatMessageId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new CompletedWorkoutChatMessage
            {
                Id = chatMessageId,
                TraineeId = traineeId,
                CompletedWorkoutId = workoutId,
                UserId = userId,
                Message = "Old",
                Role = CompletedWorkoutChatRole.Athlete,
                CreatedAt = DateTimeOffset.UtcNow,
                ModifiedAt = DateTimeOffset.UtcNow,
            });
        chatRepository
            .Setup(x => x.UpdateMessage(chatMessageId, "New text", It.IsAny<DateTimeOffset>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new CompletedWorkoutChatMessage
            {
                Id = chatMessageId,
                TraineeId = traineeId,
                CompletedWorkoutId = workoutId,
                UserId = userId,
                Message = "New text",
                Role = CompletedWorkoutChatRole.Athlete,
                CreatedAt = DateTimeOffset.UtcNow,
                ModifiedAt = DateTimeOffset.UtcNow,
            });

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.HasAccess(traineeId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(userId);

        var sut = new UpdateCompletedWorkoutChatMessageCommandHandler(
            plannedWorkoutRepository.Object,
            chatRepository.Object,
            traineeRepository.Object,
            userContext.Object);

        var result = await sut.Handle(new UpdateCompletedWorkoutChatMessageCommand
        {
            TraineeId = traineeId,
            CompletedWorkoutId = workoutId,
            ChatMessageId = chatMessageId,
            Message = new CompletedWorkoutChatMessageEditRequest { Message = "New text" },
        }, CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal("New text", result!.Message);
    }

    [Fact]
    public async Task Handle_WhenMessageBelongsToAnotherUser_ReturnsNull()
    {
        var traineeId = Guid.NewGuid();
        var workoutId = Guid.NewGuid();
        var chatMessageId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var plannedWorkoutRepository = new Mock<ICompletedWorkoutRepository>();
        plannedWorkoutRepository
            .Setup(x => x.GetById(workoutId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new CompletedWorkout
            {
                Id = workoutId,
                TraineeId = traineeId,
                PlannedAt = new DateOnly(2026, 4, 2),
                CreatedAt = DateTimeOffset.UtcNow,
                Exercises = [],
            });

        var chatRepository = new Mock<ICompletedWorkoutChatMessageRepository>();
        chatRepository
            .Setup(x => x.GetById(chatMessageId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new CompletedWorkoutChatMessage
            {
                Id = chatMessageId,
                TraineeId = traineeId,
                CompletedWorkoutId = workoutId,
                UserId = Guid.NewGuid(),
                Message = "Old",
                Role = CompletedWorkoutChatRole.Athlete,
                CreatedAt = DateTimeOffset.UtcNow,
                ModifiedAt = DateTimeOffset.UtcNow,
            });

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.HasAccess(traineeId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(userId);

        var sut = new UpdateCompletedWorkoutChatMessageCommandHandler(
            plannedWorkoutRepository.Object,
            chatRepository.Object,
            traineeRepository.Object,
            userContext.Object);

        var result = await sut.Handle(new UpdateCompletedWorkoutChatMessageCommand
        {
            TraineeId = traineeId,
            CompletedWorkoutId = workoutId,
            ChatMessageId = chatMessageId,
            Message = new CompletedWorkoutChatMessageEditRequest { Message = "New text" },
        }, CancellationToken.None);

        Assert.Null(result);
        chatRepository.Verify(
            x => x.UpdateMessage(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<DateTimeOffset>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }
}
