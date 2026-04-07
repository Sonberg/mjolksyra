using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Mjolksyra.Api.Common.UserEvents;
using Mjolksyra.Api.Controllers;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.PlannedWorkouts.ApplyAIPlannerProposal;
using Mjolksyra.UseCases.PlannedWorkouts.ClarifyWorkoutPlan;
using Mjolksyra.UseCases.PlannedWorkouts.DeletePlannerSession;
using Mjolksyra.UseCases.PlannedWorkouts.DiscardAIPlannerProposal;

namespace Mjolksyra.Api.IntegrationTests.Controllers;

public class AIWorkoutPlannerControllerTests
{
    private readonly Guid _traineeId = Guid.NewGuid();
    private readonly Guid _userId = Guid.NewGuid();
    private readonly Mock<IMediator> _mediator = new();
    private readonly Mock<IUserEventPublisher> _publisher = new();
    private readonly Mock<IUserContext> _userContext = new();
    private readonly AIWorkoutPlannerController _sut;

    public AIWorkoutPlannerControllerTests()
    {
        _userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(_userId);
        _sut = new AIWorkoutPlannerController(_mediator.Object, _publisher.Object, _userContext.Object);
    }

    [Fact]
    public async Task Clarify_ReturnsResponseWithoutPublishingPlannerEvents()
    {
        _mediator.Setup(x => x.Send(It.IsAny<ClarifyWorkoutPlanQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ClarifyWorkoutPlanResponse
            {
                SessionId = Guid.NewGuid(),
                Message = "Removed 4 workouts.",
            });

        var result = await _sut.Clarify(_traineeId, new ClarifyWorkoutPlanRequest
        {
            Description = "Remove workouts after today",
        }, CancellationToken.None);

        Assert.IsType<OkObjectResult>(result.Result);
        _publisher.Verify(x => x.Publish(
            It.IsAny<Guid>(),
            It.IsAny<string>(),
            It.IsAny<object?>(),
            It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task ApplyProposal_WhenSuccessful_PublishesPlannedWorkoutsUpdatedEvent()
    {
        _mediator.Setup(x => x.Send(It.IsAny<ApplyAIPlannerProposalCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ApplyAIPlannerProposalResponse
            {
                SessionId = Guid.NewGuid(),
                ProposalId = Guid.NewGuid(),
                ActionsApplied = 2,
                Summary = "Applied 2 changes.",
            });

        var result = await _sut.ApplyProposal(_traineeId, Guid.NewGuid(), CancellationToken.None);

        Assert.IsType<OkObjectResult>(result.Result);
        _publisher.Verify(x => x.Publish(
            _userId,
            "planned-workouts.updated",
            It.IsAny<object?>(),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteSession_WhenAuthorized_ReturnsNoContent()
    {
        _mediator.Setup(x => x.Send(It.IsAny<DeletePlannerSessionCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var result = await _sut.DeleteSession(_traineeId, Guid.NewGuid(), CancellationToken.None);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task DeleteSession_WhenForbidden_ReturnsForbid()
    {
        _mediator.Setup(x => x.Send(It.IsAny<DeletePlannerSessionCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var result = await _sut.DeleteSession(_traineeId, Guid.NewGuid(), CancellationToken.None);

        Assert.IsType<ForbidResult>(result);
    }

    [Fact]
    public async Task DiscardProposal_WhenAuthorized_ReturnsNoContent()
    {
        _mediator.Setup(x => x.Send(It.IsAny<DiscardAIPlannerProposalCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var result = await _sut.DiscardProposal(_traineeId, Guid.NewGuid(), CancellationToken.None);

        Assert.IsType<NoContentResult>(result);
    }
}
