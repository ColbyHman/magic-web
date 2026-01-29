
export const Zone = {
  HAND: 'hand',
  BATTLEFIELD: 'battlefield',
  OPPONENT_BATTLEFIELD: 'opponent-battlefield',
  LANDS: 'lands',
  GRAVEYARD: 'graveyard',
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
}

export interface BattlefieldProps {
  setBattlefieldHover?: (cell: { row: number; col: number } | null) => void;
}

export interface GameActions {
  tapCard: (cardId: string) => void;
  moveCard: (cardId: string, toZone: Zone, position?: { row: number; col: number }) => void;
}