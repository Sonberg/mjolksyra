namespace Mjolksyra.Domain.Database.Models;

public class Exercise
{
    public Guid Id { get; set; }

    public Guid? ExerciseCategoryId { get; set; }

    public required string Name { get; set; }
    
    public ICollection<string> Tags { get; set; } = Array.Empty<string>();

    public Guid? CreatedByUserId { get; set; }
}