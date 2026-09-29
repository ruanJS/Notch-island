import '../onboarding.css';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '@app/store';
import onboardingService from '../services/onboardingService';
import { BackButton, NextButton, OnboardingFrame } from '../components/OnboardingUI';

interface Props { onNext: () => void; onBack: () => void; progress: number }

export default function FinishScreen({ onBack, progress }: Props) {
  const [loading, setLoading] = useState(false);
  const { setHasCompletedOnboarding } = useAppStore();
  const handleFinish = async () => { setLoading(true); try { await onboardingService.complete(); setHasCompletedOnboarding(true); } finally { setLoading(false); } };
  return (
    <OnboardingFrame finish step={9} progress={progress} eyebrow="configuração concluída" title="Pronto. Agora é só continuar criando." description="O Notch Island está configurado e vai acompanhar seu uso diretamente no desktop." actions={<><BackButton onClick={onBack} id="btn-finish-back" disabled={loading} /><NextButton onClick={handleFinish} id="btn-finish-complete" disabled={loading}>{loading ? 'Iniciando' : 'Abrir Notch Island'}</NextButton></>}>
      <div className="finish-mark"><Check size={30} strokeWidth={2.2} /></div>
      <p className="onboarding-complement">Configurações futuras ficam disponíveis pelo ícone do Notch Island na bandeja do sistema.</p>
    </OnboardingFrame>
  );
}
