namespace Mjolksyra.Domain.Database.Models;

public class ExerciseCategory
{
    public Guid Id { get; set; }

    public required string Name { get; set; }

    public Guid? CreatedByUserId { get; set; }
}