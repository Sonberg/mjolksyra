using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Notifications;
using Mjolksyra.UseCases.Trainees.RefundTraineeTransaction;

namespace Mjolksyra.UseCases.Tests.Trainees;

public class RefundTraineeTransactionCommandHandlerTests
{
    private static readonly Guid CoachId = Guid.NewGuid();
    private static readonly Guid AthleteId = Guid.NewGuid();
    private static readonly Guid TraineeId = Guid.NewGuid();
    private static readonly Guid TransactionId = Guid.NewGuid();

    private static Trainee BuildTrainee() =>
        new Trainee
        {
            Id = TraineeId,
            CoachUserId = CoachId,
            AthleteUserId = AthleteId,
            Status = TraineeStatus.Active,
            Cost = new TraineeCost { Amount = 600 },
            CreatedAt = DateTimeOffset.UtcNow
        };

    private static TraineeTransaction BuildTransaction(TraineeTransactionStatus status = TraineeTransactionStatus.Succeeded) =>
        new TraineeTransaction
        {
            Id = TransactionId,
            TraineeId = TraineeId,
            PaymentIntentId = "in_test",
            Status = status,
            Cost = new TraineeTransactionCost { Total = 600, Currency = "sek" },
            CreatedAt = DateTimeOffset.UtcNow
        };

    private static User BuildUser(Guid id) => new()
    {
        Id = id,
        ClerkUserId = id.ToString(),
        Email = Email.From($"{id}@example.com"),
        CreatedAt = DateTimeOffset.UtcNow
    };

    private static RefundTraineeTransactionCommandHandler BuildSut(
        ITraineeRepository? traineeRepository = null,
        ITraineeTransactionRepository? transactionRepository = null,
        IStripeRefundGateway? stripeRefundGateway = null)
    {
        var userRepository = new Mock<IUserRepository>();
        userRepository.Setup(x => x.GetById(CoachId, It.IsAny<CancellationToken>())).ReturnsAsync(BuildUser(CoachId));
        userRepository.Setup(x => x.GetById(AthleteId, It.IsAny<CancellationToken>())).ReturnsAsync(BuildUser(AthleteId));

        return new RefundTraineeTransactionCommandHandler(
            traineeRepository ?? Mock.Of<ITraineeRepository>(),
            transactionRepository ?? Mock.Of<ITraineeTransactionRepository>(),
            userRepository.Object,
            stripeRefundGateway ?? Mock.Of<IStripeRefundGateway>(),
            Mock.Of<INotificationService>());
    }

    [Fact]
    public async Task Handle_WhenTraineeNotFound_DoesNothing()
    {
        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.GetById(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Trainee?)null);

        var stripeGateway = new Mock<IStripeRefundGateway>();
        var sut = BuildSut(traineeRepository.Object, stripeRefundGateway: stripeGateway.Object);

        await sut.Handle(new RefundTraineeTransactionCommand
        {
            TraineeId = TraineeId,
            TransactionId = TransactionId,
            UserId = CoachId
        }, CancellationToken.None);

        stripeGateway.Verify(x => x.RefundInvoiceAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenCallerIsNotCoach_DoesNothing()
    {
        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.GetById(TraineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(BuildTrainee());

        var stripeGateway = new Mock<IStripeRefundGateway>();
        var sut = BuildSut(traineeRepository.Object, stripeRefundGateway: stripeGateway.Object);

        await sut.Handle(new RefundTraineeTransactionCommand
        {
            TraineeId = TraineeId,
            TransactionId = TransactionId,
            UserId = Guid.NewGuid() // some other user
        }, CancellationToken.None);

        stripeGateway.Verify(x => x.RefundInvoiceAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenTransactionAlreadyRefunded_DoesNothing()
    {
        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.GetById(TraineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(BuildTrainee());

        var transactionRepository = new Mock<ITraineeTransactionRepository>();
        transactionRepository
            .Setup(x => x.GetById(TransactionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(BuildTransaction(TraineeTransactionStatus.Refunded));

        var stripeGateway = new Mock<IStripeRefundGateway>();
        var sut = BuildSut(traineeRepository.Object, transactionRepository.Object, stripeGateway.Object);

        await sut.Handle(new RefundTraineeTransactionCommand
        {
            TraineeId = TraineeId,
            TransactionId = TransactionId,
            UserId = CoachId
        }, CancellationToken.None);

        stripeGateway.Verify(x => x.RefundInvoiceAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenTransactionFailed_DoesNothing()
    {
        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.GetById(TraineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(BuildTrainee());

        var transactionRepository = new Mock<ITraineeTransactionRepository>();
        transactionRepository
            .Setup(x => x.GetById(TransactionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(BuildTransaction(TraineeTransactionStatus.Failed));

        var stripeGateway = new Mock<IStripeRefundGateway>();
        var sut = BuildSut(traineeRepository.Object, transactionRepository.Object, stripeGateway.Object);

        await sut.Handle(new RefundTraineeTransactionCommand
        {
            TraineeId = TraineeId,
            TransactionId = TransactionId,
            UserId = CoachId
        }, CancellationToken.None);

        stripeGateway.Verify(x => x.RefundInvoiceAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenCoachRefundsSucceededTransaction_IssuesRefundAndUpdatesStatus()
    {
        var trainee = BuildTrainee();
        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.GetById(TraineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(trainee);

        var transactionRepository = new Mock<ITraineeTransactionRepository>();
        transactionRepository
            .Setup(x => x.GetById(TransactionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(BuildTransaction(TraineeTransactionStatus.Succeeded));

        var stripeGateway = new Mock<IStripeRefundGateway>();
        stripeGateway
            .Setup(x => x.RefundInvoiceAsync("in_test", It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var sut = BuildSut(traineeRepository.Object, transactionRepository.Object, stripeGateway.Object);

        await sut.Handle(new RefundTraineeTransactionCommand
        {
            TraineeId = TraineeId,
            TransactionId = TransactionId,
            UserId = CoachId
        }, CancellationToken.None);

        stripeGateway.Verify(x => x.RefundInvoiceAsync("in_test", It.IsAny<CancellationToken>()), Times.Once);
        transactionRepository.Verify(x => x.Upsert(
            It.Is<TraineeTransaction>(t =>
                t.Id == TransactionId &&
                t.Status == TraineeTransactionStatus.Refunded),
            It.IsAny<CancellationToken>()), Times.Once);
    }
}
