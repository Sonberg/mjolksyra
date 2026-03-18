using System.Reflection;
using Mjolksyra.Infrastructure.UploadThing;

namespace Mjolksyra.Infrastructure.Tests.UploadThing;

public class UploadThingFileUploaderTests
{
    [Fact]
    public void ToSqidsNumber_WhenHashIsNegative_ReturnsNonNegativeNumber()
    {
        var method = typeof(UploadThingFileUploader)
            .GetMethod("ToSqidsNumber", BindingFlags.NonPublic | BindingFlags.Static);

        Assert.NotNull(method);

        var result = (long)method!.Invoke(null, [-316367245])!;
        Assert.True(result >= 0);
        Assert.Equal(unchecked((long)(uint)-316367245), result);
    }
}
