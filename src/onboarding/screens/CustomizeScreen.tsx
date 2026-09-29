import '../onboarding.css';
import { useAppStore, type GlassStyle, type ThemePreset } from '@app/store';
import { BackButton, ChoiceButton, NextButton, OnboardingFrame } from '../components/OnboardingUI';

interface Props { onNext: () => void; onBack: () => void; progress: number }

export default function CustomizeScreen({ onNext, onBack, progress }: Props) {
  const { themePreset, glassStyle, setThemePreset, setGlassStyle } = useAppStore();
  const themes: Array<[ThemePreset, string]> = [['obsidian','Obsidian'],['midnight','Midnight'],['emerald','Emerald']];
  const surfaces: Array<[GlassStyle, string]> = [['solid','Sólida'],['translucent','Translúcida'],['glass','Glass blur']];
  return (
    <OnboardingFrame step={7} progress={progress} eyebrow="personalização" title="Faça o Notch Island caber no seu ritmo." description="Escolha um ponto de partida. Tudo continua ajustável nas configurações." actions={<><BackButton onClick={onBack} id="btn-customize-back" /><NextButton onClick={onNext} id="btn-customize-next" /></>}>
      <div className="customize-stack">
        <ChoiceGroup label="tema" options={themes} value={themePreset} onChange={setThemePreset} prefix="theme" />
        <ChoiceGroup label="superfície" options={surfaces} value={glassStyle} onChange={setGlassStyle} prefix="surface" />
      </div>
    </OnboardingFrame>
  );
}

function ChoiceGroup<T extends string>({ label, options, value, onChange, prefix }: { label: string; options: Array<[T,string]>; value: T; onChange: (value: T) => void; prefix: string }) {
  return <div className="customize-section"><span className="customize-section__label">{label}</span><div className="option-chips">{options.map(([key,text]) => <ChoiceButton key={key} active={value === key} onClick={() => onChange(key)} id={`btn-${prefix}-${key}`}>{text}</ChoiceButton>)}</div></div>;
}
