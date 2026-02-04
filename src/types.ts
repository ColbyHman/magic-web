
export const Zone = {
  HAND: 'hand',
  BATTLEFIELD: 'battlefield',
  OPPONENT_BATTLEFIELD: 'opponent-battlefield',
  LANDS: 'lands',
  GRAVEYARD: 'graveyard',
  EXILE: 'exile',
  OPPONENT_GRAVEYARD: 'opponent-graveyard',
  OPPONENT_EXILE: 'opponent-exile',
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
  attachmentMode: {
    active: boolean;
    sourceCardId: string | null;
  };
}

export interface Card {
  id: string;
  name: string;
  manaCost: string;
  type: string;
  zone: Zone;
  tapped: boolean;
  position?: { row: number; col: number };
  imageUrl?: string;
  attachedTo?: string; // ID of the card this card is attached to
  attachedCards?: string[]; // IDs of cards attached to this card
}

export interface BattlefieldProps {
  setBattlefieldHover?: (cell: { row: number; col: number } | null) => void;
  setLandsHover?: (cell: { row: number; col: number } | null) => void;
}

export interface GameActions {
  tapCard: (cardId: string) => void;
  attachCard: (childId: string, parentId: string) => void;
  detachCard: (childId: string) => void;
  startAttachmentMode: (cardId: string) => void;
  cancelAttachmentMode: () => void;
  moveCard: (cardId: string, toZone: Zone, position?: { row: number; col: number }) => void;
  advanceStep: () => void;
  skipToEnd: () => void;
  passToNextTurn: () => void;
}