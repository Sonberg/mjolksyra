using MediatR;
using OneOf;

namespace Mjolksyra.UseCases.Coaches.PurchaseAiCreditPack;

public record PurchaseAiCreditPackCommand(Guid CoachUserId, Guid PackId)
    : IRequest<OneOf<PurchaseAiCreditPackSuccess, PurchaseAiCreditPackError>>;
