
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

export interface GameActions {
  playCard: (cardId: string) => void;
  tapCard: (cardId: string) => void;
  moveCard: (cardId: string, toZone: Zone) => void;
  moveCardWithPosition: (cardId: string, toZone: Zone, targetPosition?: { row: number; col: number }) => void;
}