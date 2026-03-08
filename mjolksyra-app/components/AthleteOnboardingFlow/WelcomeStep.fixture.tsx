import { WelcomeStep } from "./WelcomeStep";

export default {
  NoCoachContext: () => (
    <WelcomeStep
      onNext={() => {}}
      hasCoachContext={false}
      isPaymentSetupComplete={false}
    />
  ),

  WithCoachContext: () => (
    <WelcomeStep
      onNext={() => {}}
      hasCoachContext={true}
      isPaymentSetupComplete={false}
    />
  ),

  PaymentSetupComplete: () => (
    <WelcomeStep
      onNext={() => {}}
      hasCoachContext={true}
      isPaymentSetupComplete={true}
    />
  ),
};
