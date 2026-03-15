using Ganss.Xss;
using MediatR;
using Mjolksyra.UseCases.Behaviors;

namespace Mjolksyra.UseCases.Tests.Behaviors;

public class SanitizationBehaviorTests
{
    private readonly HtmlSanitizer _sanitizer;
    private readonly SanitizationBehavior<TestCommand, Unit> _behavior;

    public SanitizationBehaviorTests()
    {
        _sanitizer = new HtmlSanitizer();
        _sanitizer.AllowedTags.Clear();
        _behavior = new SanitizationBehavior<TestCommand, Unit>(_sanitizer);
    }

    [Fact]
    public async Task Handle_ScriptTagInStringProperty_IsStripped()
    {
        var command = new TestCommand { Name = "<script>alert(1)</script>Hello" };

        await _behavior.Handle(command, () => Task.FromResult(Unit.Value), CancellationToken.None);

        Assert.Equal("Hello", command.Name);
    }

    [Fact]
    public async Task Handle_NullStringProperty_RemainsNull()
    {
        var command = new TestCommand { Name = null };

        await _behavior.Handle(command, () => Task.FromResult(Unit.Value), CancellationToken.None);

        Assert.Null(command.Name);
    }

    [Fact]
    public async Task Handle_CleanString_PassesThroughUnchanged()
    {
        var command = new TestCommand { Name = "Bench Press" };

        await _behavior.Handle(command, () => Task.FromResult(Unit.Value), CancellationToken.None);

        Assert.Equal("Bench Press", command.Name);
    }

    [Fact]
    public async Task Handle_NestedObjectStringProperty_IsSanitized()
    {
        var command = new TestCommandWithNested
        {
            Nested = new NestedObject { Note = "<script>xss</script>safe note" }
        };
        var behavior = new SanitizationBehavior<TestCommandWithNested, Unit>(_sanitizer);

        await behavior.Handle(command, () => Task.FromResult(Unit.Value), CancellationToken.None);

        Assert.Equal("safe note", command.Nested.Note);
    }

    [Fact]
    public async Task Handle_CollectionItemStringProperty_IsSanitized()
    {
        var command = new TestCommandWithCollection
        {
            Items = [new NestedObject { Note = "<img src=x onerror=alert(1)>text" }]
        };
        var behavior = new SanitizationBehavior<TestCommandWithCollection, Unit>(_sanitizer);

        await behavior.Handle(command, () => Task.FromResult(Unit.Value), CancellationToken.None);

        Assert.Equal("text", command.Items[0].Note);
    }

    [Fact]
    public async Task Handle_IntProperty_IsUnchanged()
    {
        var command = new TestCommand { Name = "valid", Count = 42 };

        await _behavior.Handle(command, () => Task.FromResult(Unit.Value), CancellationToken.None);

        Assert.Equal(42, command.Count);
    }

    [Fact]
    public async Task Handle_HtmlEntityEncodedString_IsStrippedToText()
    {
        var command = new TestCommand { Name = "<script>alert('xss')</script>Clean" };

        await _behavior.Handle(command, () => Task.FromResult(Unit.Value), CancellationToken.None);

        Assert.Equal("Clean", command.Name);
    }

    // Test fixtures
    public class TestCommand : IRequest<Unit>
    {
        public string? Name { get; set; }
        public int Count { get; set; }
    }

    public class TestCommandWithNested : IRequest<Unit>
    {
        public NestedObject? Nested { get; set; }
    }

    public class TestCommandWithCollection : IRequest<Unit>
    {
        public List<NestedObject> Items { get; set; } = [];
    }

    public class NestedObject
    {
        public string? Note { get; set; }
    }
}
