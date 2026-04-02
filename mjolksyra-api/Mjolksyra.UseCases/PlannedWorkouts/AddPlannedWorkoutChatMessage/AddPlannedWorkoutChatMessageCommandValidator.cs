using FluentValidation;
using Microsoft.Extensions.Options;
using Mjolksyra.UseCases.MediaStorage;

namespace Mjolksyra.UseCases.PlannedWorkouts.AddPlannedWorkoutChatMessage;

public class AddPlannedWorkoutChatMessageCommandValidator : AbstractValidator<AddPlannedWorkoutChatMessageCommand>
{
    public AddPlannedWorkoutChatMessageCommandValidator(IOptions<MediaStorageOptions> mediaStorage)
    {
        var r2Host = GetHost(mediaStorage.Value.PublicBaseUrl);

        RuleFor(x => x.Message.Message)
            .MaximumLength(4000);

        RuleFor(x => x.Message.Role)
            .IsInEnum()
            .When(x => x.Message.Role.HasValue);

        RuleForEach(x => x.Message.MediaUrls)
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
