using MassTransit;
using MediatR;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.Infrastructure.Messaging.Consumers;
using Mjolksyra.UseCases.Coaches.ReleaseCreditsReservation;
using Mjolksyra.UseCases.Coaches.SettleCreditsReservation;

namespace Mjolksyra.Infrastructure.Tests.Messaging;

public class TraineeInsightsRebuildConsumerTests
{
    private static Mock<ConsumeContext<TraineeInsightsRebuildRequestedMessage>> BuildContext(
        TraineeInsightsRebuildRequestedMessage message)
    {
        var context = new Mock<ConsumeContext<TraineeInsightsRebuildRequestedMessage>>();
        context.SetupGet(x => x.Message).Returns(message);
        context.SetupGet(x => x.CancellationToken).Returns(CancellationToken.None);
        return context;
    }

    private static TraineeInsightsRebuildConsumer CreateSut(
        Mock<ITraineeInsightsRepository>? traineeInsightsRepository = null,
        Mock<ICompletedWorkoutRepository>? completedWorkoutRepository = null,
        Mock<ITraineeInsightsAgent>? agent = null,
        Mock<IMediator>? mediator = null)
    {
        if (completedWorkoutRepository is null)
        {
            completedWorkoutRepository = new Mock<ICompletedWorkoutRepository>();
            completedWorkoutRepository
                .Setup(x => x.CountCompletedByTraineeId(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(5L);
        }

        if (agent is null)
        {
            agent = new Mock<ITraineeInsightsAgent>();
            agent
                .Setup(x => x.GenerateAsync(It.IsAny<TraineeInsightsGenerationInput>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new TraineeInsightsGenerationResult
                {
                    Success = true,
                    Strengths = [],
                    Weaknesses = [],
                    Recommendations = [],
                });
        }

        return new TraineeInsightsRebuildConsumer(
            (traineeInsightsRepository ?? new Mock<ITraineeInsightsRepository>()).Object,
            completedWorkoutRepository.Object,
            agent.Object,
            (mediator ?? new Mock<IMediator>()).Object,
            NullLogger<TraineeInsightsRebuildConsumer>.Instance);
    }

    [Fact]
    public async Task Consume_WhenFewerThanThreeWorkouts_SkipsRebuild()
    {
        var traineeId = Guid.NewGuid();
        var traineeInsightsRepository = new Mock<ITraineeInsightsRepository>();
        var completedWorkoutRepository = new Mock<ICompletedWorkoutRepository>();
        completedWorkoutRepository
            .Setup(x => x.CountCompletedByTraineeId(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(2L);

        var agent = new Mock<ITraineeInsightsAgent>();

        var sut = CreateSut(
            traineeInsightsRepository: traineeInsightsRepository,
            completedWorkoutRepository: completedWorkoutRepository,
            agent: agent);

        await sut.Consume(BuildContext(new TraineeInsightsRebuildRequestedMessage(
            TraineeId: traineeId,
            CoachUserId: Guid.NewGuid(),
            IsManual: true,
            RequestedAt: DateTimeOffset.UtcNow)).Object);

        agent.Verify(
            x => x.GenerateAsync(It.IsAny<TraineeInsightsGenerationInput>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Consume_WhenAutoRebuildAndNewerRequestExists_SkipsRebuild()
    {
        var traineeId = Guid.NewGuid();
        var requestedAt = DateTimeOffset.UtcNow.AddMinutes(-5);
        var newerRequestedAt = DateTimeOffset.UtcNow; // newer than message

        var traineeInsightsRepository = new Mock<ITraineeInsightsRepository>();
        traineeInsightsRepository
            .Setup(x => x.GetByTraineeId(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new TraineeInsights
            {
                Id = traineeId,
                Status = InsightsStatus.Pending,
                RebuildRequestedAt = newerRequestedAt, // newer than the message
                CreatedAt = DateTimeOffset.UtcNow,
                Strengths = [],
                Weaknesses = [],
                Recommendations = [],
            });

        var agent = new Mock<ITraineeInsightsAgent>();

        var sut = CreateSut(
            traineeInsightsRepository: traineeInsightsRepository,
            agent: agent);

        await sut.Consume(BuildContext(new TraineeInsightsRebuildRequestedMessage(
            TraineeId: traineeId,
            CoachUserId: Guid.NewGuid(),
            IsManual: false, // auto-rebuild
            RequestedAt: requestedAt)).Object);

        agent.Verify(
            x => x.GenerateAsync(It.IsAny<TraineeInsightsGenerationInput>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Consume_WhenAgentSucceeds_SetsStatusReady()
    {
        var traineeId = Guid.NewGuid();
        TraineeInsights? upserted = null;

        var traineeInsightsRepository = new Mock<ITraineeInsightsRepository>();
        traineeInsightsRepository
            .Setup(x => x.Upsert(It.IsAny<TraineeInsights>(), It.IsAny<CancellationToken>()))
            .Callback<TraineeInsights, CancellationToken>((doc, _) => upserted = doc)
            .Returns(Task.CompletedTask);

        var agent = new Mock<ITraineeInsightsAgent>();
        agent
            .Setup(x => x.GenerateAsync(It.IsAny<TraineeInsightsGenerationInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new TraineeInsightsGenerationResult
            {
                Success = true,
                Strengths = [new TraineeInsightsStrengthResult { Label = "Consistency", Detail = "Trains 4x/week" }],
                Weaknesses = [],
                Recommendations = [],
            });

        var sut = CreateSut(
            traineeInsightsRepository: traineeInsightsRepository,
            agent: agent);

        await sut.Consume(BuildContext(new TraineeInsightsRebuildRequestedMessage(
            TraineeId: traineeId,
            CoachUserId: Guid.NewGuid(),
            IsManual: true,
            RequestedAt: DateTimeOffset.UtcNow)).Object);

        Assert.NotNull(upserted);
        Assert.Equal(InsightsStatus.Ready, upserted!.Status);
    }

    [Fact]
    public async Task Consume_WhenAgentFails_SetsStatusFailed()
    {
        var traineeId = Guid.NewGuid();
        var statuses = new List<string>();

        var traineeInsightsRepository = new Mock<ITraineeInsightsRepository>();
        traineeInsightsRepository
            .Setup(x => x.Upsert(It.IsAny<TraineeInsights>(), It.IsAny<CancellationToken>()))
            .Callback<TraineeInsights, CancellationToken>((doc, _) => statuses.Add(doc.Status))
            .Returns(Task.CompletedTask);

        var agent = new Mock<ITraineeInsightsAgent>();
        agent
            .Setup(x => x.GenerateAsync(It.IsAny<TraineeInsightsGenerationInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new TraineeInsightsGenerationResult
            {
                Success = false,
                Strengths = [],
                Weaknesses = [],
                Recommendations = [],
            });

        var sut = CreateSut(
            traineeInsightsRepository: traineeInsightsRepository,
            agent: agent);

        await sut.Consume(BuildContext(new TraineeInsightsRebuildRequestedMessage(
            TraineeId: traineeId,
            CoachUserId: Guid.NewGuid(),
            IsManual: true,
            RequestedAt: DateTimeOffset.UtcNow)).Object);

        Assert.Contains(InsightsStatus.Failed, statuses);
    }

    [Fact]
    public async Task Consume_WhenManualAndAgentSucceeds_SettlesCredits()
    {
        var traineeId = Guid.NewGuid();
        var coachUserId = Guid.NewGuid();

        var agent = new Mock<ITraineeInsightsAgent>();
        agent
            .Setup(x => x.GenerateAsync(It.IsAny<TraineeInsightsGenerationInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new TraineeInsightsGenerationResult
            {
                Success = true,
                Strengths = [],
                Weaknesses = [],
                Recommendations = [],
            });

        var mediator = new Mock<IMediator>();

        var sut = CreateSut(agent: agent, mediator: mediator);

        await sut.Consume(BuildContext(new TraineeInsightsRebuildRequestedMessage(
            TraineeId: traineeId,
            CoachUserId: coachUserId,
            IsManual: true,
            RequestedAt: DateTimeOffset.UtcNow,
            IncludedReserved: 1,
            PurchasedReserved: 0)).Object);

        mediator.Verify(
            x => x.Send(
                It.Is<SettleCreditsReservationCommand>(c =>
                    c.CoachUserId == coachUserId &&
                    c.IncludedAmount == 1 &&
                    c.PurchasedAmount == 0 &&
                    c.Action == CreditAction.RebuildTraineeInsights),
                It.IsAny<CancellationToken>()),
            Times.Once);

        mediator.Verify(
            x => x.Send(It.IsAny<ReleaseCreditsReservationCommand>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Consume_WhenManualAndAgentFails_ReleasesCredits()
    {
        var traineeId = Guid.NewGuid();
        var coachUserId = Guid.NewGuid();

        var agent = new Mock<ITraineeInsightsAgent>();
        agent
            .Setup(x => x.GenerateAsync(It.IsAny<TraineeInsightsGenerationInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new TraineeInsightsGenerationResult
            {
                Success = false,
                Strengths = [],
                Weaknesses = [],
                Recommendations = [],
            });

        var mediator = new Mock<IMediator>();

        var sut = CreateSut(agent: agent, mediator: mediator);

        await sut.Consume(BuildContext(new TraineeInsightsRebuildRequestedMessage(
            TraineeId: traineeId,
            CoachUserId: coachUserId,
            IsManual: true,
            RequestedAt: DateTimeOffset.UtcNow,
            IncludedReserved: 1,
            PurchasedReserved: 0)).Object);

        mediator.Verify(
            x => x.Send(
                It.Is<ReleaseCreditsReservationCommand>(c =>
                    c.CoachUserId == coachUserId &&
                    c.IncludedAmount == 1 &&
                    c.PurchasedAmount == 0),
                It.IsAny<CancellationToken>()),
            Times.Once);

        mediator.Verify(
            x => x.Send(It.IsAny<SettleCreditsReservationCommand>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Consume_WhenAutoRebuildAndAgentSucceeds_DoesNotSettleOrReleaseCredits()
    {
        var traineeId = Guid.NewGuid();

        var agent = new Mock<ITraineeInsightsAgent>();
        agent
            .Setup(x => x.GenerateAsync(It.IsAny<TraineeInsightsGenerationInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new TraineeInsightsGenerationResult
            {
                Success = true,
                Strengths = [],
                Weaknesses = [],
                Recommendations = [],
            });

        var mediator = new Mock<IMediator>();

        var sut = CreateSut(agent: agent, mediator: mediator);

        await sut.Consume(BuildContext(new TraineeInsightsRebuildRequestedMessage(
            TraineeId: traineeId,
            CoachUserId: Guid.NewGuid(),
            IsManual: false,
            RequestedAt: DateTimeOffset.UtcNow)).Object);

        mediator.Verify(
            x => x.Send(It.IsAny<SettleCreditsReservationCommand>(), It.IsAny<CancellationToken>()),
            Times.Never);
        mediator.Verify(
            x => x.Send(It.IsAny<ReleaseCreditsReservationCommand>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Consume_WhenExceptionThrown_SetsStatusFailedAndReleasesManualCredits()
    {
        var traineeId = Guid.NewGuid();
        var coachUserId = Guid.NewGuid();
        var statuses = new List<string>();

        var traineeInsightsRepository = new Mock<ITraineeInsightsRepository>();
        traineeInsightsRepository
            .Setup(x => x.Upsert(It.IsAny<TraineeInsights>(), It.IsAny<CancellationToken>()))
            .Callback<TraineeInsights, CancellationToken>((doc, _) => statuses.Add(doc.Status))
            .Returns(Task.CompletedTask);

        var agent = new Mock<ITraineeInsightsAgent>();
        agent
            .Setup(x => x.GenerateAsync(It.IsAny<TraineeInsightsGenerationInput>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("AI service unavailable"));

        var mediator = new Mock<IMediator>();

        var sut = CreateSut(
            traineeInsightsRepository: traineeInsightsRepository,
            agent: agent,
            mediator: mediator);

        await sut.Consume(BuildContext(new TraineeInsightsRebuildRequestedMessage(
            TraineeId: traineeId,
            CoachUserId: coachUserId,
            IsManual: true,
            RequestedAt: DateTimeOffset.UtcNow,
            IncludedReserved: 1,
            PurchasedReserved: 0)).Object);

        Assert.Contains(InsightsStatus.Failed, statuses);
        mediator.Verify(
            x => x.Send(
                It.Is<ReleaseCreditsReservationCommand>(c => c.CoachUserId == coachUserId),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }
}
