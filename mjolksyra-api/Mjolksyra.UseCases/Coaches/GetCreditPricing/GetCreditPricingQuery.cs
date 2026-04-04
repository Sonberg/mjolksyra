using MediatR;

namespace Mjolksyra.UseCases.Coaches.GetCreditPricing;

public record GetCreditPricingQuery : IRequest<ICollection<CreditPricingItemResponse>>;
