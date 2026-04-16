using MediatR;
using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.Coaches.ReserveCredits;
using Mjolksyra.UseCases.Trainees.RebuildTraineeInsights;
using OneOf;

namespace Mjolksyra.UseCases.Tests.Trainees;

public class RebuildTraineeInsightsCommandHandlerTests
{
    private static RebuildTraineeInsightsCommandHandler CreateSut(
        Mock<IMediator>? mediator = null,
        Mock<ITraineeRepository>? traineeRepository = null,
        Mock<ICompletedWorkoutRepository>? completedWorkoutRepository = null,
        Mock<ITraineeInsightsRepository>? traineeInsightsRepository = null,
        Mock<ITraineeInsightsRebuildPublisher>? publisher = null,
        Mock<IUserContext>? userContext = null)
    {
        if (mediator is null)
        {
            mediator = new Mock<IMediator>();
            mediator
                .Setup(x => x.Send(It.IsAny<ReserveCreditsCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(OneOf<ReserveCreditsSuccess, ReserveCreditsError>.FromT0(new ReserveCreditsSuccess(1, 0, 1)));
        }

        return new RebuildTraineeInsightsCommandHandler(
            mediator.Object,
            (traineeRepository ?? new Mock<ITraineeRepository>()).Object,
            (completedWorkoutRepository ?? new Mock<ICompletedWorkoutRepository>()).Object,
            (traineeInsightsRepository ?? new Mock<ITraineeInsightsRepository>()).Object,
            (publisher ?? new Mock<ITraineeInsightsRebuildPublisher>()).Object,
            (userContext ?? new Mock<IUserContext>()).Object);
    }

    [Fact]
    public async Task Handle_WhenUserNotAuthenticated_ReturnsForbidden()
    {
        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync((Guid?)null);

        var sut = CreateSut(userContext: userContext);

        var result = await sut.Handle(new RebuildTraineeInsightsCommand(Guid.NewGuid()), CancellationToken.None);

        Assert.True(result.IsT1); // RebuildTraineeInsightsForbidden
    }

    [Fact]
    public async Task Handle_WhenTraineeNotOwnedByCoach_ReturnsForbidden()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Trainee
            {
                Id = traineeId,
                CoachUserId = Guid.NewGuid(), // different coach
                AthleteUserId = Guid.NewGuid(),
                Status = TraineeStatus.Active,
            });

        var sut = CreateSut(traineeRepository: traineeRepository, userContext: userContext);

        var result = await sut.Handle(new RebuildTraineeInsightsCommand(traineeId), CancellationToken.None);

        Assert.True(result.IsT1); // RebuildTraineeInsightsForbidden
    }

    [Fact]
    public async Task Handle_WhenInsightsAlreadyPending_ReturnsAlreadyPending()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Trainee
            {
                Id = traineeId,
                CoachUserId = userId,
                AthleteUserId = Guid.NewGuid(),
                Status = TraineeStatus.Active,
            });

        var traineeInsightsRepository = new Mock<ITraineeInsightsRepository>();
        traineeInsightsRepository
            .Setup(x => x.GetByTraineeId(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new TraineeInsights
            {
                Id = traineeId,
                Status = InsightsStatus.Pending,
                CreatedAt = DateTimeOffset.UtcNow,
            });

        var sut = CreateSut(
            traineeRepository: traineeRepository,
            traineeInsightsRepository: traineeInsightsRepository,
            userContext: userContext);

        var result = await sut.Handle(new RebuildTraineeInsightsCommand(traineeId), CancellationToken.None);

        Assert.True(result.IsT2); // RebuildTraineeInsightsAlreadyPending
    }

    [Fact]
    public async Task Handle_WhenPendingIsExpired_AllowsNewRebuild()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var statuses = new List<string>();

        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Trainee
            {
                Id = traineeId,
                CoachUserId = userId,
                AthleteUserId = Guid.NewGuid(),
                Status = TraineeStatus.Active,
            });

        var completedWorkoutRepository = new Mock<ICompletedWorkoutRepository>();
        completedWorkoutRepository
            .Setup(x => x.CountCompletedByTraineeId(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(5L);

        var traineeInsightsRepository = new Mock<ITraineeInsightsRepository>();
        traineeInsightsRepository
            .Setup(x => x.GetByTraineeId(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new TraineeInsights
            {
                Id = traineeId,
                Status = InsightsStatus.Pending,
                RebuildRequestedAt = DateTimeOffset.UtcNow - TimeSpan.FromMinutes(30),
                AthleteProfile = new InsightsAthleteProfile
                {
                    Summary = "Previous result",
                    TrainingAge = InsightsTrainingAge.Intermediate,
                },
                CreatedAt = DateTimeOffset.UtcNow,
                Strengths = [],
                Weaknesses = [],
                Recommendations = [],
            });
        traineeInsightsRepository
            .Setup(x => x.Upsert(It.IsAny<TraineeInsights>(), It.IsAny<CancellationToken>()))
            .Callback<TraineeInsights, CancellationToken>((doc, _) =>
            {
                statuses.Add(doc.Status);
            })
            .Returns(Task.CompletedTask);

        var mediator = new Mock<IMediator>();
        mediator
            .Setup(x => x.Send(It.IsAny<ReserveCreditsCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(OneOf<ReserveCreditsSuccess, ReserveCreditsError>.FromT0(new ReserveCreditsSuccess(1, 0, 1)));

        var publisher = new Mock<ITraineeInsightsRebuildPublisher>();

        var sut = CreateSut(
            mediator: mediator,
            traineeRepository: traineeRepository,
            completedWorkoutRepository: completedWorkoutRepository,
            traineeInsightsRepository: traineeInsightsRepository,
            publisher: publisher,
            userContext: userContext);

        var result = await sut.Handle(new RebuildTraineeInsightsCommand(traineeId), CancellationToken.None);

        Assert.True(result.IsT0);
        Assert.Contains(InsightsStatus.Ready, statuses);
        Assert.Contains(InsightsStatus.Pending, statuses);
        publisher.Verify(
            x => x.Publish(
                It.Is<TraineeInsightsRebuildRequestedMessage>(m => m.TraineeId == traineeId),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WhenFewerThanThreeCompletedWorkouts_ReturnsInsufficientData()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Trainee
            {
                Id = traineeId,
                CoachUserId = userId,
                AthleteUserId = Guid.NewGuid(),
                Status = TraineeStatus.Active,
            });

        var completedWorkoutRepository = new Mock<ICompletedWorkoutRepository>();
        completedWorkoutRepository
            .Setup(x => x.CountCompletedByTraineeId(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(2L);

        var sut = CreateSut(
            traineeRepository: traineeRepository,
            completedWorkoutRepository: completedWorkoutRepository,
            userContext: userContext);

        var result = await sut.Handle(new RebuildTraineeInsightsCommand(traineeId), CancellationToken.None);

        Assert.True(result.IsT3); // RebuildTraineeInsightsInsufficientData
    }

    [Fact]
    public async Task Handle_WhenInsufficientCredits_ReturnsInsufficientCredits()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Trainee
            {
                Id = traineeId,
                CoachUserId = userId,
                AthleteUserId = Guid.NewGuid(),
                Status = TraineeStatus.Active,
            });

        var completedWorkoutRepository = new Mock<ICompletedWorkoutRepository>();
        completedWorkoutRepository
            .Setup(x => x.CountCompletedByTraineeId(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(5L);

        var mediator = new Mock<IMediator>();
        mediator
            .Setup(x => x.Send(It.IsAny<ReserveCreditsCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(OneOf<ReserveCreditsSuccess, ReserveCreditsError>.FromT1(new ReserveCreditsError("Insufficient credits.")));

        var sut = CreateSut(
            mediator: mediator,
            traineeRepository: traineeRepository,
            completedWorkoutRepository: completedWorkoutRepository,
            userContext: userContext);

        var result = await sut.Handle(new RebuildTraineeInsightsCommand(traineeId), CancellationToken.None);

        Assert.True(result.IsT4); // RebuildTraineeInsightsInsufficientCredits
    }

    [Fact]
    public async Task Handle_WhenAllConditionsMet_UpsertsPendingAndPublishesMessage()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Trainee
            {
                Id = traineeId,
                CoachUserId = userId,
                AthleteUserId = Guid.NewGuid(),
                Status = TraineeStatus.Active,
            });

        var completedWorkoutRepository = new Mock<ICompletedWorkoutRepository>();
        completedWorkoutRepository
            .Setup(x => x.CountCompletedByTraineeId(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(5L);

        var traineeInsightsRepository = new Mock<ITraineeInsightsRepository>();
        traineeInsightsRepository
            .Setup(x => x.GetByTraineeId(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TraineeInsights?)null);

        var mediator = new Mock<IMediator>();
        mediator
            .Setup(x => x.Send(It.IsAny<ReserveCreditsCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(OneOf<ReserveCreditsSuccess, ReserveCreditsError>.FromT0(new ReserveCreditsSuccess(1, 0, 1)));

        var publisher = new Mock<ITraineeInsightsRebuildPublisher>();

        var sut = CreateSut(
            mediator: mediator,
            traineeRepository: traineeRepository,
            completedWorkoutRepository: completedWorkoutRepository,
            traineeInsightsRepository: traineeInsightsRepository,
            publisher: publisher,
            userContext: userContext);

        var result = await sut.Handle(new RebuildTraineeInsightsCommand(traineeId), CancellationToken.None);

        Assert.True(result.IsT0); // RebuildTraineeInsightsSuccess

        traineeInsightsRepository.Verify(
            x => x.Upsert(
                It.Is<TraineeInsights>(d =>
                    d.Id == traineeId &&
                    d.Status == InsightsStatus.Pending),
                It.IsAny<CancellationToken>()),
            Times.Once);

        publisher.Verify(
            x => x.Publish(
                It.Is<TraineeInsightsRebuildRequestedMessage>(m =>
                    m.TraineeId == traineeId &&
                    m.CoachUserId == userId &&
                    m.IsManual == true),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WhenReservingCredits_UsesTraineeIdAsReferenceId()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Trainee
            {
                Id = traineeId,
                CoachUserId = userId,
                AthleteUserId = Guid.NewGuid(),
                Status = TraineeStatus.Active,
            });

        var completedWorkoutRepository = new Mock<ICompletedWorkoutRepository>();
        completedWorkoutRepository
            .Setup(x => x.CountCompletedByTraineeId(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(5L);

        var mediator = new Mock<IMediator>();
        mediator
            .Setup(x => x.Send(It.IsAny<ReserveCreditsCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(OneOf<ReserveCreditsSuccess, ReserveCreditsError>.FromT0(new ReserveCreditsSuccess(1, 0, 1)));

        var sut = CreateSut(
            mediator: mediator,
            traineeRepository: traineeRepository,
            completedWorkoutRepository: completedWorkoutRepository,
            userContext: userContext);

        await sut.Handle(new RebuildTraineeInsightsCommand(traineeId), CancellationToken.None);

        mediator.Verify(x => x.Send(
            It.Is<ReserveCreditsCommand>(c =>
                c.CoachUserId == userId &&
                c.Action == CreditAction.RebuildTraineeInsights &&
                c.ReferenceId == traineeId.ToString()),
            It.IsAny<CancellationToken>()),
            Times.Once);
    }
}
