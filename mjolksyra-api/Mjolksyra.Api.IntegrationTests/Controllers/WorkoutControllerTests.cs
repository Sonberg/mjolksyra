using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Mjolksyra.Api.Controllers;
using Mjolksyra.UseCases.CompletedWorkouts;
using Mjolksyra.UseCases.CompletedWorkouts.AddCompletedWorkoutChatMessage;
using Mjolksyra.UseCases.CompletedWorkouts.AnalyzeCompletedWorkoutMedia;
using Mjolksyra.UseCases.CompletedWorkouts.CreateCompletedWorkout;
using Mjolksyra.UseCases.CompletedWorkouts.GetCompletedWorkoutChatMessages;
using Mjolksyra.UseCases.CompletedWorkouts.GetLatestCompletedWorkoutMediaAnalysis;
using Mjolksyra.UseCases.CompletedWorkouts.LogWorkoutSession;
using Mjolksyra.UseCases.CompletedWorkouts.UpdateCompletedWorkoutChatMessage;
using OneOf;

namespace Mjolksyra.Api.IntegrationTests.Controllers;

public class WorkoutControllerTests
{
    private readonly Guid _traineeId = Guid.NewGuid();
    private readonly Guid _userId = Guid.NewGuid();
    private readonly Mock<IMediator> _mediator = new();
    private readonly WorkoutController _sut;

    public WorkoutControllerTests()
    {
        _sut = new WorkoutController(_mediator.Object);
    }

    [Fact]
    public async Task GetChatMessages_ReturnsOk()
    {
        _mediator.Setup(x => x.Send(It.IsAny<GetCompletedWorkoutChatMessagesRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<CompletedWorkoutChatMessageResponse>());

        var result = await _sut.GetChatMessages(_traineeId, Guid.NewGuid(), CancellationToken.None);

        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task AddChatMessage_ReturnsOk()
    {
        _mediator.Setup(x => x.Send(It.IsAny<AddCompletedWorkoutChatMessageCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new CompletedWorkoutChatMessageResponse
            {
                Id = Guid.NewGuid(),
                UserId = _userId,
                Message = "Hello",
                Role = Domain.Database.Models.CompletedWorkoutChatRole.Coach,
                CreatedAt = DateTimeOffset.UtcNow,
                ModifiedAt = DateTimeOffset.UtcNow,
            });

        var result = await _sut.AddChatMessage(
            _traineeId,
            Guid.NewGuid(),
            new CompletedWorkoutChatMessageRequest { Message = "Hello", MediaUrls = [] },
            CancellationToken.None);

        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task UpdateChatMessage_ReturnsOk()
    {
        _mediator.Setup(x => x.Send(It.IsAny<UpdateCompletedWorkoutChatMessageCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new CompletedWorkoutChatMessageResponse
            {
                Id = Guid.NewGuid(),
                UserId = _userId,
                Message = "Updated",
                Role = Domain.Database.Models.CompletedWorkoutChatRole.Coach,
                CreatedAt = DateTimeOffset.UtcNow,
                ModifiedAt = DateTimeOffset.UtcNow,
            });

        var result = await _sut.UpdateChatMessage(
            _traineeId,
            Guid.NewGuid(),
            Guid.NewGuid(),
            new CompletedWorkoutChatMessageEditRequest { Message = "Updated" },
            CancellationToken.None);

        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task Analyze_WhenSuccessful_ReturnsOk()
    {
        _mediator.Setup(x => x.Send(It.IsAny<AnalyzeCompletedWorkoutMediaCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(OneOf<CompletedWorkoutMediaAnalysisResponse, AnalyzeCompletedWorkoutMediaForbidden, AnalyzeCompletedWorkoutMediaInsufficientCredits>.FromT0(
                new CompletedWorkoutMediaAnalysisResponse
                {
                    Summary = "Strong session.",
                    KeyFindings = [],
                    TechniqueRisks = [],
                    CoachSuggestions = [],
                    CreatedAt = DateTimeOffset.UtcNow,
                }));

        var result = await _sut.Analyze(
            _traineeId,
            Guid.NewGuid(),
            new CompletedWorkoutMediaAnalysisRequest { Text = "Analyze this session" },
            CancellationToken.None);

        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task Analyze_WhenCreditsAreInsufficient_ReturnsUnprocessableEntity()
    {
        _mediator.Setup(x => x.Send(It.IsAny<AnalyzeCompletedWorkoutMediaCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(OneOf<CompletedWorkoutMediaAnalysisResponse, AnalyzeCompletedWorkoutMediaForbidden, AnalyzeCompletedWorkoutMediaInsufficientCredits>.FromT2(
                new AnalyzeCompletedWorkoutMediaInsufficientCredits("Insufficient credits.")));

        var result = await _sut.Analyze(
            _traineeId,
            Guid.NewGuid(),
            new CompletedWorkoutMediaAnalysisRequest { Text = "Analyze this session" },
            CancellationToken.None);

        Assert.IsType<UnprocessableEntityObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetLatestAnalysis_ReturnsOk()
    {
        _mediator.Setup(x => x.Send(It.IsAny<GetLatestCompletedWorkoutMediaAnalysisRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new CompletedWorkoutMediaAnalysisResponse
            {
                Summary = "Strong session.",
                KeyFindings = [],
                TechniqueRisks = [],
                CoachSuggestions = [],
                CreatedAt = DateTimeOffset.UtcNow,
            });

        var result = await _sut.GetLatestAnalysis(_traineeId, Guid.NewGuid(), CancellationToken.None);

        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task CreateAdHocWorkout_ReturnsOk()
    {
        _mediator.Setup(x => x.Send(It.IsAny<CreateCompletedWorkoutCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new CompletedWorkoutResponse
            {
                Id = Guid.NewGuid(),
                TraineeId = _traineeId,
                PlannedWorkoutId = null,
                Exercises = [],
                Media = [],
                PlannedAt = DateOnly.FromDateTime(DateTime.UtcNow),
                CreatedAt = DateTimeOffset.UtcNow,
            });

        var result = await _sut.CreateAdHocWorkout(
            _traineeId,
            new CreateCompletedWorkoutRequest
            {
                PlannedAt = DateOnly.FromDateTime(DateTime.UtcNow),
            },
            CancellationToken.None);

        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task LogSession_ReturnsOk()
    {
        _mediator.Setup(x => x.Send(It.IsAny<LogWorkoutSessionCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new CompletedWorkoutResponse
            {
                Id = Guid.NewGuid(),
                TraineeId = _traineeId,
                PlannedWorkoutId = Guid.NewGuid(),
                Exercises = [],
                Media = [],
                PlannedAt = DateOnly.FromDateTime(DateTime.UtcNow),
                CreatedAt = DateTimeOffset.UtcNow,
            });

        var result = await _sut.LogSession(
            _traineeId,
            Guid.NewGuid(),
            new LogWorkoutSessionRequest { Exercises = [] },
            CancellationToken.None);

        Assert.IsType<OkObjectResult>(result.Result);
    }
}
