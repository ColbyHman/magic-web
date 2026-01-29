import { create } from 'zustand';
import React from 'react';
import type { Card, GameState, GameActions, Zone as ZoneType } from '../types';
import { Zone } from '../types';

// Mock card data for POC
const mockCards: Card[] = [
  { id: '1', name: 'Lightning Bolt', manaCost: 'R', type: 'Instant', zone: Zone.HAND, tapped: false },
  { id: '2', name: 'Goblin Guide', manaCost: 'R', type: 'Creature — Goblin Scout', zone: Zone.HAND, tapped: false },
  { id: '3', name: 'Forest', manaCost: '', type: 'Land', zone: Zone.HAND, tapped: false },
  { id: '4', name: 'Mountain', manaCost: '', type: 'Land', zone: Zone.HAND, tapped: false },
  { id: '5', name: 'Fireball', manaCost: 'XR', type: 'Sorcery', zone: Zone.HAND, tapped: false },
  { id: '6', name: 'Goblin Piledriver', manaCost: '1R', type: 'Creature — Goblin Warrior', zone: Zone.HAND, tapped: false },
  { id: '7', name: 'Island', manaCost: '', type: 'Land', zone: Zone.HAND, tapped: false },
  { id: '8', name: 'Counterspell', manaCost: 'UU', type: 'Instant', zone: Zone.HAND, tapped: false },
];

type GameStore = GameState & GameActions;

export const useGameStore = create<GameStore>((set) => ({
  cards: mockCards,



  // moveCard now supports optional position for battlefield placement
  moveCard: (cardId: string, toZone: ZoneType, position?: { row: number; col: number }) => {
    console.log('Store moveCard:', cardId, 'to zone:', toZone, 'position:', position);
    set((state) => {
      if (toZone === Zone.BATTLEFIELD) {
        // Use provided position if given, otherwise find next available
        let pos = position;
        if (!pos) {
          const battlefieldCards = state.cards.filter(c => c.zone === Zone.BATTLEFIELD && c.position);
          const occupied = battlefieldCards.map(c => c.position).filter(Boolean) as { row: number; col: number }[];
          let found = false;
          pos = { row: 0, col: 0 };
          for (let row = 0; row < 2 && !found; row++) {
            for (let col = 0; col < 10 && !found; col++) {
              if (!occupied.some(p => p.row === row && p.col === col)) {
                pos = { row, col };
                found = true;
              }
            }
          }
        }
        const newCards = state.cards.map((card) =>
          card.id === cardId
            ? { ...card, zone: toZone, tapped: false, position: pos }
            : card
        );
        console.log('Updated cards:', newCards.filter(c => c.zone === toZone));
        return { cards: newCards };
      } else {
        // Remove position if not on battlefield
        const newCards = state.cards.map((card) =>
          card.id === cardId
            ? { ...card, zone: toZone, tapped: false, position: undefined }
            : card
        );
        console.log('Updated cards:', newCards.filter(c => c.zone === toZone));
        return { cards: newCards };
      }
    });
  },

  tapCard: (cardId: string) => {
    set((state) => ({
      cards: state.cards.map((card) =>
        card.id === cardId
          ? { ...card, tapped: !card.tapped }
          : card
      ),
    }));
  },

}));

// Derived selectors for cleaner component code
export const useCardsInZone = (zone: ZoneType) => {
  const cards = useGameStore((state) => state.cards);
  return React.useMemo(() =>
    cards.filter((card) => card.zone === zone)
    , [cards, zone]);
};

export const useCardById = (cardId: string) => {
  const cards = useGameStore((state) => state.cards);
  return React.useMemo(() =>
    cards.find((card) => card.id === cardId)
    , [cards, cardId]);
};