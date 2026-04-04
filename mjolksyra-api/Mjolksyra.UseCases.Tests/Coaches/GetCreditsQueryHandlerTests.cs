using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.UseCases.Coaches.GetCredits;

namespace Mjolksyra.UseCases.Tests.Coaches;

public class GetCreditsQueryHandlerTests
{
    [Fact]
    public async Task Handle_ReturnsNextResetOneMonthAfterLastReset()
    {
        var coachUserId = Guid.NewGuid();
        var lastReset = new DateTimeOffset(2026, 4, 1, 12, 0, 0, TimeSpan.Zero);
        var repository = new Mock<IUserCreditsRepository>();
        repository.Setup(x => x.GetByCoachUserId(coachUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new UserCredits
            {
                Id = Guid.NewGuid(),
                CoachUserId = coachUserId,
                IncludedRemaining = 12,
                PurchasedRemaining = 8,
                LastResetAt = lastReset,
            });

        var sut = new GetCreditsQueryHandler(repository.Object);

        var result = await sut.Handle(new GetCreditsQuery(coachUserId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(lastReset.AddMonths(1), result!.NextResetAt);
    }
}
