using Mjolksyra.Infrastructure.R2;

namespace Mjolksyra.Infrastructure.Tests.R2;

public class R2UrlHelperTests
{
    private const string BaseUrl = "https://media.example.com";

    [Theory]
    [InlineData("https://media.example.com/workouts/abc.webp", "workouts/abc.webp")]
    [InlineData("https://media.example.com/workouts/abc.mp4", "workouts/abc.mp4")]
    [InlineData("https://media.example.com/workouts/abc.webp?raw=1", "workouts/abc.webp")]
    [InlineData("https://media.example.com/workouts/abc.mp4?raw=1&foo=bar", "workouts/abc.mp4")]
    public void ExtractKey_ValidR2Url_ReturnsKey(string url, string expectedKey)
    {
        var result = R2UrlHelper.ExtractKey(url, BaseUrl);
        Assert.Equal(expectedKey, result);
    }

    [Theory]
    [InlineData("https://utfs.io/f/abc123")]
    [InlineData("https://utfs.io/f/abc123?ct=video")]
    [InlineData("https://other.domain.com/file.webp")]
    [InlineData("not-a-url")]
    public void ExtractKey_NonR2Url_ReturnsEmpty(string url)
    {
        var result = R2UrlHelper.ExtractKey(url, BaseUrl);
        Assert.Equal(string.Empty, result);
    }

    [Fact]
    public void ExtractKey_BaseUrlWithTrailingSlash_StillWorks()
    {
        var result = R2UrlHelper.ExtractKey("https://media.example.com/workouts/abc.webp", "https://media.example.com/");
        Assert.Equal("workouts/abc.webp", result);
    }

    [Fact]
    public void ExtractKey_EmptyUrl_ReturnsEmpty()
    {
        var result = R2UrlHelper.ExtractKey(string.Empty, BaseUrl);
        Assert.Equal(string.Empty, result);
    }
}
