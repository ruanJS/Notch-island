import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import notchiImg from "@assets/notchi.png";
import SplitText from "../../components/SplitText/SplitText";

interface ScreenFrameProps {
  progress: number;
  step: number;
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
  artwork?: ReactNode;
  actions: ReactNode;
  finish?: boolean;
}

export function OnboardingFrame({
  progress,
  step,
  eyebrow,
  title,
  description,
  children,
  artwork,
  actions,
  finish = false,
}: ScreenFrameProps) {
  const reduceMotion = useReducedMotion();
  const handleAnimationComplete = () =>
    console.log("All letters have animated!");

  return (
    <div className="onboarding-shell">
      <div className="aurora aurora--one" />
      <div className="aurora aurora--two" />
      <div className="onboarding-grain" />
      <motion.main
        className={`onboarding-window ${finish ? "onboarding-window--finish" : ""}`}
        initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? undefined : { opacity: 0, y: -10, scale: 0.995 }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      >
        <header className="onboarding-header">
          <div className="brand-lockup">
            <span className="brand-mark">N</span>
            <span className="brand-word">Notch Island</span>
          </div>
          <div className="step-status">
            <span>{String(step).padStart(2, "0")}</span>
            <div className="step-status__track">
              <motion.div
                className="step-status__fill"
                animate={{ width: `${progress}%` }}
              />
            </div>
            <span>09</span>
          </div>
        </header>
        <section className="onboarding-stage">
          {!finish && (
            <aside className="onboarding-art" aria-hidden="true">
              <div className="art-grid" />
              <div className="art-glow" />
              {artwork ?? <DefaultArtwork />}
              <div className="art-caption">
                <span>always on</span>
                <span>100% local</span>
              </div>
            </aside>
          )}
          <div className="onboarding-panel">
            <motion.div
              className="onboarding-copy"
              initial={reduceMotion ? false : { opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12, duration: 0.42 }}
            >
              <span className="onboarding-tag">// {eyebrow}</span>
              <SplitText
                text={title}
                tag="h1"
                className="onboarding-title"
                delay={reduceMotion ? 0 : 28}
                duration={reduceMotion ? 0.01 : 0.48}
                ease="power3.out"
                splitType="chars"
                from={{ opacity: 0, y: 22, filter: "blur(10px)" }}
                to={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                threshold={0.1}
                rootMargin="-100px"
                textAlign={finish ? "center" : "left"}
                onLetterAnimationComplete={handleAnimationComplete}
              />
              {description && (
                <p className="onboarding-subtitle">{description}</p>
              )}
              <div className="onboarding-body">{children}</div>
            </motion.div>
            <div className="onboarding-actions">{actions}</div>
          </div>
        </section>
      </motion.main>
    </div>
  );
}

export function DefaultArtwork() {
  return (
    <div className="notchi-stage">
      <motion.div
        className="notchi-orbit"
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />
      <motion.img
        className="notchi-art"
        src={notchiImg}
        alt=""
        animate={{ y: [0, -8, 0], rotate: [0, -2, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="signal-pill signal-pill--top">
        <span /> online
      </div>
      <div className="signal-pill signal-pill--bottom">5 IAs conectadas</div>
    </div>
  );
}

export function IconCard({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      className="onboarding-card"
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
    >
      <span className="onboarding-card__icon">{icon}</span>
      <div>
        <h3 className="onboarding-card__title">{title}</h3>
        <p className="onboarding-card__desc">{children}</p>
      </div>
    </motion.div>
  );
}

export function ChoiceButton({
  active,
  onClick,
  children,
  id,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  id?: string;
}) {
  return (
    <button
      className={`option-chip ${active ? "active" : ""}`}
      onClick={onClick}
      id={id}
      type="button"
    >
      <span>{children}</span>
      {active && <Check size={14} strokeWidth={2.4} />}
    </button>
  );
}

export function BackButton({
  onClick,
  id,
  disabled = false,
}: {
  onClick: () => void;
  id?: string;
  disabled?: boolean;
}) {
  return (
    <button
      className="btn btn-ghost"
      onClick={onClick}
      id={id}
      disabled={disabled}
      type="button"
    >
      <ArrowLeft size={16} /> Voltar
    </button>
  );
}

export function NextButton({
  onClick,
  id,
  disabled = false,
  children = "Continuar",
}: {
  onClick: () => void;
  id?: string;
  disabled?: boolean;
  children?: ReactNode;
}) {
  return (
    <button
      className="btn btn-primary"
      onClick={onClick}
      id={id}
      disabled={disabled}
      type="button"
    >
      <span>{children}</span>
      <ArrowRight size={16} />
    </button>
  );
}
