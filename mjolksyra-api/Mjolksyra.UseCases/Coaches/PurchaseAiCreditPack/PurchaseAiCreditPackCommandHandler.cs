using MediatR;
using Mjolksyra.Domain.Database;
using OneOf;

namespace Mjolksyra.UseCases.Coaches.PurchaseAiCreditPack;

public class PurchaseAiCreditPackCommandHandler(
    IAiCreditPackRepository packRepository,
    IUserRepository userRepository,
    IStripeAiCreditPackGateway stripeGateway)
    : IRequestHandler<PurchaseAiCreditPackCommand, OneOf<PurchaseAiCreditPackSuccess, PurchaseAiCreditPackError>>
{
    public async Task<OneOf<PurchaseAiCreditPackSuccess, PurchaseAiCreditPackError>> Handle(
        PurchaseAiCreditPackCommand request,
        CancellationToken cancellationToken)
    {
        var pack = await packRepository.GetById(request.PackId, cancellationToken);
        if (pack is null || !pack.IsActive)
            return new PurchaseAiCreditPackError("Credit pack not found.");

        var user = await userRepository.GetById(request.CoachUserId, cancellationToken);
        var customerId = user?.Coach?.Stripe?.PlatformCustomerId;
        if (customerId is null)
            return new PurchaseAiCreditPackError("Coach does not have a Stripe customer.");

        // Price in öre (SEK * 100)
        var amountOre = pack.PriceSek * 100;

        await stripeGateway.CreateAndPayInvoiceAsync(
            customerId,
            amountOre,
            pack.Id,
            request.CoachUserId,
            cancellationToken);

        // Credits are granted asynchronously via invoice.payment_succeeded webhook
        return new PurchaseAiCreditPackSuccess();
    }
}
