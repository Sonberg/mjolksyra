using Mjolksyra.UseCases.Admin.CreateDiscountCode;

namespace Mjolksyra.UseCases.Tests.Admin;

public class CreateDiscountCodeCommandHandlerTests
{
    [Fact]
    public void BuildDescription_PercentForever_ReturnsExpectedText()
    {
        var command = new CreateDiscountCodeCommand
        {
            Code = "NATALIE100",
            Description = null,
            DiscountType = DiscountType.Percent,
            DiscountValue = 100,
            Duration = DiscountDuration.Forever,
        };

        var description = CreateDiscountCodeCommandHandler.BuildDescription(command);

        Assert.Equal("100% off · forever", description);
    }

    [Fact]
    public void BuildDescription_FixedRepeating_ReturnsExpectedText()
    {
        var command = new CreateDiscountCodeCommand
        {
            Code = "SEK200",
            Description = null,
            DiscountType = DiscountType.FixedAmount,
            DiscountValue = 20000,
            Duration = DiscountDuration.Repeating,
            DurationInMonths = 3,
        };

        var description = CreateDiscountCodeCommandHandler.BuildDescription(command);

        Assert.Equal("200 kr off · repeating (3 months)", description);
    }
}
