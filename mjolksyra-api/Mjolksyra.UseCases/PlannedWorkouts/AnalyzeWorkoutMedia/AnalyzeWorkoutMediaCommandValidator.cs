using FluentValidation;
using Microsoft.Extensions.Options;
using Mjolksyra.UseCases.MediaStorage;

namespace Mjolksyra.UseCases.PlannedWorkouts.AnalyzeWorkoutMedia;

public class AnalyzeWorkoutMediaCommandValidator : AbstractValidator<AnalyzeWorkoutMediaCommand>
{
    private const int MaxTextLength = 4000;
    private const int MaxMediaCount = 10;

    public AnalyzeWorkoutMediaCommandValidator(IOptions<MediaStorageOptions> mediaStorage)
    {
        var r2Host = GetHost(mediaStorage.Value.PublicBaseUrl);

        RuleFor(x => x.Analysis.Text)
            .MaximumLength(MaxTextLength);

        RuleFor(x => x.Analysis)
            .Must(x => !string.IsNullOrWhiteSpace(x.Text) || x.MediaUrls.Count > 0)
            .WithMessage("Provide text or at least one media URL.");

        RuleFor(x => x.Analysis.MediaUrls)
            .Must(urls => urls.Count <= MaxMediaCount)
            .WithMessage($"No more than {MaxMediaCount} media URLs are allowed.");

        RuleForEach(x => x.Analysis.MediaUrls)
            .Must(url => IsR2Url(url, r2Host) || IsLegacyUtfsUrl(url))
            .WithMessage("'{PropertyValue}' is not a valid media URL.");
    }

    private static bool IsR2Url(string url, string? r2Host)
    {
        if (string.IsNullOrEmpty(r2Host)) return false;
        return Uri.TryCreate(url, UriKind.Absolute, out var u) && u.Host == r2Host;
    }

    private static bool IsLegacyUtfsUrl(string url)
        => Uri.TryCreate(url, UriKind.Absolute, out var u) && u.Host == "utfs.io";

    private static string? GetHost(string? baseUrl)
    {
        if (string.IsNullOrEmpty(baseUrl)) return null;
        return Uri.TryCreate(baseUrl, UriKind.Absolute, out var u) ? u.Host : null;
    }
}
