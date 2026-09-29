/**
 * NotchiStateResolver — domínio puro do mascote.
 * README seção 32: estados Happy/Normal/Watching/Concerned/Critical/Exhausted.
 * README seção 59: função pura, extensível por regras futuras (Open/Closed).
 */

export type NotchiState =
  | 'happy'
  | 'normal'
  | 'watching'
  | 'concerned'
  | 'critical'
  | 'exhausted';

export interface NotchiRule {
  minPercentage: number;
  maxPercentage: number;
  state: NotchiState;
}

/** Regras padrão conforme README seção 32 */
export const DEFAULT_NOTCHI_RULES: NotchiRule[] = [
  { minPercentage: 0,   maxPercentage: 40,  state: 'happy'     },
  { minPercentage: 40,  maxPercentage: 60,  state: 'normal'    },
  { minPercentage: 60,  maxPercentage: 75,  state: 'watching'  },
  { minPercentage: 75,  maxPercentage: 90,  state: 'concerned' },
  { minPercentage: 90,  maxPercentage: 99,  state: 'critical'  },
  { minPercentage: 99,  maxPercentage: 100, state: 'exhausted' },
];

/**
 * Resolve o estado do Notchi a partir do percentual de consumo.
 * Aceita regras customizadas para extensibilidade futura.
 */
export function resolveNotchiState(
  percentage: number,
  rules: NotchiRule[] = DEFAULT_NOTCHI_RULES,
): NotchiState {
  for (const rule of rules) {
    if (percentage >= rule.minPercentage && percentage <= rule.maxPercentage) {
      return rule.state;
    }
  }
  return 'exhausted';
}

/** README seção 33: mensagens do Notchi por threshold */
export const NOTCHI_MESSAGES: Record<NotchiState, string> = {
  happy:     'Tudo certo por aqui! 😊',
  normal:    'Consumo dentro do esperado.',
  watching:  'De olho no seu consumo. 👀',
  concerned: 'Talvez valha economizar alguns tokens.',
  critical:  'Estamos chegando perto do limite.',
  exhausted: 'Bom... a gente tentou avisar. 💀',
};

/** Emoji do Notchi por estado */
export const NOTCHI_EMOJI: Record<NotchiState, string> = {
  happy:     '😊',
  normal:    '😐',
  watching:  '👀',
  concerned: '😬',
  critical:  '😱',
  exhausted: '💀',
};
