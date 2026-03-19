using MediatR;
using Moq;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.UseCases.Coaches.AnalyzeWorkoutText;
using Mjolksyra.UseCases.Coaches.ConsumeCredits;

namespace Mjolksyra.UseCases.Tests.Coaches;

public class AnalyzeWorkoutTextCommandHandlerTests
{
    [Fact]
    public async Task Handle_WhenWorkoutHasNoText_ReturnsValidationError_WithoutCreditConsumption()
    {
        var mediator = new Mock<IMediator>();
        var gateway = new Mock<IWorkoutTextAnalysisGateway>();
        var sut = new AnalyzeWorkoutTextCommandHandler(mediator.Object, gateway.Object);

        var workout = new PlannedWorkout
        {
            Id = Guid.NewGuid(),
            TraineeId = Guid.NewGuid(),
            Name = null,
            Note = null,
            CompletionNote = null,
            PlannedAt = new DateOnly(2026, 3, 19),
            CreatedAt = DateTimeOffset.UtcNow,
            Exercises = [],
        };

        var result = await sut.Handle(
            new AnalyzeWorkoutTextCommand(Guid.NewGuid(), workout),
            CancellationToken.None);

        Assert.True(result.IsT1);
        Assert.Contains("analyzable text", result.AsT1.Reason, StringComparison.OrdinalIgnoreCase);
        mediator.Verify(m => m.Send(It.IsAny<ConsumeCreditsCommand>(), It.IsAny<CancellationToken>()), Times.Never);
        gateway.Verify(g => g.AnalyzeAsync(It.IsAny<PlannedWorkout>(), It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenCreditConsumptionFails_ReturnsCreditError()
    {
        var mediator = new Mock<IMediator>();
        var gateway = new Mock<IWorkoutTextAnalysisGateway>();
        mediator
            .Setup(m => m.Send(
                It.IsAny<ConsumeCreditsCommand>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ConsumeCreditsError("Insufficient credits."));

        var sut = new AnalyzeWorkoutTextCommandHandler(mediator.Object, gateway.Object);

        var workout = new PlannedWorkout
        {
            Id = Guid.NewGuid(),
            TraineeId = Guid.NewGuid(),
            Name = "Workout A",
            Note = "Squat felt heavy",
            PlannedAt = new DateOnly(2026, 3, 19),
            CreatedAt = DateTimeOffset.UtcNow,
            Exercises = [],
        };

        var result = await sut.Handle(
            new AnalyzeWorkoutTextCommand(Guid.NewGuid(), workout),
            CancellationToken.None);

        Assert.True(result.IsT1);
        Assert.Contains("Insufficient credits", result.AsT1.Reason);
        gateway.Verify(g => g.AnalyzeAsync(It.IsAny<PlannedWorkout>(), It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenSuccessful_UsesAiGatewayAndReturnsAnalysis()
    {
        var mediator = new Mock<IMediator>();
        var gateway = new Mock<IWorkoutTextAnalysisGateway>();

        mediator
            .Setup(m => m.Send(
                It.IsAny<ConsumeCreditsCommand>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ConsumeCreditsSuccess(9, 4));

        gateway
            .Setup(g => g.AnalyzeAsync(
                It.IsAny<PlannedWorkout>(),
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new WorkoutTextAnalysisResult(
                "Summary",
                ["KP1"],
                ["REC1"]));

        var sut = new AnalyzeWorkoutTextCommandHandler(mediator.Object, gateway.Object);
        var workout = new PlannedWorkout
        {
            Id = Guid.NewGuid(),
            TraineeId = Guid.NewGuid(),
            Name = "Back Squat",
            Note = "3x5 @RPE 9, left knee pain",
            CompletionNote = "Very tired after set 3",
            PlannedAt = new DateOnly(2026, 3, 19),
            CreatedAt = DateTimeOffset.UtcNow,
            Exercises = [],
        };

        var result = await sut.Handle(
            new AnalyzeWorkoutTextCommand(Guid.NewGuid(), workout),
            CancellationToken.None);

        Assert.True(result.IsT0);
        Assert.Equal("Summary", result.AsT0.Summary);
        Assert.Equal(9, result.AsT0.RemainingIncluded);
        Assert.Equal(4, result.AsT0.RemainingPurchased);
        gateway.Verify(g => g.AnalyzeAsync(
            workout,
            It.Is<string>(text => text.Contains("Back Squat")),
            It.IsAny<CancellationToken>()), Times.Once);
    }
}

