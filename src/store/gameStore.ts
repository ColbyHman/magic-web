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

  playCard: (cardId: string) => {
    set((state) => ({
      cards: state.cards.map((card) =>
        card.id === cardId
          ? { ...card, zone: Zone.BATTLEFIELD, tapped: false }
          : card
      ),
    }));
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

  moveCard: (cardId: string, toZone: ZoneType) => {
    console.log('Store moveCard:', cardId, 'to zone:', toZone);
    set((state) => {
      const newCards = state.cards.map((card) =>
        card.id === cardId
          ? { ...card, zone: toZone, tapped: false }
          : card
      );
      console.log('Updated cards:', newCards.filter(c => c.zone === toZone));
      return { cards: newCards };
    });
  },

  moveCardWithPosition: (cardId: string, toZone: ZoneType, targetPosition?: { row: number; col: number }) => {
    console.log('Smart positioning for:', cardId, 'to zone:', toZone, 'target position:', targetPosition);
    set((state) => {
      const zoneCards = state.cards.filter(c => c.zone === toZone);
      const existingPositions = zoneCards.map(c => c.position).filter((p): p is NonNullable<typeof p> => p !== undefined);
      
      let targetRow = targetPosition ? targetPosition.row : 0; // Default to front row
      let targetCol = targetPosition ? targetPosition.col : 0; // Default to first column
      
      // If position is already occupied, find nearest empty spot
      if (existingPositions.some(p => p.row === targetRow && p.col === targetCol)) {
        // Find closest empty position
        let minDistance = Infinity;
        let bestPosition = { row: 0, col: 0 };
        
        for (let row = 0; row <= 1; row++) {
          for (let col = 0; col < 10; col++) {
            if (!existingPositions.some(p => p.row === row && p.col === col)) {
              const distance = Math.abs(row - targetRow) + Math.abs(col - targetCol);
              if (distance < minDistance) {
                minDistance = distance;
                bestPosition = { row, col };
              }
            }
          }
        }
        
        targetRow = bestPosition.row;
        targetCol = bestPosition.col;
      }
      
      const newCards = state.cards.map((card) =>
        card.id === cardId
          ? { ...card, zone: toZone, tapped: false, position: { row: targetRow, col: targetCol } }
          : card
      );
      
      console.log('Updated cards with position:', newCards.filter(c => c.zone === toZone));
      return { cards: newCards };
    });
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