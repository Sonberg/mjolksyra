using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.Onboarding.StartWithAiCoach;
using Mjolksyra.UseCases.Onboarding.UpdateTrainingProfile;

namespace Mjolksyra.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/onboarding")]
public class OnboardingController(IMediator mediator, IUserContext userContext) : Controller
{
    [HttpPost("start-with-ai-coach")]
    public async Task<ActionResult<StartWithAiCoachResponse>> StartWithAiCoach(CancellationToken cancellationToken)
    {
        if (await userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return Unauthorized();
        }

        var result = await mediator.Send(new StartWithAiCoachCommand
        {
            AthleteUserId = userId,
        }, cancellationToken);

        return Ok(result);
    }

    [HttpPut("training-profile")]
    public async Task<ActionResult<UpdateTrainingProfileResponse>> UpdateTrainingProfile(
        [FromBody] UpdateTrainingProfileRequest request,
        CancellationToken cancellationToken)
    {
        if (await userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return Unauthorized();
        }

        var result = await mediator.Send(new UpdateTrainingProfileCommand
        {
            UserId = userId,
            ExperienceLevel = request.ExperienceLevel,
            IntensityMethod = request.IntensityMethod,
            PreferredRepStyle = request.PreferredRepStyle,
            WorkoutsPerWeek = request.WorkoutsPerWeek,
            GoalSport = request.GoalSport,
            Goals = request.Goals,
            CompetitionDate = request.CompetitionDate,
            CoachNotes = request.CoachNotes,
        }, cancellationToken);

        return Ok(result);
    }
}

public class UpdateTrainingProfileRequest
{
    public ExperienceLevel ExperienceLevel { get; set; }

    public IntensityMethod IntensityMethod { get; set; }

    public RepStyle PreferredRepStyle { get; set; }

    public int WorkoutsPerWeek { get; set; }

    public ExerciseSport GoalSport { get; set; }

    public ICollection<string> Goals { get; set; } = [];

    public DateOnly? CompetitionDate { get; set; }

    public string? CoachNotes { get; set; }
}
