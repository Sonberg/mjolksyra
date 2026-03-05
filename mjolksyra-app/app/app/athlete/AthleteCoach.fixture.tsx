import { UserTrainee } from "@/services/users/type";
import { AthleteCoach } from "./AthleteCoach";

const coach: UserTrainee = {
  traineeId: "t1",
  givenName: "Per",
  familyName: "Sonberg",
  status: "Active",
};

export default {
  Selected: () => (
    <AthleteCoach
      coach={coach}
      isSelected={true}
      href="/app/athlete/coaches/t1"
      onSelect={() => {}}
    />
  ),

  NotSelected: () => (
    <AthleteCoach
      coach={coach}
      isSelected={false}
      href="/app/athlete/coaches/t1"
      onSelect={() => {}}
    />
  ),
};
