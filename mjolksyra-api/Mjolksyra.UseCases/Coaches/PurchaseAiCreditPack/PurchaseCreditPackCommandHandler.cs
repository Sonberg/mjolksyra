using MediatR;
using Mjolksyra.Domain.Database;
using OneOf;

namespace Mjolksyra.UseCases.Coaches.PurchaseCreditPack;

public class PurchaseCreditPackCommandHandler(
    ICreditPackRepository packRepository,
    IUserRepository userRepository,
    IStripeCreditPackGateway stripeGateway)
    : IRequestHandler<PurchaseCreditPackCommand, OneOf<PurchaseCreditPackSuccess, PurchaseCreditPackError>>
{
    public async Task<OneOf<PurchaseCreditPackSuccess, PurchaseCreditPackError>> Handle(
        PurchaseCreditPackCommand request,
        CancellationToken cancellationToken)
    {
        var pack = await packRepository.GetById(request.PackId, cancellationToken);
        if (pack is null || !pack.IsActive)
            return new PurchaseCreditPackError("Credit pack not found.");

        var user = await userRepository.GetById(request.CoachUserId, cancellationToken);
        var customerId = user?.Coach?.Stripe?.PlatformCustomerId;
        if (customerId is null)
            return new PurchaseCreditPackError("Coach does not have a Stripe customer.");

        // Price in öre (SEK * 100)
        var amountOre = pack.PriceSek * 100;

        await stripeGateway.CreateAndPayInvoiceAsync(
            customerId,
            amountOre,
            pack.Id,
            request.CoachUserId,
            cancellationToken);

        // Credits are granted asynchronously via invoice.payment_succeeded webhook
        return new PurchaseCreditPackSuccess();
    }
}
