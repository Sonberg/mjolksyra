namespace Mjolksyra.Domain.Database.Enum;

public enum StripeStatus
{
    RequiresPaymentMethod,
    RequiresConfirmation,
    Processing,
    Succeeded,
    RequiresAction,
    Canceled,
}