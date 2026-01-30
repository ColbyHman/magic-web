
export const Zone = {
  HAND: 'hand',
  BATTLEFIELD: 'battlefield',
  OPPONENT_BATTLEFIELD: 'opponent-battlefield',
  LANDS: 'lands',
  GRAVEYARD: 'graveyard',
} as const;

export type Zone = typeof Zone[keyof typeof Zone];

// Phase and Step enums for turn structure
export const Phase = {
  BEGINNING: 'beginning',
  MAIN_1: 'main1',
  COMBAT: 'combat',
  MAIN_2: 'main2',
  ENDING: 'ending',
} as const;

export type Phase = typeof Phase[keyof typeof Phase];

export const Step = {
  // Beginning Phase steps
  UNTAP: 'untap',
  UPKEEP: 'upkeep',
  DRAW: 'draw',
  // Main Phase (no substeps)
  MAIN: 'main',
  // Combat Phase steps
  BEGIN_COMBAT: 'begin_combat',
  DECLARE_ATTACKERS: 'declare_attackers',
  DECLARE_BLOCKERS: 'declare_blockers',
  COMBAT_DAMAGE: 'combat_damage',
  END_COMBAT: 'end_combat',
  // Ending Phase steps
  END_STEP: 'end_step',
  CLEANUP: 'cleanup',
} as const;

export type Step = typeof Step[keyof typeof Step];

export interface Card {
  id: string;
  name: string;
  manaCost: string;
  type: string;
  zone: Zone;
  tapped: boolean;
}

export interface GameState {
  cards: Card[];
  currentPhase: Phase;
  currentStep: Step;
}

export interface Card {
  id: string;
  name: string;
  manaCost: string;
  type: string;
  zone: Zone;
  tapped: boolean;
  position?: { row: number; col: number };
}

export interface BattlefieldProps {
  setBattlefieldHover?: (cell: { row: number; col: number } | null) => void;
}

export interface GameActions {
  tapCard: (cardId: string) => void;
  moveCard: (cardId: string, toZone: Zone, position?: { row: number; col: number }) => void;
  advanceStep: () => void;
  skipToEnd: () => void;
  passToNextTurn: () => void;
}