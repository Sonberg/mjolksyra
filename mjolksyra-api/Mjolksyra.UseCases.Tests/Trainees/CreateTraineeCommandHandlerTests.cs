using MediatR;
using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.UseCases.Trainees;
using Mjolksyra.UseCases.Trainees.CreateTrainee;

namespace Mjolksyra.UseCases.Tests.Trainees;

public class CreateTraineeCommandHandlerTests
{
    [Fact]
    public async Task Handle_WhenAlreadyConnected_ReturnsAlreadyConnectedError()
    {
        var coach = CreateUser("coach@example.com");
        var athlete = CreateUser("athlete@example.com");

        var userRepository = new Mock<IUserRepository>();
        userRepository.Setup(x => x.GetById(coach.Id, It.IsAny<CancellationToken>())).ReturnsAsync(coach);
        userRepository.Setup(x => x.GetById(athlete.Id, It.IsAny<CancellationToken>())).ReturnsAsync(athlete);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.ExistsActiveRelationship(coach.Id, athlete.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var responseBuilder = new Mock<ITraineeResponseBuilder>();
        var mediator = new Mock<IMediator>();
        var sut = new CreateTraineeCommandHandler(
            traineeRepository.Object,
            userRepository.Object,
            responseBuilder.Object,
            mediator.Object);

        var result = await sut.Handle(new CreateTraineeCommand
        {
            CoachUserId = coach.Id,
            AthleteUserId = athlete.Id
        }, CancellationToken.None);

        var error = result.AsT1;
        Assert.Equal(CreateTraineeErrorCode.AlreadyConnected, error.Code);
        Assert.Equal("Athlete is already connected to this coach.", error.Message);
        traineeRepository.Verify(x => x.Create(It.IsAny<Trainee>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenNotConnected_CreatesTraineeAndReturnsResponse()
    {
        var coach = CreateUser("coach@example.com");
        var athlete = CreateUser("athlete@example.com");
        var expectedResponse = CreateTraineeResponse(coach, athlete);

        var userRepository = new Mock<IUserRepository>();
        userRepository.Setup(x => x.GetById(coach.Id, It.IsAny<CancellationToken>())).ReturnsAsync(coach);
        userRepository.Setup(x => x.GetById(athlete.Id, It.IsAny<CancellationToken>())).ReturnsAsync(athlete);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.ExistsActiveRelationship(coach.Id, athlete.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        traineeRepository
            .Setup(x => x.Create(It.IsAny<Trainee>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Trainee t, CancellationToken _) => t);

        var responseBuilder = new Mock<ITraineeResponseBuilder>();
        responseBuilder
            .Setup(x => x.Build(It.IsAny<Trainee>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResponse);
        var mediator = new Mock<IMediator>();

        var sut = new CreateTraineeCommandHandler(
            traineeRepository.Object,
            userRepository.Object,
            responseBuilder.Object,
            mediator.Object);

        var result = await sut.Handle(new CreateTraineeCommand
        {
            CoachUserId = coach.Id,
            AthleteUserId = athlete.Id
        }, CancellationToken.None);

        Assert.True(result.IsT0);
        Assert.Equal(expectedResponse.Id, result.AsT0.Id);
        traineeRepository.Verify(x => x.Create(It.IsAny<Trainee>(), It.IsAny<CancellationToken>()), Times.Once);
        mediator.Verify(x => x.Send(It.IsAny<IRequest>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    private static User CreateUser(string email)
    {
        return new User
        {
            Id = Guid.NewGuid(),
            Email = Email.From(email),
            GivenName = "Test",
            FamilyName = "User",
            ClerkUserId = "clerk_test",
            CreatedAt = DateTimeOffset.UtcNow
        };
    }

    private static TraineeResponse CreateTraineeResponse(User coach, User athlete)
    {
        return new TraineeResponse
        {
            Id = Guid.NewGuid(),
            Coach = TraineeUserResponse.From(coach),
            Athlete = TraineeUserResponse.From(athlete),
            Cost = new TraineeCostResponse
            {
                Total = 0,
                Currency = "sek"
            },
            LastWorkoutAt = null,
            NextWorkoutAt = null,
            Billing = new TraineeBillingResponse
            {
                Status = TraineeBillingStatus.PriceNotSet,
                HasPrice = false,
                HasSubscription = false,
                LastChargedAt = null,
                NextChargedAt = null
            },
            CreatedAt = DateTimeOffset.UtcNow
        };
    }
}
