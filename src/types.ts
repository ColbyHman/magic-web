
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
}

export interface BattlefieldProps {
  setBattlefieldHover?: (cell: { row: number; col: number } | null) => void;
  setHandHover?: (cell: { row: number; col: number } | null) => void;
  setLandsHover?: (cell: { row: number; col: number } | null) => void;
}

export interface GameActions {
  tapCard: (cardId: string) => void;
  moveCard: (cardId: string, toZone: Zone, position?: { row: number; col: number }) => void;
}