using MediatR;
using OneOf;

namespace Mjolksyra.UseCases.Coaches.PurchaseCreditPack;

public record PurchaseCreditPackCommand(Guid CoachUserId, Guid PackId)
    : IRequest<OneOf<PurchaseCreditPackSuccess, PurchaseCreditPackError>>;
