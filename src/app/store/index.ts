/**
 * App Store — estado global com Zustand.
 * README seção 40: Zustand para estados compartilhados.
 * Suporte completo a customização de temas, fontes, cores e comportamento.
 */
import { create } from 'zustand';
import type { UsageSnapshot } from '@providers/domain/types';

export type WidgetSize = 'compact' | 'medium' | 'expanded';
export type Theme = 'dark' | 'light' | 'auto';
export type ExpandBehavior = 'hover' | 'click' | 'manual';
export type OrientationMode = 'auto' | 'vertical' | 'horizontal';
export type GlassStyle = 'solid' | 'translucent' | 'glass';
export type FontFamily = 'inter' | 'jetbrains' | 'outfit' | 'jakarta';
export type ThemePreset = 'obsidian' | 'midnight' | 'cyberpunk' | 'emerald' | 'amber';

interface AppState {
  // Onboarding
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (v: boolean) => void;

  // Widget
  widgetSize: WidgetSize;
  widgetVisible: boolean;
  expandBehavior: ExpandBehavior;
  orientationMode: OrientationMode;
  glassStyle: GlassStyle;
  isSettingsModalOpen: boolean;

  setWidgetSize: (size: WidgetSize) => void;
  setWidgetVisible: (v: boolean) => void;
  setExpandBehavior: (b: ExpandBehavior) => void;
  setOrientationMode: (m: OrientationMode) => void;
  setGlassStyle: (g: GlassStyle) => void;
  setIsSettingsModalOpen: (v: boolean) => void;

  // Aparência & Customização Visual
  theme: Theme;
  themePreset: ThemePreset;
  fontFamily: FontFamily;
  accentColor: string;
  customRingColors: Record<string, string>;

  setTheme: (t: Theme) => void;
  setThemePreset: (p: ThemePreset) => void;
  setFontFamily: (f: FontFamily) => void;
  setAccentColor: (c: string) => void;
  setCustomRingColor: (providerId: string, color: string) => void;
  resetCustomRingColors: () => void;

  // Notchi
  notchiEnabled: boolean;
  setNotchiEnabled: (v: boolean) => void;

  // Usage snapshots
  snapshots: UsageSnapshot[];
  setSnapshots: (s: UsageSnapshot[]) => void;
  updateSnapshot: (snapshot: UsageSnapshot) => void;

  // Providers selecionados
  selectedProviderIds: string[];
  setSelectedProviderIds: (ids: string[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Onboarding
  hasCompletedOnboarding: false,
  setHasCompletedOnboarding: (v) => set({ hasCompletedOnboarding: v }),

  // Widget
  widgetSize: 'medium',
  widgetVisible: true,
  expandBehavior: 'hover',
  orientationMode: 'auto',
  glassStyle: 'solid',
  isSettingsModalOpen: false,

  setWidgetSize: (widgetSize) => set({ widgetSize }),
  setWidgetVisible: (widgetVisible) => set({ widgetVisible }),
  setExpandBehavior: (expandBehavior) => set({ expandBehavior }),
  setOrientationMode: (orientationMode) => set({ orientationMode }),
  setGlassStyle: (glassStyle) => set({ glassStyle }),
  setIsSettingsModalOpen: (isSettingsModalOpen) => set({ isSettingsModalOpen }),

  // Aparência & Customização
  theme: 'dark',
  themePreset: 'obsidian',
  fontFamily: 'inter',
  accentColor: '#ff7b3d',
  customRingColors: {},

  setTheme: (theme) => set({ theme }),
  setThemePreset: (themePreset) => set({ themePreset }),
  setFontFamily: (fontFamily) => set({ fontFamily }),
  setAccentColor: (accentColor) => set({ accentColor }),
  setCustomRingColor: (providerId, color) =>
    set((state) => ({
      customRingColors: { ...state.customRingColors, [providerId]: color },
    })),
  resetCustomRingColors: () => set({ customRingColors: {} }),

  // Notchi
  notchiEnabled: true,
  setNotchiEnabled: (notchiEnabled) => set({ notchiEnabled }),

  // Snapshots
  snapshots: [],
  setSnapshots: (snapshots) => set({ snapshots }),
  updateSnapshot: (snapshot) =>
    set((state) => ({
      snapshots: state.snapshots.some((s) => s.providerId === snapshot.providerId)
        ? state.snapshots.map((s) => (s.providerId === snapshot.providerId ? snapshot : s))
        : [...state.snapshots, snapshot],
    })),

  // Providers
  selectedProviderIds: ['claude', 'chatgpt', 'cursor', 'antigravity'],
  setSelectedProviderIds: (selectedProviderIds) => set({ selectedProviderIds }),
}));
