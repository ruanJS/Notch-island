import '../onboarding.css';
import { BellRing, Gauge, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { BackButton, IconCard, NextButton, OnboardingFrame } from '../components/OnboardingUI';

interface Props { onNext: () => void; onBack: () => void; progress: number }

export default function BenefitsScreen({ onNext, onBack, progress }: Props) {
  return (
    <OnboardingFrame step={5} progress={progress} eyebrow="por que Notch Island" title="Controle sem interromper seu trabalho." description="Antecipe limites e use cada ferramenta com mais intenção." actions={<><BackButton onClick={onBack} id="btn-benefits-back" /><NextButton onClick={onNext} id="btn-benefits-next" /></>}>
      <div className="onboarding-cards">
        <IconCard icon={<BellRing size={17} />} title="Alertas preventivos">Saiba antes de chegar ao limite crítico.</IconCard>
        <IconCard icon={<ShieldCheck size={17} />} title="Local e privado">Credenciais e dados permanecem na máquina.</IconCard>
        <IconCard icon={<Gauge size={17} />} title="Leve por natureza">Baixo consumo de CPU e memória.</IconCard>
        <IconCard icon={<SlidersHorizontal size={17} />} title="Do seu jeito">Tamanho, posição e comportamento ajustáveis.</IconCard>
      </div>
    </OnboardingFrame>
  );
}
