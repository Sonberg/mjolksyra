using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.PlannedWorkouts;
using Mjolksyra.UseCases.PlannedWorkouts.UpdatePlannedWorkoutChatMessage;

namespace Mjolksyra.UseCases.Tests.PlannedWorkouts;

public class UpdatePlannedWorkoutChatMessageCommandHandlerTests
{
    [Fact]
    public async Task Handle_WhenMessageBelongsToUser_UpdatesMessage()
    {
        var traineeId = Guid.NewGuid();
        var workoutId = Guid.NewGuid();
        var chatMessageId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository
            .Setup(x => x.Get(workoutId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PlannedWorkout
            {
                Id = workoutId,
                TraineeId = traineeId,
                PlannedAt = new DateOnly(2026, 4, 2),
                CreatedAt = DateTimeOffset.UtcNow,
                PublishedExercises = [],
            });

        var chatRepository = new Mock<IPlannedWorkoutChatMessageRepository>();
        chatRepository
            .Setup(x => x.GetById(chatMessageId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PlannedWorkoutChatMessage
            {
                Id = chatMessageId,
                TraineeId = traineeId,
                PlannedWorkoutId = workoutId,
                UserId = userId,
                Message = "Old",
                Role = PlannedWorkoutChatRole.Athlete,
                CreatedAt = DateTimeOffset.UtcNow,
                ModifiedAt = DateTimeOffset.UtcNow,
            });
        chatRepository
            .Setup(x => x.UpdateMessage(chatMessageId, "New text", It.IsAny<DateTimeOffset>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PlannedWorkoutChatMessage
            {
                Id = chatMessageId,
                TraineeId = traineeId,
                PlannedWorkoutId = workoutId,
                UserId = userId,
                Message = "New text",
                Role = PlannedWorkoutChatRole.Athlete,
                CreatedAt = DateTimeOffset.UtcNow,
                ModifiedAt = DateTimeOffset.UtcNow,
            });

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.HasAccess(traineeId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(userId);

        var sut = new UpdatePlannedWorkoutChatMessageCommandHandler(
            plannedWorkoutRepository.Object,
            chatRepository.Object,
            traineeRepository.Object,
            userContext.Object);

        var result = await sut.Handle(new UpdatePlannedWorkoutChatMessageCommand
        {
            TraineeId = traineeId,
            PlannedWorkoutId = workoutId,
            ChatMessageId = chatMessageId,
            Message = new PlannedWorkoutChatMessageEditRequest { Message = "New text" },
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

        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository
            .Setup(x => x.Get(workoutId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PlannedWorkout
            {
                Id = workoutId,
                TraineeId = traineeId,
                PlannedAt = new DateOnly(2026, 4, 2),
                CreatedAt = DateTimeOffset.UtcNow,
                PublishedExercises = [],
            });

        var chatRepository = new Mock<IPlannedWorkoutChatMessageRepository>();
        chatRepository
            .Setup(x => x.GetById(chatMessageId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PlannedWorkoutChatMessage
            {
                Id = chatMessageId,
                TraineeId = traineeId,
                PlannedWorkoutId = workoutId,
                UserId = Guid.NewGuid(),
                Message = "Old",
                Role = PlannedWorkoutChatRole.Athlete,
                CreatedAt = DateTimeOffset.UtcNow,
                ModifiedAt = DateTimeOffset.UtcNow,
            });

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.HasAccess(traineeId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(userId);

        var sut = new UpdatePlannedWorkoutChatMessageCommandHandler(
            plannedWorkoutRepository.Object,
            chatRepository.Object,
            traineeRepository.Object,
            userContext.Object);

        var result = await sut.Handle(new UpdatePlannedWorkoutChatMessageCommand
        {
            TraineeId = traineeId,
            PlannedWorkoutId = workoutId,
            ChatMessageId = chatMessageId,
            Message = new PlannedWorkoutChatMessageEditRequest { Message = "New text" },
        }, CancellationToken.None);

        Assert.Null(result);
        chatRepository.Verify(
            x => x.UpdateMessage(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<DateTimeOffset>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }
}
