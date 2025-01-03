namespace Mjolksyra.Infrastructure.Database;

public class MongoOptions
{
    public const string SectionName = "MongoDb";

    public required string ConnectionString { get; set; }
}