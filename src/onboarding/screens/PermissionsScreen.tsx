import "../onboarding.css";
import { BellRing, Power } from "lucide-react";
import { useState } from "react";
import systemService from "@shared/services/systemService";
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

export default function PermissionsScreen({ onNext, onBack, progress }: Props) {
  const [autostart, setAutostart] = useState(true);
  const [saving, setSaving] = useState(false);
  const handleNext = async () => {
    setSaving(true);
    try {
      if (autostart) await systemService.enableStartup();
      else await systemService.disableStartup();
      onNext();
    } finally {
      setSaving(false);
    }
  };
  return (
    <OnboardingFrame
      step={8}
      progress={progress}
      eyebrow="comportamento"
      title="Presente quando importa. Silencioso no resto."
      description="Defina como o Notch Island deve se comportar no Windows."
      actions={
        <>
          <BackButton
            onClick={onBack}
            id="btn-permissions-back"
            disabled={saving}
          />
          <NextButton
            onClick={handleNext}
            id="btn-permissions-next"
            disabled={saving}
          >
            {saving ? "Salvando" : "Continuar"}
          </NextButton>
        </>
      }
    >
      <div className="permissions-list">
        <div className="permission-item">
          <span className="permission-item__icon">
            <Power size={17} />
          </span>
          <div className="permission-item__content">
            <h4 className="permission-item__title">Iniciar com o Windows</h4>
            <p className="permission-item__desc">
              Abra discretamente ao ligar o computador.
            </p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={autostart}
              onChange={(event) => setAutostart(event.target.checked)}
              id="checkbox-autostart"
            />
            <span className="switch__track" />
          </label>
        </div>
        <div className="permission-item">
          <span className="permission-item__icon">
            <BellRing size={17} />
          </span>
          <div className="permission-item__content">
            <h4 className="permission-item__title">Notificações nativas</h4>
            <p className="permission-item__desc">
              Alertas pontuais para limites e renovações.
            </p>
          </div>
        </div>
      </div>
    </OnboardingFrame>
  );
}
