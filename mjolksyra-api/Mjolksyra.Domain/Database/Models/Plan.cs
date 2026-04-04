namespace Mjolksyra.Domain.Database.Models;

public class Plan
{
    public static readonly Guid StarterPlanId = new("00000000-0000-0000-0000-000000000001");
    public static readonly Guid ProPlanId = new("00000000-0000-0000-0000-000000000002");
    public static readonly Guid ScalePlanId = new("00000000-0000-0000-0000-000000000003");

    public Guid Id { get; set; }
    public required string Name { get; set; }
    public int MonthlyPriceSek { get; set; }
    public int IncludedAthletes { get; set; }
    public int ExtraAthletePriceSek { get; set; }

    public int IncludedCreditsPerCycle { get; set; }

    public int SortOrder { get; set; }
}
