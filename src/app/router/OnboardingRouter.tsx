/**
 * OnboardingRouter — fluxo de telas do onboarding.
 * README seção 7: Welcome → WhatIs → HowItWorks → ChooseProviders →
 *                 Benefits → MeetNotchi → Customize → Permissions → Finish
 */
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import WelcomeScreen from '@onboarding/screens/WelcomeScreen';
import WhatIsNotchlyScreen from '@onboarding/screens/WhatIsNotchlyScreen';
import HowItWorksScreen from '@onboarding/screens/HowItWorksScreen';
import ChooseProvidersScreen from '@onboarding/screens/ChooseProvidersScreen';
import BenefitsScreen from '@onboarding/screens/BenefitsScreen';
import MeetNotchiScreen from '@onboarding/screens/MeetNotchiScreen';
import CustomizeScreen from '@onboarding/screens/CustomizeScreen';
import PermissionsScreen from '@onboarding/screens/PermissionsScreen';
import FinishScreen from '@onboarding/screens/FinishScreen';

const STEPS = [
  'welcome',
  'what-is',
  'how-it-works',
  'choose-providers',
  'benefits',
  'meet-notchi',
  'customize',
  'permissions',
  'finish',
] as const;

type Step = typeof STEPS[number];

export default function OnboardingRouter() {
  const [step, setStep] = useState<Step>('welcome');

  const next = () => {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  };

  const back = () => {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  };

  const progress = ((STEPS.indexOf(step)) / (STEPS.length - 1)) * 100;

  const screenProps = { onNext: next, onBack: back, progress };

  const screens = {
    'welcome': <WelcomeScreen {...screenProps} />,
    'what-is': <WhatIsNotchlyScreen {...screenProps} />,
    'how-it-works': <HowItWorksScreen {...screenProps} />,
    'choose-providers': <ChooseProvidersScreen {...screenProps} />,
    'benefits': <BenefitsScreen {...screenProps} />,
    'meet-notchi': <MeetNotchiScreen {...screenProps} />,
    'customize': <CustomizeScreen {...screenProps} />,
    'permissions': <PermissionsScreen {...screenProps} />,
    'finish': <FinishScreen {...screenProps} />,
  } satisfies Record<Step, React.ReactNode>;

  return <AnimatePresence mode="wait">{<div key={step}>{screens[step]}</div>}</AnimatePresence>;
}
