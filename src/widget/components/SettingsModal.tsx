/**
 * SettingsModal — Menu modal expansível de personalização completa do Notch Island.
 * Design System rigorosamente alinhado ao Onboarding (vidro fosco 24px, brand lockup N,
 * option-chips, provider-items, tipografia e botões de alta fidelidade visual).
 * Zero emojis — apenas ícones lineares consistentes da biblioteca Lucide.
 */
import { useState } from 'react';
import {
  Palette,
  Type,
  Sliders,
  LayoutGrid,
  Check,
  X,
  RotateCcw,
  Sparkles,
  Columns,
  Rows,
  MousePointer,
  Hand,
  Moon,
  Zap,
  Shield,
  Flame,
  Compass,
} from 'lucide-react';
import {
  useAppStore,
  type FontFamily,
  type GlassStyle,
  type OrientationMode,
  type ThemePreset,
} from '@app/store';
import { providerService } from '@providers/services/providerService';
import { ProviderIcon } from '@shared/components/AIIcons';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type TabKey = 'visual' | 'fonts' | 'providers' | 'behavior';

const ACCENT_COLORS = [
  { label: 'Laranja Neon', color: '#ff7b3d' },
  { label: 'Roxo Elétrico', color: '#7c6dfa' },
  { label: 'Verde Esmeralda', color: '#3ecf8e' },
  { label: 'Ciano Aqua', color: '#00f5d4' },
  { label: 'Rosa Shock', color: '#f72585' },
  { label: 'Azul Elétrico', color: '#3b82f6' },
  { label: 'Dourado Âmbar', color: '#eab308' },
  { label: 'Branco Puro', color: '#ffffff' },
];

const FONTS: { key: FontFamily; name: string; desc: string; sample: string }[] = [
  { key: 'inter', name: 'Inter', desc: 'Minimalista & Limpo', sample: '48% Consumo' },
  { key: 'jetbrains', name: 'JetBrains Mono', desc: 'Estilo Desenvolvedor', sample: '48% Consumo' },
  { key: 'outfit', name: 'Outfit', desc: 'Futurista & Elegante', sample: '48% Consumo' },
  { key: 'jakarta', name: 'Plus Jakarta Sans', desc: 'Geométrico Sofisticado', sample: '48% Consumo' },
];

const THEME_PRESETS: {
  key: ThemePreset;
  name: string;
  icon: typeof Moon;
  bg: string;
  border: string;
  desc: string;
}[] = [
  {
    key: 'obsidian',
    name: 'Obsidian OLED',
    icon: Moon,
    bg: '#050507',
    border: 'rgba(255,255,255,0.12)',
    desc: 'Preto absoluto com contraste máximo',
  },
  {
    key: 'midnight',
    name: 'Midnight Blue',
    icon: Compass,
    bg: '#080c16',
    border: 'rgba(59,130,246,0.22)',
    desc: 'Azul escuro espacial profundo',
  },
  {
    key: 'cyberpunk',
    name: 'Cyberpunk Dark',
    icon: Zap,
    bg: '#10061a',
    border: 'rgba(247,37,133,0.28)',
    desc: 'Preto com aura neon magenta',
  },
  {
    key: 'emerald',
    name: 'Deep Emerald',
    icon: Shield,
    bg: '#05110d',
    border: 'rgba(62,207,142,0.25)',
    desc: 'Verde grafite sofisticado',
  },
  {
    key: 'amber',
    name: 'Smoked Amber',
    icon: Flame,
    bg: '#120d06',
    border: 'rgba(234,179,8,0.25)',
    desc: 'Tom âmbar dourado suave',
  },
];

const GLASS_STYLES: { key: GlassStyle; name: string; desc: string }[] = [
  { key: 'solid', name: 'Sólido Profundo', desc: 'Fundo escuro 100% opaco' },
  { key: 'translucent', name: 'Translúcido Blur', desc: 'Vidro fosco moderno (blur 24px)' },
  { key: 'glass', name: 'Ultra Espelhado', desc: 'Vidro fino reflexivo (blur 36px)' },
];

export default function SettingsModal({ isOpen, onClose }: Props) {
  const {
    orientationMode,
    setOrientationMode,
    glassStyle,
    setGlassStyle,
    fontFamily,
    setFontFamily,
    accentColor,
    setAccentColor,
    themePreset,
    setThemePreset,
    expandBehavior,
    setExpandBehavior,
    selectedProviderIds,
    setSelectedProviderIds,
    customRingColors,
    setCustomRingColor,
    resetCustomRingColors,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabKey>('visual');

  if (!isOpen) return null;

  const allProviders = providerService.getProviders();

  const toggleProvider = (id: string) => {
    if (selectedProviderIds.includes(id)) {
      if (selectedProviderIds.length <= 1) return; // Mantém ao menos 1 provedor
      setSelectedProviderIds(selectedProviderIds.filter((p) => p !== id));
    } else {
      setSelectedProviderIds([...selectedProviderIds, id]);
    }
  };

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div
        className="settings-modal animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
        id="settings-modal-menu"
      >
        {/* Cabeçalho no padrão Onboarding: Brand lockup N Notch Island + status tag + close */}
        <header className="settings-modal__header">
          <div className="brand-lockup">
            <span className="brand-mark">N</span>
            <span className="brand-word">Notch Island</span>
          </div>

          <div className="settings-header-right">
            <button
              className="settings-modal__close-btn"
              onClick={onClose}
              title="Fechar personalização"
              type="button"
            >
              <X size={15} strokeWidth={2.2} />
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <div className="settings-hero">
          <h2 className="settings-hero__title">Ajustes do Dock</h2>
          <p className="settings-hero__desc">
            Personalize cores, tipografia, provedores e dinâmica de transição visual em tempo real.
          </p>
        </div>

        {/* Abas com design Option-Chips do Onboarding (Zero Emojis, com Lucide Icons) */}
        <div className="settings-chips-nav">
          <button
            type="button"
            className={`option-chip ${activeTab === 'visual' ? 'active' : ''}`}
            onClick={() => setActiveTab('visual')}
          >
            <Palette size={14} strokeWidth={2.2} />
            <span>Aparência</span>
            {activeTab === 'visual' && <Check size={13} strokeWidth={2.4} />}
          </button>

          <button
            type="button"
            className={`option-chip ${activeTab === 'fonts' ? 'active' : ''}`}
            onClick={() => setActiveTab('fonts')}
          >
            <Type size={14} strokeWidth={2.2} />
            <span>Tipografia</span>
            {activeTab === 'fonts' && <Check size={13} strokeWidth={2.4} />}
          </button>

          <button
            type="button"
            className={`option-chip ${activeTab === 'providers' ? 'active' : ''}`}
            onClick={() => setActiveTab('providers')}
          >
            <Sliders size={14} strokeWidth={2.2} />
            <span>IAs & Anéis</span>
            {activeTab === 'providers' && <Check size={13} strokeWidth={2.4} />}
          </button>

          <button
            type="button"
            className={`option-chip ${activeTab === 'behavior' ? 'active' : ''}`}
            onClick={() => setActiveTab('behavior')}
          >
            <LayoutGrid size={14} strokeWidth={2.2} />
            <span>Disposição</span>
            {activeTab === 'behavior' && <Check size={13} strokeWidth={2.4} />}
          </button>
        </div>

        {/* Conteúdo Dinâmico das Abas */}
        <div className="settings-modal__body">
          {/* ABA 1: APARÊNCIA & CORES */}
          {activeTab === 'visual' && (
            <div className="customize-stack animate-fade-in">
              {/* Cor de Destaque */}
              <div className="customize-section">
                <span className="customize-section__label">Paleta de Destaque (Accent)</span>
                <div className="settings-color-palette">
                  {ACCENT_COLORS.map((item) => {
                    const isCurrent = accentColor.toLowerCase() === item.color.toLowerCase();
                    return (
                      <button
                        key={item.color}
                        type="button"
                        className={`settings-color-pill ${isCurrent ? 'active' : ''}`}
                        style={{ background: item.color }}
                        onClick={() => setAccentColor(item.color)}
                        title={item.label}
                      >
                        {isCurrent && (
                          <Check
                            size={13}
                            strokeWidth={3}
                            color={item.color === '#ffffff' ? '#000000' : '#ffffff'}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tema Visual do Dock */}
              <div className="customize-section">
                <span className="customize-section__label">Tema Visual de Fundo</span>
                <div className="onboarding-cards">
                  {THEME_PRESETS.map((p) => {
                    const ThemeIcon = p.icon;
                    const isSelected = themePreset === p.key;
                    return (
                      <div
                        key={p.key}
                        className={`onboarding-card settings-theme-card ${isSelected ? 'active' : ''}`}
                        onClick={() => setThemePreset(p.key)}
                        style={{
                          background: p.bg,
                          borderColor: isSelected ? 'rgba(165, 150, 255, 0.7)' : p.border,
                        }}
                      >
                        <span className="onboarding-card__icon" style={{ borderColor: p.border }}>
                          <ThemeIcon size={16} />
                        </span>
                        <div className="settings-theme-card__content">
                          <div className="settings-theme-card__header">
                            <h3 className="onboarding-card__title">{p.name}</h3>
                            {isSelected && <Check size={14} className="settings-card-check" />}
                          </div>
                          <p className="onboarding-card__desc">{p.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Estilo de Vidro */}
              <div className="customize-section">
                <span className="customize-section__label">Material de Vidro (Glassmorphism)</span>
                <div className="option-chips">
                  {GLASS_STYLES.map((g) => {
                    const isSelected = glassStyle === g.key;
                    return (
                      <button
                        key={g.key}
                        type="button"
                        className={`option-chip ${isSelected ? 'active' : ''}`}
                        onClick={() => setGlassStyle(g.key)}
                      >
                        <span>{g.name}</span>
                        {isSelected && <Check size={13} strokeWidth={2.4} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: TIPOGRAFIA */}
          {activeTab === 'fonts' && (
            <div className="customize-stack animate-fade-in">
              <div className="customize-section">
                <span className="customize-section__label">Família Tipográfica & Métricas</span>
                <div className="settings-font-grid">
                  {FONTS.map((font) => {
                    const isSelected = fontFamily === font.key;
                    return (
                      <div
                        key={font.key}
                        className={`onboarding-card settings-font-card ${isSelected ? 'active' : ''}`}
                        onClick={() => setFontFamily(font.key)}
                      >
                        <div className="settings-font-card__left">
                          <span
                            className="settings-font-card__name"
                            style={{ fontFamily: `var(--font-${font.key}, sans-serif)` }}
                          >
                            {font.name}
                          </span>
                          <span className="onboarding-card__desc">{font.desc}</span>
                        </div>
                        <div className="settings-font-card__right">
                          <span
                            className="settings-font-sample-pill"
                            style={{ fontFamily: `var(--font-${font.key}, sans-serif)` }}
                          >
                            {font.sample}
                          </span>
                          {isSelected && <Check size={14} className="settings-card-check" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ABA 3: PROVEDORES & CORES DOS ANÉIS */}
          {activeTab === 'providers' && (
            <div className="customize-stack animate-fade-in">
              <div className="customize-section">
                <div className="settings-section-header">
                  <span className="customize-section__label">Provedores Ativos no Dock</span>
                  <button
                    type="button"
                    className="settings-link-btn"
                    onClick={resetCustomRingColors}
                  >
                    <RotateCcw size={12} strokeWidth={2.2} />
                    <span>Restaurar cores padrão</span>
                  </button>
                </div>

                {/* Grid de Provedores estilo Onboarding */}
                <div className="provider-list">
                  {allProviders.map((provider) => {
                    const isSelected = selectedProviderIds.includes(provider.id);
                    const currentColor =
                      customRingColors[provider.id] || provider.color || '#ff7b3d';

                    return (
                      <div
                        key={provider.id}
                        className={`provider-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleProvider(provider.id)}
                      >
                        <div className="provider-item__icon">
                          <ProviderIcon id={provider.id} size={16} color={currentColor} />
                        </div>
                        <span className="provider-item__name">{provider.name}</span>

                        {/* Seletor de cor individual do anel */}
                        <div
                          className="provider-item__color-pill"
                          onClick={(e) => e.stopPropagation()}
                          title={`Alterar cor do anel de ${provider.name}`}
                        >
                          <input
                            type="color"
                            value={currentColor}
                            onChange={(e) => setCustomRingColor(provider.id, e.target.value)}
                            className="provider-item__color-input"
                          />
                          <span className="provider-item__hex">{currentColor.toUpperCase()}</span>
                        </div>

                        <div className="provider-item__check-box">
                          {isSelected && (
                            <Check
                              size={14}
                              className="provider-item__check"
                              strokeWidth={2.4}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ABA 4: DISPOSIÇÃO & COMPORTAMENTO */}
          {activeTab === 'behavior' && (
            <div className="customize-stack animate-fade-in">
              {/* Orientação */}
              <div className="customize-section">
                <span className="customize-section__label">Orientação do Dock</span>
                <div className="option-chips">
                  {[
                    { key: 'auto', label: 'Automático (Borda inteligente)', icon: Sparkles },
                    { key: 'vertical', label: 'Vertical (Em pé)', icon: Columns },
                    { key: 'horizontal', label: 'Horizontal (Deitado)', icon: Rows },
                  ].map((item) => {
                    const ItemIcon = item.icon;
                    const isSelected = orientationMode === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        className={`option-chip ${isSelected ? 'active' : ''}`}
                        onClick={() => setOrientationMode(item.key as OrientationMode)}
                      >
                        <ItemIcon size={14} strokeWidth={2.2} />
                        <span>{item.label}</span>
                        {isSelected && <Check size={13} strokeWidth={2.4} />}
                      </button>
                    );
                  })}
                </div>
                <p className="onboarding-complement">
                  No modo automático, o dock se adapta fluentemente em pé nas laterais e deitado no
                  topo ou no rodapé.
                </p>
              </div>

              {/* Gatilho de Abertura do Flyout */}
              <div className="customize-section">
                <span className="customize-section__label">Abertura dos Detalhes (Flyout)</span>
                <div className="option-chips">
                  {[
                    { key: 'hover', label: 'Ao passar o mouse (Hover)', icon: MousePointer },
                    { key: 'click', label: 'Ao clicar no ícone (Clique)', icon: Hand },
                  ].map((item) => {
                    const ItemIcon = item.icon;
                    const isSelected = expandBehavior === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        className={`option-chip ${isSelected ? 'active' : ''}`}
                        onClick={() => setExpandBehavior(item.key as 'hover' | 'click')}
                      >
                        <ItemIcon size={14} strokeWidth={2.2} />
                        <span>{item.label}</span>
                        {isSelected && <Check size={13} strokeWidth={2.4} />}
                      </button>
                    );
                  })}
                </div>
                <p className="onboarding-complement">
                  Define se os cartões detalhados com cotas e modelos abrem instantaneamente ao mover o
                  cursor ou sob demanda via clique.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé no Padrão Onboarding (btn-secondary & btn-primary) */}
        <footer className="settings-modal__footer">
          <div className="settings-footer__status">
            <span className="settings-footer__dot" />
            <span className="onboarding-complement">Sincronizado em tempo real</span>
          </div>

          <div className="settings-footer__actions">
            <button className="btn btn-secondary" onClick={onClose} type="button">
              <X size={15} strokeWidth={2.2} />
              <span>Fechar</span>
            </button>
            <button className="btn btn-primary" onClick={onClose} type="button">
              <Check size={15} strokeWidth={2.4} />
              <span>Concluir</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
