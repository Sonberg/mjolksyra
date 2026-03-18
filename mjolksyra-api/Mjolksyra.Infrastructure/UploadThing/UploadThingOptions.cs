using System.ComponentModel.DataAnnotations;

namespace Mjolksyra.Infrastructure.UploadThing;

public class UploadThingOptions
{
    public const string SectionName = "UploadThing";

    [Required]
    public required string SecretKey { get; set; }
}
