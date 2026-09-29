import '../onboarding.css';
import { OnboardingFrame, NextButton } from '../components/OnboardingUI';

interface Props { onNext: () => void; onBack: () => void; progress: number }

export default function WelcomeScreen({ onNext, progress }: Props) {
  return (
    <OnboardingFrame step={1} progress={progress} eyebrow="Tenha uma visão clara do seu uso de IA." title="Clareza para usar IA sem perder o ritmo." description="O Notch Island acompanha consumo, limites e resets das ferramentas que fazem parte do seu dia sem mais uma aba aberta." actions={<NextButton onClick={onNext} id="btn-welcome-start">Começar agora</NextButton>}>
      <p className="onboarding-complement">Discreto quando você está focado. Presente quando você precisa decidir.</p>
    </OnboardingFrame>
  );
}
