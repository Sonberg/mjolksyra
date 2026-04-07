using Moq;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.PlannedWorkouts.DiscardAIPlannerProposal;

namespace Mjolksyra.UseCases.Tests.PlannedWorkouts;

public class DiscardAIPlannerProposalCommandHandlerTests
{
    [Fact]
    public async Task Handle_WhenCoachOwnsProposal_MarksItDiscarded()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var proposalId = Guid.NewGuid();
        var session = new PlannerSession
        {
            Id = Guid.NewGuid(),
            TraineeId = traineeId,
            CoachUserId = userId,
            Description = "Plan next week",
            ProposedActionSet = new AIPlannerActionSet
            {
                Id = proposalId,
                Status = AIPlannerProposalStatus.Pending,
                Summary = "Move workout",
            },
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
        };

        var sessionRepository = new Mock<IPlannerSessionRepository>();
        sessionRepository
            .Setup(x => x.GetByProposalId(proposalId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(session);

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

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(userId);

        var sut = new DiscardAIPlannerProposalCommandHandler(
            sessionRepository.Object,
            traineeRepository.Object,
            userContext.Object);

        var result = await sut.Handle(new DiscardAIPlannerProposalCommand
        {
            TraineeId = traineeId,
            ProposalId = proposalId,
        }, CancellationToken.None);

        Assert.True(result);
        Assert.Equal(AIPlannerProposalStatus.Discarded, session.ProposedActionSet?.Status);
        sessionRepository.Verify(x => x.Update(session, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenProposalBelongsToAnotherCoach_ReturnsFalse()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var proposalId = Guid.NewGuid();

        var sessionRepository = new Mock<IPlannerSessionRepository>();
        sessionRepository
            .Setup(x => x.GetByProposalId(proposalId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((PlannerSession?)null);

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

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(userId);

        var sut = new DiscardAIPlannerProposalCommandHandler(
            sessionRepository.Object,
            traineeRepository.Object,
            userContext.Object);

        var result = await sut.Handle(new DiscardAIPlannerProposalCommand
        {
            TraineeId = traineeId,
            ProposalId = proposalId,
        }, CancellationToken.None);

        Assert.False(result);
        sessionRepository.Verify(x => x.Update(It.IsAny<PlannerSession>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
