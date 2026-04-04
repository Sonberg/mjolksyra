namespace Mjolksyra.Domain.Database.Models;

public class CreditPack
{
    public Guid Id { get; set; }

    public required string Name { get; set; }

    public int Credits { get; set; }

    public int PriceSek { get; set; }

    public bool IsActive { get; set; }
}
