using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.Onboarding.UpdateTrainingProfile;

public class UpdateTrainingProfileCommand : IRequest<UpdateTrainingProfileResponse>
{
    public required Guid UserId { get; set; }

    public ExperienceLevel ExperienceLevel { get; set; }

    public IntensityMethod IntensityMethod { get; set; }

    public RepStyle PreferredRepStyle { get; set; }

    public int WorkoutsPerWeek { get; set; }

    public ExerciseSport GoalSport { get; set; }

    public ICollection<string> Goals { get; set; } = [];

    public DateOnly? CompetitionDate { get; set; }

    public string? CoachNotes { get; set; }
}

public class UpdateTrainingProfileResponse
{
    public Guid UserId { get; set; }
}

public class UpdateTrainingProfileCommandHandler(
    IUserRepository userRepository) : IRequestHandler<UpdateTrainingProfileCommand, UpdateTrainingProfileResponse>
{
    public async Task<UpdateTrainingProfileResponse> Handle(UpdateTrainingProfileCommand request, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetById(request.UserId, cancellationToken);

        user.AthleteProfile = new AthleteTrainingProfile
        {
            ExperienceLevel = request.ExperienceLevel,
            IntensityMethod = request.IntensityMethod,
            PreferredRepStyle = request.PreferredRepStyle,
            WorkoutsPerWeek = request.WorkoutsPerWeek,
            GoalSport = request.GoalSport,
            Goals = request.Goals,
            CompetitionDate = request.CompetitionDate,
            CoachNotes = request.CoachNotes,
        };

        await userRepository.Update(user, cancellationToken);

        return new UpdateTrainingProfileResponse { UserId = user.Id };
    }
}
