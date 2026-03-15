using Ganss.Xss;
using MediatR;
using System.Collections;
using System.Reflection;

namespace Mjolksyra.UseCases.Behaviors;

public class SanitizationBehavior<TRequest, TResponse>(HtmlSanitizer sanitizer)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        SanitizeObject(request);
        return await next();
    }

    private void SanitizeObject(object? obj)
    {
        if (obj is null) return;
        var type = obj.GetType();
        if (type.IsPrimitive || type == typeof(string) || type.IsEnum) return;

        foreach (var prop in type.GetProperties(BindingFlags.Public | BindingFlags.Instance))
        {
            if (!prop.CanRead || !prop.CanWrite) continue;
            if (prop.GetIndexParameters().Length > 0) continue;

            var value = prop.GetValue(obj);
            if (value is null) continue;

            if (value is string str)
            {
                prop.SetValue(obj, sanitizer.Sanitize(str));
            }
            else if (value is IEnumerable enumerable)
            {
                foreach (var item in enumerable)
                    SanitizeObject(item);
            }
            else if (!prop.PropertyType.IsPrimitive && !prop.PropertyType.IsEnum)
            {
                SanitizeObject(value);
            }
        }
    }
}
