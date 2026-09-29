import "../settings.css";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  ChevronRight,
  CircleUserRound,
  Columns,
  Cpu,
  Info,
  Layers,
  Monitor,
  RotateCcw,
  Rows,
  Sparkles,
  X,
} from "lucide-react";
import {
  useAppStore,
  type FontFamily,
  type GlassStyle,
  type OrientationMode,
  type ThemePreset,
} from "@app/store";
import notchiImage from "@assets/notchi.png";
import appearanceIcon from "@assets/settings/applepencil.hover.svg";
import providersIcon from "@assets/settings/bolt.fill.svg";
import settingsIcon from "@assets/settings/gearshape.fill.svg";
import barIcon from "@assets/settings/inset.filled.rectangle.on.rectangle.svg";
import notchiIcon from "@assets/settings/pawprint.fill.svg";
import accountIcon from "@assets/settings/person.fill.svg";
import exitIcon from "@assets/settings/rectangle.portrait.and.arrow.right.svg";
import positionIcon from "@assets/settings/slider.horizontal.3.svg";
import { providerService } from "@providers/services/providerService";
import { ProviderIcon } from "@shared/components/AIIcons";
import widgetService, {
  type NotchPlacement,
} from "@widget/services/widgetService";
import settingsService from "../services/settingsService";

const brandIcon = "/notchi-icon.png";

type SettingsTab =
  | "bar"
  | "appearance"
  | "position"
  | "notchi"
  | "providers"
  | "account"
  | "settings"
  | "about";

const NAV_ITEMS: Array<{
  key: SettingsTab;
  label: string;
  icon?: string;
  description: string;
}> = [
  {
    key: "bar",
    label: "Barra do notch",
    icon: barIcon,
    description: "Tamanho e interação da barra",
  },
  {
    key: "appearance",
    label: "Tema & Aparência",
    icon: appearanceIcon,
    description: "Tema, superfície e acabamento visual",
  },
  {
    key: "position",
    label: "Posição do notch",
    icon: positionIcon,
    description: "Escolha onde a ilha fica na tela",
  },
  {
    key: "notchi",
    label: "Mascote Notchi",
    icon: notchiIcon,
    description: "Presença e reações do seu mascote",
  },
  {
    key: "providers",
    label: "Provedores",
    icon: providersIcon,
    description: "Serviços exibidos na sua ilha",
  },
  {
    key: "account",
    label: "Conta",
    icon: accountIcon,
    description: "Identidade e modo local",
  },
  {
    key: "settings",
    label: "Configurações",
    icon: settingsIcon,
    description: "Preferências gerais do aplicativo",
  },
  { key: "about", label: "Sobre", description: "Informações do Notch Island" },
];

const PLACEMENTS: Array<{ key: NotchPlacement; label: string; short: string }> =
  [
    { key: "TOP_CENTER", label: "Superior central", short: "↑" },
    { key: "LEFT_CENTER", label: "Lateral esquerda", short: "←" },
    { key: "RIGHT_CENTER", label: "Lateral direita", short: "→" },
    { key: "BOTTOM_CENTER", label: "Inferior central", short: "↓" },
  ];

export default function SettingsRoot() {
  const reduceMotion = useReducedMotion();
  const [tab, setTab] = useState<SettingsTab>("bar");
  const [placement, setPlacement] = useState<NotchPlacement>("RIGHT_CENTER");
  const [placementBusy, setPlacementBusy] = useState(false);
  const {
    orientationMode,
    setOrientationMode,
    glassStyle,
    setGlassStyle,
    themePreset,
    setThemePreset,
    fontFamily,
    setFontFamily,
    selectedProviderIds,
    setSelectedProviderIds,
    customRingColors,
    setCustomRingColor,
    resetCustomRingColors,
  } = useAppStore();
  const allProviders = providerService.getProviders();
  const activeNav = NAV_ITEMS.find((item) => item.key === tab)!;

  useEffect(() => {
    if (tab !== "position") return;
    widgetService
      .getPosition()
      .then((value) => setPlacement(value.placement))
      .catch(() => undefined);
  }, [tab]);

  const handleClose = () => {
    settingsService
      .closeSettings()
      .catch((error) =>
        console.warn("Could not close settings window:", error),
      );
  };

  const handlePlacement = async (value: NotchPlacement) => {
    setPlacementBusy(true);
    try {
      const next = await widgetService.setPlacement(value);
      setPlacement(next.placement);
    } finally {
      setPlacementBusy(false);
    }
  };

  const toggleProvider = (id: string) => {
    if (selectedProviderIds.includes(id)) {
      if (selectedProviderIds.length > 1)
        setSelectedProviderIds(
          selectedProviderIds.filter((providerId) => providerId !== id),
        );
      return;
    }
    setSelectedProviderIds([...selectedProviderIds, id]);
  };

  return (
    <div
      className={`settings-window settings-theme--${themePreset} settings-surface--${glassStyle} settings-font--${fontFamily}`}
    >
      <div className="settings-shell">
        <div
          className="settings-drag-region"
          data-tauri-drag-region
          aria-hidden="true"
        />
        <motion.aside
          className="settings-sidebar"
          initial={reduceMotion ? false : { opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="settings-sidebar__brand">
            <span className="settings-brand-icon">
              <img src={brandIcon} alt="" />
            </span>
            <span className="settings-sidebar__title">Notch Island</span>
          </div>

          <nav className="settings-nav" aria-label="Seções de configurações">
            {NAV_ITEMS.map(({ key, label, icon }) => (
              <motion.button
                key={key}
                className={`settings-nav__item ${tab === key ? "active" : ""}`}
                onClick={() => setTab(key)}
                id={`tab-btn-${key}`}
                type="button"
                aria-current={tab === key ? "page" : undefined}
                whileHover={reduceMotion ? undefined : { x: 2 }}
                whileTap={reduceMotion ? undefined : { scale: 0.985 }}
              >
                {tab === key && (
                  <motion.span
                    className="settings-nav__active"
                    layoutId="settings-nav-active"
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
                {icon ? (
                  <img className="settings-nav__asset" src={icon} alt="" />
                ) : (
                  <span className="settings-nav__icon settings-nav__icon--silver">
                    <Info size={12} strokeWidth={2.2} />
                  </span>
                )}
                <span>{label}</span>
                {tab === key && (
                  <ChevronRight className="settings-nav__chevron" size={13} />
                )}
              </motion.button>
            ))}
          </nav>

          <div className="settings-sidebar__footer">
            <button
              className="settings-exit-btn"
              onClick={handleClose}
              id="btn-close-settings"
              type="button"
            >
              <img className="settings-nav__asset" src={exitIcon} alt="" />
              <span>Sair Notch Island</span>
            </button>
            <span className="settings-copyright">
              © 2026 Notch Island. Todos os direitos reservados.
            </span>
          </div>
        </motion.aside>

        <main className="settings-content">
          <button
            className="settings-window-close"
            onClick={handleClose}
            type="button"
            aria-label="Fechar configurações"
          >
            <X size={25} strokeWidth={1.6} />
          </button>
          <header className="settings-content-header">
            <span className="settings-eyebrow">
              CONFIGURAÇÕES / {activeNav.label.toUpperCase()}
            </span>
            <h1>{activeNav.label}</h1>
            <p>{activeNav.description}</p>
          </header>

          <AnimatePresence mode="wait" initial={false}>
            <motion.section
              className="settings-tab-body"
              key={tab}
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
              transition={{
                duration: reduceMotion ? 0 : 0.26,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {tab === "bar" && (
                <SettingsGroup>
                  <div className="bar-overview-card">
                    <div className="bar-overview-card__hero">
                      <span className="content-icon content-icon--blue">
                        <img src={barIcon} alt="" />
                      </span>
                      <div>
                        <span className="settings-eyebrow">
                          CONFIGURAÇÃO ATUAL
                        </span>
                        <h2>Uma ilha, no tamanho certo.</h2>
                        <p>
                          O tamanho padrão é o layout atual do widget e foi
                          otimizado para preservar leitura, animação e área
                          útil.
                        </p>
                      </div>
                      <span className="current-pill">
                        <Check size={13} /> Padrão
                      </span>
                    </div>
                    <div className="bar-overview-card__metrics">
                      <div>
                        <strong>{selectedProviderIds.length}</strong>
                        <span>provedores visíveis</span>
                      </div>
                      <div>
                        <strong>Hover + clique</strong>
                        <span>interações disponíveis</span>
                      </div>
                      <div>
                        <strong>Adaptável</strong>
                        <span>vertical ou horizontal</span>
                      </div>
                    </div>
                  </div>
                  <InfoCard
                    icon={<Info size={17} />}
                    title="Tamanho único por enquanto"
                    description="Compacta e expandida foram removidas porque ainda não existiam no widget. Quando houver layouts reais adicionais, eles poderão voltar como opções."
                  />
                </SettingsGroup>
              )}

              {tab === "appearance" && (
                <SettingsGroup>
                  <ChoiceSection
                    title="Tema"
                    description="Define a paleta da ilha e deste painel."
                  >
                    <ChoiceGrid
                      value={themePreset}
                      onChange={(value) => setThemePreset(value as ThemePreset)}
                      options={[
                        {
                          value: "obsidian",
                          label: "Obsidian",
                          detail: "Preto profundo",
                          swatch: "#09090b",
                        },
                        {
                          value: "midnight",
                          label: "Midnight",
                          detail: "Azul noturno",
                          swatch: "#10172a",
                        },
                        {
                          value: "cyberpunk",
                          label: "Cyberpunk",
                          detail: "Violeta elétrico",
                          swatch: "#281045",
                        },
                        {
                          value: "emerald",
                          label: "Emerald",
                          detail: "Verde escuro",
                          swatch: "#0c2c25",
                        },
                        {
                          value: "amber",
                          label: "Amber",
                          detail: "Âmbar quente",
                          swatch: "#30200c",
                        },
                      ]}
                    />
                  </ChoiceSection>
                  <ChoiceSection
                    title="Superfície"
                    description="Ajusta densidade, transparência e desfoque em tempo real."
                  >
                    <ChoiceGrid
                      value={glassStyle}
                      onChange={(value) => setGlassStyle(value as GlassStyle)}
                      options={[
                        {
                          value: "solid",
                          label: "Sólida",
                          detail: "Contraste máximo",
                          icon: <Layers size={15} />,
                        },
                        {
                          value: "translucent",
                          label: "Translúcida",
                          detail: "Leve transparência",
                          icon: <Monitor size={15} />,
                        },
                        {
                          value: "glass",
                          label: "Glass blur",
                          detail: "Desfoque do fundo",
                          icon: <Sparkles size={15} />,
                        },
                      ]}
                    />
                  </ChoiceSection>
                  <ChoiceSection
                    title="Tipografia"
                    description="Aplica a família tipográfica ao painel e ao widget."
                  >
                    <ChoiceGrid
                      value={fontFamily}
                      onChange={(value) => setFontFamily(value as FontFamily)}
                      options={[
                        {
                          value: "inter",
                          label: "Inter",
                          detail: "Limpa e neutra",
                          sample: "Aa",
                        },
                        {
                          value: "jetbrains",
                          label: "JetBrains",
                          detail: "Técnica e precisa",
                          sample: "Aa",
                        },
                        {
                          value: "outfit",
                          label: "Outfit",
                          detail: "Geométrica",
                          sample: "Aa",
                        },
                        {
                          value: "jakarta",
                          label: "Jakarta",
                          detail: "Contemporânea",
                          sample: "Aa",
                        },
                      ]}
                    />
                  </ChoiceSection>
                </SettingsGroup>
              )}

              {tab === "position" && (
                <SettingsGroup>
                  <SettingsRow
                    title="Orientação"
                    description="A ilha se adapta à borda selecionada."
                  >
                    <OptionList
                      value={orientationMode}
                      onChange={(value) =>
                        setOrientationMode(value as OrientationMode)
                      }
                      options={[
                        { value: "auto", label: "Automática", icon: Sparkles },
                        { value: "vertical", label: "Vertical", icon: Columns },
                        {
                          value: "horizontal",
                          label: "Horizontal",
                          icon: Rows,
                        },
                      ]}
                    />
                  </SettingsRow>
                  <div className="settings-card">
                    <div className="settings-card__heading">
                      <div>
                        <h2>Posição na tela</h2>
                        <p>A mudança é aplicada imediatamente ao widget.</p>
                      </div>
                      <span className="settings-status">
                        <span /> Ativo
                      </span>
                    </div>
                    <div className="placement-grid" aria-busy={placementBusy}>
                      {PLACEMENTS.map((item) => (
                        <button
                          type="button"
                          key={item.key}
                          className={`placement-option ${placement === item.key ? "active" : ""}`}
                          onClick={() => void handlePlacement(item.key)}
                          disabled={placementBusy}
                        >
                          <span className="placement-option__arrow">
                            {item.short}
                          </span>
                          <span>{item.label}</span>
                          {placement === item.key && <Check size={13} />}
                        </button>
                      ))}
                    </div>
                  </div>
                </SettingsGroup>
              )}

              {tab === "notchi" && (
                <SettingsGroup>
                  <div className="notchi-card">
                    <div className="notchi-card__art">
                      <img src={notchiImage} alt="Mascote Notchi" />
                    </div>
                    <div className="notchi-card__copy">
                      <span>EM PREPARAÇÃO</span>
                      <h2>Notchi está chegando à sua ilha.</h2>
                      <p>
                        As reações do mascote ainda não fazem parte do widget
                        atual. Esta tela agora apresenta o recurso sem oferecer
                        um controle que não teria efeito.
                      </p>
                    </div>
                    <span className="coming-soon-pill">Em breve</span>
                  </div>
                  <InfoCard
                    icon={<Sparkles size={17} />}
                    title="Próxima evolução"
                    description="O mascote será conectado aos limites reais dos provedores antes de receber opções de ativação e personalização."
                  />
                </SettingsGroup>
              )}

              {tab === "providers" && (
                <SettingsGroup>
                  <div className="settings-section-lead">
                    <p>
                      Selecione quais serviços aparecem na ilha e personalize a
                      cor de cada medidor.
                    </p>
                    <button type="button" onClick={resetCustomRingColors}>
                      <RotateCcw size={13} /> Restaurar cores
                    </button>
                  </div>
                  <div className="settings-providers-grid">
                    {allProviders.map((provider) => {
                      const selected = selectedProviderIds.includes(
                        provider.id,
                      );
                      const color =
                        customRingColors[provider.id] ||
                        provider.color ||
                        "#8f7cff";
                      return (
                        <div
                          key={provider.id}
                          className={`settings-provider-card ${selected ? "selected" : ""}`}
                        >
                          <button
                            type="button"
                            className="settings-provider-card__main"
                            onClick={() => toggleProvider(provider.id)}
                          >
                            <span className="settings-provider-card__icon">
                              <ProviderIcon
                                id={provider.id}
                                size={20}
                                color={color}
                              />
                            </span>
                            <span className="settings-provider-card__copy">
                              <strong>{provider.name}</strong>
                              <small>
                                {selected ? "Visível na ilha" : "Oculto"}
                              </small>
                            </span>
                            <span
                              className={`provider-check ${selected ? "active" : ""}`}
                            >
                              {selected && <Check size={13} />}
                            </span>
                          </button>
                          <label
                            className="provider-color"
                            title={`Cor de ${provider.name}`}
                          >
                            <input
                              type="color"
                              value={color}
                              onChange={(event) =>
                                setCustomRingColor(
                                  provider.id,
                                  event.target.value,
                                )
                              }
                            />
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </SettingsGroup>
              )}

              {tab === "account" && (
                <SettingsGroup>
                  <div className="account-card">
                    <span className="account-card__avatar">
                      <CircleUserRound size={26} />
                    </span>
                    <div>
                      <span className="settings-eyebrow">PERFIL ATUAL</span>
                      <h2>Modo local</h2>
                      <p>Suas preferências permanecem neste dispositivo.</p>
                    </div>
                    <span className="settings-status">
                      <span /> Local
                    </span>
                  </div>
                  <InfoCard
                    icon={<Info size={17} />}
                    title="Conta opcional"
                    description="O Notch Island funciona localmente e não exige login para monitorar os provedores configurados."
                  />
                </SettingsGroup>
              )}

              {tab === "settings" && (
                <SettingsGroup>
                  <InfoCard
                    icon={<Layers size={17} />}
                    title="Preferências locais"
                    description="As configurações visuais e de posicionamento são mantidas no aplicativo e restauradas ao abrir o Notch Island."
                  />
                  <InfoCard
                    icon={<Monitor size={17} />}
                    title="Interação do painel"
                    description="O widget aceita hover para consulta rápida e clique para manter um provedor selecionado. Esse comportamento é nativo e não exige configuração."
                  />
                </SettingsGroup>
              )}

              {tab === "about" && (
                <SettingsGroup>
                  <div className="about-card">
                    <span className="settings-brand-icon settings-brand-icon--large">
                      <img src={brandIcon} alt="" />
                    </span>
                    <div>
                      <span className="settings-eyebrow">
                        AI USAGE COMPANION
                      </span>
                      <h2>Notch Island</h2>
                      <p>
                        Visibilidade do seu consumo de IA, direto no desktop.
                      </p>
                    </div>
                    <span className="about-card__version">v0.1.0</span>
                  </div>
                  <InfoCard
                    icon={<Cpu size={17} />}
                    title="Tecnologia"
                    description="Tauri · React · TypeScript · Zustand"
                  />
                </SettingsGroup>
              )}
            </motion.section>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function SettingsGroup({ children }: { children: ReactNode }) {
  return <div className="settings-group">{children}</div>;
}
function SettingsRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      className="settings-row"
      whileHover={{ y: -1 }}
      transition={{ duration: 0.18 }}
    >
      <div className="settings-row__info">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="settings-row__controls">{children}</div>
    </motion.div>
  );
}
function OptionList({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; icon: typeof Monitor }>;
}) {
  return (
    <div className="option-list">
      {options.map(({ value: optionValue, label, icon: Icon }) => (
        <button
          key={optionValue}
          type="button"
          className={`option-chip ${value === optionValue ? "active" : ""}`}
          onClick={() => onChange(optionValue)}
        >
          <Icon size={13} />
          <span>{label}</span>
          {value === optionValue && <Check size={12} />}
        </button>
      ))}
    </div>
  );
}
function ChoiceSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      className="choice-section"
      whileHover={{ y: -1 }}
      transition={{ duration: 0.18 }}
    >
      <div className="choice-section__heading">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {children}
    </motion.div>
  );
}
function ChoiceGrid({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
    detail: string;
    swatch?: string;
    icon?: ReactNode;
    sample?: string;
  }>;
}) {
  return (
    <div className="choice-grid">
      {options.map((option) => (
        <motion.button
          key={option.value}
          type="button"
          className={`choice-card ${option.swatch ? "choice-card--theme" : option.sample ? `choice-card--font choice-card--font-${option.value}` : "choice-card--surface"} ${value === option.value ? "active" : ""}`}
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.985 }}
          transition={{ duration: 0.16 }}
        >
          <span
            className="choice-card__visual"
            style={option.swatch ? { background: option.swatch } : undefined}
          >
            {option.icon ?? option.sample}
          </span>
          <span className="choice-card__copy">
            <strong>{option.label}</strong>
            <small>{option.detail}</small>
          </span>
          <span className="choice-card__check">
            <AnimatePresence initial={false}>
              {value === option.value && (
                <motion.span
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Check size={12} />
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </motion.button>
      ))}
    </div>
  );
}
function InfoCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      className="info-card"
      whileHover={{ y: -1 }}
      transition={{ duration: 0.18 }}
    >
      <span>{icon}</span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </motion.div>
  );
}
