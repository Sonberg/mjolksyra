namespace Mjolksyra.UseCases.Coaches.GetPlans;

public class PlanResponse
{
    public required Guid Id { get; set; }
    public required string Name { get; set; }
    public required int MonthlyPriceSek { get; set; }
    public required int IncludedAthletes { get; set; }
    public required int ExtraAthletePriceSek { get; set; }
    public required int SortOrder { get; set; }
}
