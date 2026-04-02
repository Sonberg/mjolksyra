using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.PlannedWorkouts;
using Mjolksyra.UseCases.PlannedWorkouts.AddPlannedWorkoutChatMessage;

namespace Mjolksyra.UseCases.Tests.PlannedWorkouts;

public class AddPlannedWorkoutChatMessageCommandHandlerTests
{
    [Fact]
    public async Task Handle_WhenUserNotAuthenticated_ReturnsNull()
    {
        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync((Guid?)null);

        var sut = CreateSut(userContext: userContext);

        var result = await sut.Handle(CreateCommand(), CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Handle_AsAthlete_PersistsMessageWithMappedMediaTypes()
    {
        var traineeId = Guid.NewGuid();
        var workoutId = Guid.NewGuid();
        var athleteUserId = Guid.NewGuid();
        var trainee = new Trainee
        {
            Id = traineeId,
            AthleteUserId = athleteUserId,
            CoachUserId = Guid.NewGuid(),
            Status = Domain.Database.Enum.TraineeStatus.Active,
        };

        var workoutRepository = new Mock<IPlannedWorkoutRepository>();
        workoutRepository
            .Setup(x => x.Get(workoutId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PlannedWorkout
            {
                Id = workoutId,
                TraineeId = traineeId,
                PlannedAt = new DateOnly(2026, 4, 1),
                CreatedAt = DateTimeOffset.UtcNow,
                Exercises = []
            });

        PlannedWorkoutChatMessage? saved = null;
        var chatRepository = new Mock<IPlannedWorkoutChatMessageRepository>();
        chatRepository
            .Setup(x => x.Create(It.IsAny<PlannedWorkoutChatMessage>(), It.IsAny<CancellationToken>()))
            .Callback<PlannedWorkoutChatMessage, CancellationToken>((m, _) => saved = m)
            .ReturnsAsync((PlannedWorkoutChatMessage m, CancellationToken _) => m);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.HasAccess(traineeId, athleteUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        traineeRepository
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(trainee);

        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync(athleteUserId);

        var compressionPublisher = new Mock<IMediaCompressionPublisher>();

        var sut = CreateSut(workoutRepository, chatRepository, traineeRepository, userContext, compressionPublisher);

        var result = await sut.Handle(new AddPlannedWorkoutChatMessageCommand
        {
            TraineeId = traineeId,
            PlannedWorkoutId = workoutId,
            Message = new PlannedWorkoutChatMessageRequest
            {
                Message = "Completed session",
                MediaUrls = ["https://utfs.io/f/photo.jpg", "https://utfs.io/f/clip.mp4?raw=1"]
            }
        }, CancellationToken.None);

        Assert.NotNull(result);
        Assert.NotNull(saved);
        Assert.Equal(PlannedWorkoutChatRole.Athlete, saved!.Role);
        Assert.Equal(2, saved.Media.Count);
        Assert.Equal(PlannedWorkoutMediaType.Image, saved.Media.First().Type);
        Assert.Equal(PlannedWorkoutMediaType.Video, saved.Media.Last().Type);
        compressionPublisher.Verify(
            x => x.Publish(It.IsAny<MediaCompressionRequestedMessage>(), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WhenMessageAndMediaEmpty_ReturnsNull()
    {
        var traineeId = Guid.NewGuid();
        var workoutId = Guid.NewGuid();
        var coachUserId = Guid.NewGuid();
        var trainee = new Trainee
        {
            Id = traineeId,
            AthleteUserId = Guid.NewGuid(),
            CoachUserId = coachUserId,
            Status = Domain.Database.Enum.TraineeStatus.Active,
        };

        var workoutRepository = new Mock<IPlannedWorkoutRepository>();
        workoutRepository
            .Setup(x => x.Get(workoutId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PlannedWorkout
            {
                Id = workoutId,
                TraineeId = traineeId,
                PlannedAt = new DateOnly(2026, 4, 1),
                CreatedAt = DateTimeOffset.UtcNow,
                Exercises = []
            });

        var chatRepository = new Mock<IPlannedWorkoutChatMessageRepository>();
        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.HasAccess(traineeId, coachUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        traineeRepository
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(trainee);

        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync(coachUserId);

        var sut = CreateSut(workoutRepository, chatRepository, traineeRepository, userContext);

        var result = await sut.Handle(new AddPlannedWorkoutChatMessageCommand
        {
            TraineeId = traineeId,
            PlannedWorkoutId = workoutId,
            Message = new PlannedWorkoutChatMessageRequest
            {
                Message = "   ",
                MediaUrls = []
            }
        }, CancellationToken.None);

        Assert.Null(result);
        chatRepository.Verify(x => x.Create(It.IsAny<PlannedWorkoutChatMessage>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    private static AddPlannedWorkoutChatMessageCommandHandler CreateSut(
        Mock<IPlannedWorkoutRepository>? workoutRepository = null,
        Mock<IPlannedWorkoutChatMessageRepository>? chatRepository = null,
        Mock<ITraineeRepository>? traineeRepository = null,
        Mock<IUserContext>? userContext = null,
        Mock<IMediaCompressionPublisher>? compressionPublisher = null)
    {
        return new AddPlannedWorkoutChatMessageCommandHandler(
            (workoutRepository ?? new Mock<IPlannedWorkoutRepository>()).Object,
            (chatRepository ?? new Mock<IPlannedWorkoutChatMessageRepository>()).Object,
            (traineeRepository ?? new Mock<ITraineeRepository>()).Object,
            (userContext ?? new Mock<IUserContext>()).Object,
            (compressionPublisher ?? new Mock<IMediaCompressionPublisher>()).Object);
    }

    private static AddPlannedWorkoutChatMessageCommand CreateCommand()
    {
        return new AddPlannedWorkoutChatMessageCommand
        {
            TraineeId = Guid.NewGuid(),
            PlannedWorkoutId = Guid.NewGuid(),
            Message = new PlannedWorkoutChatMessageRequest
            {
                Message = "Hello",
                MediaUrls = []
            }
        };
    }
}
