import '../onboarding.css';
import { Layers3, MonitorSmartphone } from 'lucide-react';
import { BackButton, IconCard, NextButton, OnboardingFrame } from '../components/OnboardingUI';

interface Props { onNext: () => void; onBack: () => void; progress: number }

export default function WhatIsNotchlyScreen({ onNext, onBack, progress }: Props) {
  return (
    <OnboardingFrame step={2} progress={progress} eyebrow="o que é" title="Todas as suas IAs. Uma visão só." description="Uma camada leve sobre o seu desktop que reúne o essencial em tempo real." actions={<><BackButton onClick={onBack} id="btn-whatis-back" /><NextButton onClick={onNext} id="btn-whatis-next" /></>}>
      <div className="onboarding-cards">
        <IconCard icon={<MonitorSmartphone size={17} />} title="Sempre por perto">Encaixa na borda da tela sem disputar sua atenção.</IconCard>
        <IconCard icon={<Layers3 size={17} />} title="Tudo consolidado">Claude, ChatGPT, Gemini, Codex e Cursor no mesmo lugar.</IconCard>
      </div>
    </OnboardingFrame>
  );
}
