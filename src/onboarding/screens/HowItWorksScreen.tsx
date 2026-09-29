import '../onboarding.css';
import { BackButton, NextButton, OnboardingFrame } from '../components/OnboardingUI';
import { ClaudeIcon, CursorIcon, OpenaiIcon } from '@shared/components/AIIcons';

interface Props { onNext: () => void; onBack: () => void; progress: number }
const usage = [
  { name: 'Claude', value: 48, icon: ClaudeIcon },
  { name: 'ChatGPT', value: 72, icon: OpenaiIcon },
  { name: 'Cursor', value: 24, icon: CursorIcon },
];

export default function HowItWorksScreen({ onNext, onBack, progress }: Props) {
  return (
    <OnboardingFrame step={3} progress={progress} eyebrow="como funciona" title="Veja o essencial. Siga criando." description="Passe o mouse sobre o widget para revelar detalhes de tokens, custo estimado e tempo até o reset." actions={<><BackButton onClick={onBack} id="btn-howitworks-back" /><NextButton onClick={onNext} id="btn-howitworks-next" /></>}>
      <div className="usage-demo">
        {usage.map(({ name, value, icon: Icon }) => <div className="usage-demo__row" key={name}><span className="usage-demo__provider"><Icon size={15} aria-hidden="true" />{name}</span><div className="usage-demo__bar"><span style={{ width: `${value}%` }} /></div><strong>{value}%</strong></div>)}
      </div>
      <p className="onboarding-complement" style={{ marginTop: 12 }}>Arraste para qualquer borda. O Notch Island encontra o melhor encaixe.</p>
    </OnboardingFrame>
  );
}
