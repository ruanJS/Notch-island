import "../onboarding.css";
import { Check } from "lucide-react";
import { useAppStore } from "@app/store";
import {
  ClaudeIcon,
  CursorIcon,
  GeminiIcon,
  OpenaiCodexAppIcon,
  OpenaiIcon,
} from "@shared/components/AIIcons";
import {
  BackButton,
  NextButton,
  OnboardingFrame,
} from "../components/OnboardingUI";

interface Props {
  onNext: () => void;
  onBack: () => void;
  progress: number;
}
const providers = [
  { id: "claude", name: "Claude", icon: ClaudeIcon },
  { id: "chatgpt", name: "ChatGPT", icon: OpenaiIcon },
  { id: "gemini", name: "Gemini", icon: GeminiIcon },
  { id: "codex", name: "Codex", icon: OpenaiCodexAppIcon },
  { id: "cursor", name: "Cursor", icon: CursorIcon },
];

export default function ChooseProvidersScreen({
  onNext,
  onBack,
  progress,
}: Props) {
  const { selectedProviderIds, setSelectedProviderIds } = useAppStore();
  const toggle = (id: string) =>
    setSelectedProviderIds(
      selectedProviderIds.includes(id)
        ? selectedProviderIds.filter((item) => item !== id)
        : [...selectedProviderIds, id],
    );
  return (
    <OnboardingFrame
      step={4}
      progress={progress}
      eyebrow="suas ferramentas"
      title="O que faz parte do seu fluxo?"
      description="Selecione as IAs que deseja acompanhar. Você poderá mudar isso depois."
      actions={
        <>
          <BackButton onClick={onBack} id="btn-providers-back" />
          <NextButton
            onClick={onNext}
            id="btn-providers-next"
            disabled={!selectedProviderIds.length}
          >{`Continuar · ${selectedProviderIds.length}`}</NextButton>
        </>
      }
    >
      <div className="provider-list">
        {providers.map((provider) => {
          const selected = selectedProviderIds.includes(provider.id);
          const Icon = provider.icon;
          return (
            <button
              type="button"
              key={provider.id}
              className={`provider-item ${selected ? "selected" : ""}`}
              onClick={() => toggle(provider.id)}
            >
              <span className="provider-item__icon">
                <Icon size={18} aria-hidden="true" />
              </span>
              <span className="provider-item__name">{provider.name}</span>
              <Check className="provider-item__check" size={14} />
            </button>
          );
        })}
      </div>
    </OnboardingFrame>
  );
}
