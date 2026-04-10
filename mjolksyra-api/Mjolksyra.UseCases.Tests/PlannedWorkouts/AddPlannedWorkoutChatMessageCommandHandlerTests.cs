using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.CompletedWorkouts;
using Mjolksyra.UseCases.CompletedWorkouts.AddCompletedWorkoutChatMessage;

namespace Mjolksyra.UseCases.Tests.CompletedWorkouts;

public class AddCompletedWorkoutChatMessageCommandHandlerTests
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

        var workoutRepository = new Mock<ICompletedWorkoutRepository>();
        workoutRepository
            .Setup(x => x.GetById(workoutId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new CompletedWorkout
            {
                Id = workoutId,
                TraineeId = traineeId,
                PlannedAt = new DateOnly(2026, 4, 1),
                CreatedAt = DateTimeOffset.UtcNow,
                Exercises = []
            });

        CompletedWorkoutChatMessage? saved = null;
        var chatRepository = new Mock<ICompletedWorkoutChatMessageRepository>();
        chatRepository
            .Setup(x => x.Create(It.IsAny<CompletedWorkoutChatMessage>(), It.IsAny<CancellationToken>()))
            .Callback<CompletedWorkoutChatMessage, CancellationToken>((m, _) => saved = m)
            .ReturnsAsync((CompletedWorkoutChatMessage m, CancellationToken _) => m);

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

        var result = await sut.Handle(new AddCompletedWorkoutChatMessageCommand
        {
            TraineeId = traineeId,
            CompletedWorkoutId = workoutId,
            Message = new CompletedWorkoutChatMessageRequest
            {
                Message = "Completed session",
                MediaUrls = ["https://utfs.io/f/photo.jpg", "https://utfs.io/f/clip.mp4?raw=1"]
            }
        }, CancellationToken.None);

        Assert.NotNull(result);
        Assert.NotNull(saved);
        Assert.Equal(CompletedWorkoutChatRole.Athlete, saved!.Role);
        Assert.Equal(2, saved.Media.Count);
        Assert.Equal(PlannedWorkoutMediaType.Image, saved.Media.First().Type);
        Assert.Equal(PlannedWorkoutMediaType.Video, saved.Media.Last().Type);
        compressionPublisher.Verify(
            x => x.Publish(It.IsAny<MediaCompressionRequestedMessage>(), It.IsAny<CancellationToken>()),
            Times.Exactly(2));
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

        var workoutRepository = new Mock<ICompletedWorkoutRepository>();
        workoutRepository
            .Setup(x => x.GetById(workoutId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new CompletedWorkout
            {
                Id = workoutId,
                TraineeId = traineeId,
                PlannedAt = new DateOnly(2026, 4, 1),
                CreatedAt = DateTimeOffset.UtcNow,
                Exercises = []
            });

        var chatRepository = new Mock<ICompletedWorkoutChatMessageRepository>();
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

        var result = await sut.Handle(new AddCompletedWorkoutChatMessageCommand
        {
            TraineeId = traineeId,
            CompletedWorkoutId = workoutId,
            Message = new CompletedWorkoutChatMessageRequest
            {
                Message = "   ",
                MediaUrls = []
            }
        }, CancellationToken.None);

        Assert.Null(result);
        chatRepository.Verify(x => x.Create(It.IsAny<CompletedWorkoutChatMessage>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenUserIsBothAthleteAndCoach_UsesRequestedRole()
    {
        var traineeId = Guid.NewGuid();
        var workoutId = Guid.NewGuid();
        var dualRoleUserId = Guid.NewGuid();
        var trainee = new Trainee
        {
            Id = traineeId,
            AthleteUserId = dualRoleUserId,
            CoachUserId = dualRoleUserId,
            Status = Domain.Database.Enum.TraineeStatus.Active,
        };

        var workoutRepository = new Mock<ICompletedWorkoutRepository>();
        workoutRepository
            .Setup(x => x.GetById(workoutId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new CompletedWorkout
            {
                Id = workoutId,
                TraineeId = traineeId,
                PlannedAt = new DateOnly(2026, 4, 1),
                CreatedAt = DateTimeOffset.UtcNow,
                Exercises = []
            });

        CompletedWorkoutChatMessage? saved = null;
        var chatRepository = new Mock<ICompletedWorkoutChatMessageRepository>();
        chatRepository
            .Setup(x => x.Create(It.IsAny<CompletedWorkoutChatMessage>(), It.IsAny<CancellationToken>()))
            .Callback<CompletedWorkoutChatMessage, CancellationToken>((m, _) => saved = m)
            .ReturnsAsync((CompletedWorkoutChatMessage m, CancellationToken _) => m);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.HasAccess(traineeId, dualRoleUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        traineeRepository
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(trainee);

        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync(dualRoleUserId);

        var sut = CreateSut(workoutRepository, chatRepository, traineeRepository, userContext);

        var result = await sut.Handle(new AddCompletedWorkoutChatMessageCommand
        {
            TraineeId = traineeId,
            CompletedWorkoutId = workoutId,
            Message = new CompletedWorkoutChatMessageRequest
            {
                Message = "Coach-context message",
                Role = CompletedWorkoutChatRole.Coach,
            }
        }, CancellationToken.None);

        Assert.NotNull(result);
        Assert.NotNull(saved);
        Assert.Equal(CompletedWorkoutChatRole.Coach, saved!.Role);
    }

    private static AddCompletedWorkoutChatMessageCommandHandler CreateSut(
        Mock<ICompletedWorkoutRepository>? workoutRepository = null,
        Mock<ICompletedWorkoutChatMessageRepository>? chatRepository = null,
        Mock<ITraineeRepository>? traineeRepository = null,
        Mock<IUserContext>? userContext = null,
        Mock<IMediaCompressionPublisher>? compressionPublisher = null)
    {
        return new AddCompletedWorkoutChatMessageCommandHandler(
            (workoutRepository ?? new Mock<ICompletedWorkoutRepository>()).Object,
            (chatRepository ?? new Mock<ICompletedWorkoutChatMessageRepository>()).Object,
            (traineeRepository ?? new Mock<ITraineeRepository>()).Object,
            (userContext ?? new Mock<IUserContext>()).Object,
            (compressionPublisher ?? new Mock<IMediaCompressionPublisher>()).Object);
    }

    private static AddCompletedWorkoutChatMessageCommand CreateCommand()
    {
        return new AddCompletedWorkoutChatMessageCommand
        {
            TraineeId = Guid.NewGuid(),
            CompletedWorkoutId = Guid.NewGuid(),
            Message = new CompletedWorkoutChatMessageRequest
            {
                Message = "Hello",
                MediaUrls = []
            }
        };
    }
}
