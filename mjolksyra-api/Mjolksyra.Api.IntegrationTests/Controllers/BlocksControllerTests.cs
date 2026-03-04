using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.Api.Common.UserEvents;
using Mjolksyra.Api.Controllers;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.Blocks.ApplyBlock;
using Moq;
using Zeta;
using Zeta.AspNetCore;

namespace Mjolksyra.Api.IntegrationTests.Controllers;

public class BlocksControllerTests
{
    private readonly Guid _traineeId = Guid.NewGuid();
    private readonly Guid _userId = Guid.NewGuid();
    private readonly Mock<IMediator> _mediator = new();
    private readonly Mock<IUserEventPublisher> _publisher = new();
    private readonly Mock<IUserContext> _userContext = new();
    private readonly BlocksController _sut;

    public BlocksControllerTests()
    {
        _userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(_userId);

        _mediator.Setup(x => x.Send(It.IsAny<ApplyBlockCommand>(), It.IsAny<CancellationToken>()))
            .Returns(Task.FromResult(Unit.Value));

        _sut = new BlocksController(
            _mediator.Object,
            new Mock<IZetaValidator>().Object,
            _publisher.Object,
            _userContext.Object);

        _sut.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext()
        };
    }

    [Fact]
    public async Task Apply_PublishesPlannedWorkoutsUpdatedEvent()
    {
        var request = new ApplyBlockRequest
        {
            TraineeId = _traineeId,
            StartDate = new DateOnly(2026, 1, 6)
        };

        await _sut.Apply(Guid.NewGuid(), request);

        _publisher.Verify(x => x.Publish(
            _userId,
            "planned-workouts.updated",
            It.IsAny<object?>(),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Apply_WhenUserNotAuthenticated_DoesNotPublishEvent()
    {
        _userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync((Guid?)null);

        var request = new ApplyBlockRequest
        {
            TraineeId = _traineeId,
            StartDate = new DateOnly(2026, 1, 6)
        };

        await _sut.Apply(Guid.NewGuid(), request);

        _publisher.Verify(x => x.Publish(
            It.IsAny<Guid>(),
            It.IsAny<string>(),
            It.IsAny<object?>(),
            It.IsAny<CancellationToken>()), Times.Never);
    }
}
