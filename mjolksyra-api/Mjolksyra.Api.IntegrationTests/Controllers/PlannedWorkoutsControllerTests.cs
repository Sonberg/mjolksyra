using MediatR;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.Api.Common.UserEvents;
using Mjolksyra.Api.Controllers;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.PlannedWorkouts;
using Mjolksyra.UseCases.PlannedWorkouts.CreatePlannedWorkout;
using Mjolksyra.UseCases.PlannedWorkouts.DeletePlannedWorkout;
using Mjolksyra.UseCases.PlannedWorkouts.LogPlannedWorkout;
using Mjolksyra.UseCases.PlannedWorkouts.UpdatePlannedWorkout;
using Moq;

namespace Mjolksyra.Api.IntegrationTests.Controllers;

public class PlannedWorkoutsControllerTests
{
    private readonly Guid _traineeId = Guid.NewGuid();
    private readonly Guid _userId = Guid.NewGuid();
    private readonly Mock<IMediator> _mediator = new();
    private readonly Mock<IUserEventPublisher> _publisher = new();
    private readonly Mock<IUserContext> _userContext = new();
    private readonly PlannedWorkoutsController _sut;

    public PlannedWorkoutsControllerTests()
    {
        _userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(_userId);
        _sut = new PlannedWorkoutsController(_mediator.Object, _publisher.Object, _userContext.Object);
    }

    private PlannedWorkoutResponse MakeResponse() => new()
    {
        Id = Guid.NewGuid(),
        TraineeId = _traineeId,
        Name = null,
        Note = null,
        Exercises = [],
        PlannedAt = DateOnly.FromDateTime(DateTime.UtcNow),
        CreatedAt = DateTimeOffset.UtcNow
    };

    private static PlannedWorkoutRequest MakeRequest() => new()
    {
        Exercises = [],
        PlannedAt = DateOnly.FromDateTime(DateTime.UtcNow)
    };

    [Fact]
    public async Task Create_PublishesPlannedWorkoutsUpdatedEvent()
    {
        _mediator.Setup(x => x.Send(It.IsAny<CreatePlannedWorkoutCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(MakeResponse());

        await _sut.Create(_traineeId, MakeRequest(), CancellationToken.None);

        _publisher.Verify(x => x.Publish(
            _userId,
            "planned-workouts.updated",
            It.IsAny<object?>(),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Update_PublishesPlannedWorkoutsUpdatedEvent()
    {
        _mediator.Setup(x => x.Send(It.IsAny<UpdatePlannedWorkoutCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(MakeResponse());

        await _sut.Update(_traineeId, Guid.NewGuid(), MakeRequest(), CancellationToken.None);

        _publisher.Verify(x => x.Publish(
            _userId,
            "planned-workouts.updated",
            It.IsAny<object?>(),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Delete_PublishesPlannedWorkoutsUpdatedEvent()
    {
        _mediator.Setup(x => x.Send(It.IsAny<DeletePlannedWorkoutCommand>(), It.IsAny<CancellationToken>()))
            .Returns(Task.FromResult(Unit.Value));

        await _sut.Delete(_traineeId, Guid.NewGuid(), CancellationToken.None);

        _publisher.Verify(x => x.Publish(
            _userId,
            "planned-workouts.updated",
            It.IsAny<object?>(),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Log_DoesNotPublishEvent()
    {
        _mediator.Setup(x => x.Send(It.IsAny<LogPlannedWorkoutCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(MakeResponse());

        await _sut.Log(_traineeId, Guid.NewGuid(), new LogPlannedWorkoutRequest { Exercises = [] });

        _publisher.Verify(x => x.Publish(
            It.IsAny<Guid>(),
            It.IsAny<string>(),
            It.IsAny<object?>(),
            It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Create_WhenUserNotAuthenticated_DoesNotPublishEvent()
    {
        _userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync((Guid?)null);
        _mediator.Setup(x => x.Send(It.IsAny<CreatePlannedWorkoutCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(MakeResponse());

        await _sut.Create(_traineeId, MakeRequest(), CancellationToken.None);

        _publisher.Verify(x => x.Publish(
            It.IsAny<Guid>(),
            It.IsAny<string>(),
            It.IsAny<object?>(),
            It.IsAny<CancellationToken>()), Times.Never);
    }
}
