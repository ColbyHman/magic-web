
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

// Deck-related types
export type Format = 'standard' | 'commander' | 'modern' | 'legacy' | 'vintage' | 'casual';
export type LegalityStatus = 'legal' | 'not_legal' | 'restricted' | 'banned';

// Base Card interface representing immutable Scryfall data
export interface Card {
  scryfallId: string; // Unique Scryfall ID (primary identifier)
  name: string;
  manaCost: string;
  type: string;
  oracleText?: string;
  power?: string;
  toughness?: string;
  colors?: string[];
  colorIdentity?: string[];
  cmc?: number;
  imageUrl?: string;
  rarity?: string;
  set?: string;
  collectorNumber?: string;
  legalities?: Record<Format, LegalityStatus>;
}

// GameCard extends Card with mutable game state
export interface GameCard extends Card {
  instanceId: string; // Unique UUID for this card instance in the game
  zone: Zone;
  tapped: boolean;
  position?: { row: number; col: number };
  attachedTo?: string; // instanceId of the card this card is attached to
  attachedCards?: string[]; // instanceIds of cards attached to this card
}

export interface GameState {
  cards: GameCard[];
  currentPhase: Phase;
  currentStep: Step;
  attachmentMode: {
    active: boolean;
    sourceCardId: string | null;
  };
}

export interface BattlefieldProps {
  setBattlefieldHover?: (cell: { row: number; col: number } | null) => void;
  setHandHover?: (cell: { row: number; col: number } | null) => void;
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

// DeckEntry represents a card in a deck with metadata
export interface DeckEntry {
  card: Card; // Full Card object with all Scryfall data
  quantity: number;
  isSideboard: boolean;
  isCommander: boolean;
  category?: 'Creature' | 'Removal' | 'Ramp' | 'Draw' | 'Win Con' | 'Other';
  notes?: string;
}

export interface Deck {
  id: string;
  name: string;
  description?: string;
  format: Format;
  cards: DeckEntry[];
  createdAt: Date;
  updatedAt: Date;
  lastPlayed?: Date;
  colors: string[];
  cardCount: number;
  isFavorite?: boolean;
  tags?: string[];
}

export interface DeckStats {
  totalCards: number;
  mainDeckCount: number;
  sideboardCount: number;
  commanderCount: number;
  averageCMC: number;
  manaCurve: Record<number, number>;
  colorDistribution: Record<string, number>;
  typeDistribution: Record<string, number>;
}

export type ValidationSeverity = 'error' | 'warning';

export interface ValidationWarning {
  severity: ValidationSeverity;
  message: string;
  cardNames?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  warnings: ValidationWarning[];
}