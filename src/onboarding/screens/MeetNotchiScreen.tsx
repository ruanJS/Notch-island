import '../onboarding.css';
import { Eye, Sparkles } from 'lucide-react';
import { BackButton, IconCard, NextButton, OnboardingFrame } from '../components/OnboardingUI';

interface Props { onNext: () => void; onBack: () => void; progress: number }

export default function MeetNotchiScreen({ onNext, onBack, progress }: Props) {
  return (
    <OnboardingFrame step={6} progress={progress} eyebrow="conheça o notchi" title="Um sinal vivo em preparação." description="Notchi está sendo preparado para reagir às cotas reais dos seus provedores sem interromper seu fluxo." actions={<><BackButton onClick={onBack} id="btn-meetnotchi-back" /><NextButton onClick={onNext} id="btn-meetnotchi-next" /></>}>
      <div className="onboarding-cards">
        <IconCard icon={<Sparkles size={17} />} title="Recurso futuro">O mascote será conectado aos dados reais antes de ser ativado.</IconCard>
        <IconCard icon={<Eye size={17} />} title="Atenção sutil">A proposta é avisar sem interromper o que você está fazendo.</IconCard>
      </div>
    </OnboardingFrame>
  );
}
