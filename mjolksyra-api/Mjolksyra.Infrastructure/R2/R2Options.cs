using System.ComponentModel.DataAnnotations;

namespace Mjolksyra.Infrastructure.R2;

public class R2Options
{
    public const string SectionName = "R2";

    [Required]
    public string AccountId { get; set; } = null!;

    [Required]
    public string BucketName { get; set; } = null!;

    [Required]
    public string AccessKeyId { get; set; } = null!;

    [Required]
    public string SecretAccessKey { get; set; } = null!;

    [Required]
    public string PublicBaseUrl { get; set; } = null!;
}
