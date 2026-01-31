import { create } from 'zustand';
import React from 'react';
import type { Card, GameState, GameActions, Zone as ZoneType, Phase, Step } from '../types';
import { Zone, Phase as PhaseEnum, Step as StepEnum } from '../types';

// Real MTG card data with images from Scryfall
const mockCards: Card[] = [
  // Hand cards (7 cards)
  { 
    id: 'venom', 
    name: 'Venom, Evil Unleashed', 
    manaCost: '{4}{B}', 
    type: 'Legendary Creature — Symbiote Villain', 
    zone: Zone.HAND, 
    tapped: false, 
    position: { row: 0, col: 2 },
    imageUrl: 'https://cards.scryfall.io/large/front/a/b/ab3d51a4-40f0-4606-b5f9-2686c12fd54b.jpg?1757377205'
  },
  { 
    id: 'ezio', 
    name: 'Ezio, Brash Novice', 
    manaCost: '{1}{R/W}', 
    type: 'Legendary Creature — Human', 
    zone: Zone.HAND, 
    tapped: false, 
    position: { row: 0, col: 3},
    imageUrl: 'https://cards.scryfall.io/large/front/3/3/3351cae2-87be-4438-ba58-f4f4aff2416c.jpg?1721423999'
  },
  { 
    id: 'lightning', 
    name: 'Lightning Bolt', 
    manaCost: '{R}', 
    type: 'Instant', 
    zone: Zone.HAND, 
    tapped: false, 
    position: { row: 0, col: 4 },
    imageUrl: 'https://cards.scryfall.io/large/front/7/7/77c6fa74-5543-42ac-9ead-0e890b188e99.jpg?1706239968'
  },
  { 
    id: 'counterspell', 
    name: 'Counterspell', 
    manaCost: '{U}{U}', 
    type: 'Instant', 
    zone: Zone.HAND, 
    tapped: false, 
    position: { row: 0, col: 6 },
    imageUrl: 'https://cards.scryfall.io/large/front/4/f/4f616706-ec97-4923-bb1e-11a69fbaa1f8.jpg?1751282477'
  },
  { 
    id: 'fireball', 
    name: 'Fireball', 
    manaCost: 'XR', 
    type: 'Sorcery', 
    zone: Zone.HAND, 
    tapped: false, 
    position: { row: 0, col: 7 },
    imageUrl: 'https://cards.scryfall.io/large/front/d/f/df45a43e-a5b7-4fd4-873b-7b3c021be198.jpg?1674136553'
  },
  { 
    id: 'goblin', 
    name: 'Goblin Guide', 
    manaCost: 'R', 
    type: 'Creature — Goblin Scout', 
    zone: Zone.HAND, 
    tapped: false, 
    position: { row: 0, col: 8 },
    imageUrl: 'https://cards.scryfall.io/large/front/3/c/3c0f5411-1940-410f-96ce-6f92513f753a.jpg?1599706366'
  },
  { 
    id: 'forest-hand', 
    name: 'Forest', 
    manaCost: '', 
    type: 'Basic Land — Forest', 
    zone: Zone.HAND, 
    tapped: false, 
    position: { row: 0, col: 9 },
    imageUrl: 'https://cards.scryfall.io/large/front/b/4/b460f5f7-c7c9-400c-8419-23d614f45bf9.jpg?1767773926'
  },
  
  // Battlefield cards (3 cards - artifact, creature, sorcery)
  { 
    id: 'sol-ring', 
    name: 'Sol Ring', 
    manaCost: '{1}', 
    type: 'Artifact', 
    zone: Zone.BATTLEFIELD, 
    tapped: false, 
    position: { row: 0, col: 2 },
    imageUrl: 'https://cards.scryfall.io/large/front/2/8/2824f3fb-82e6-43bd-babf-da6777a5b075.jpg?1729273449'
  },
  { 
    id: 'tarmogoyf', 
    name: 'Tarmogoyf', 
    manaCost: '{1}{G}', 
    type: 'Creature — Lhurgoyf', 
    zone: Zone.BATTLEFIELD, 
    tapped: false, 
    position: { row: 0, col: 5 },
    imageUrl: 'https://cards.scryfall.io/large/front/6/9/69daba76-96e8-4bcc-ab79-2f00189ad8fb.jpg?1619398799'
  },
  { 
    id: 'ancestral', 
    name: 'Ancestral Recall', 
    manaCost: 'U', 
    type: 'Instant', 
    zone: Zone.BATTLEFIELD, 
    tapped: false, 
    position: { row: 1, col: 7 },
    imageUrl: 'https://cards.scryfall.io/large/front/2/3/2398892d-28e9-4009-81ec-0d544af79d2b.jpg?1614638829'
  },
  
  // Lands zone cards (4 cards)
  { 
    id: 'mountain-1', 
    name: 'Mountain', 
    manaCost: '', 
    type: 'Basic Land — Mountain', 
    zone: Zone.LANDS, 
    tapped: false, 
    position: { row: 0, col: 3 },
    imageUrl: 'https://cards.scryfall.io/large/front/2/9/295b92bc-d66f-45d8-9bbe-5f5f13e39fd4.jpg?1767773878'
  },
  { 
    id: 'island-1', 
    name: 'Island', 
    manaCost: '', 
    type: 'Basic Land — Island', 
    zone: Zone.LANDS, 
    tapped: false, 
    position: { row: 0, col: 4 },
    imageUrl: 'https://cards.scryfall.io/large/front/5/7/57d9b053-ed45-41f3-a0ab-0a08c41f587a.jpg?1760102991'
  },
  { 
    id: 'forest-1', 
    name: 'Forest', 
    manaCost: '', 
    type: 'Basic Land — Forest', 
    zone: Zone.LANDS, 
    tapped: false, 
    position: { row: 0, col: 5 },
    imageUrl: 'https://cards.scryfall.io/large/front/4/b/4b535df5-f79c-4ab5-9b2f-cbbb5adad70a.jpg?1758801202'
  },
  { 
    id: 'mountain-2', 
    name: 'Mountain', 
    manaCost: '', 
    type: 'Basic Land — Mountain', 
    zone: Zone.LANDS, 
    tapped: false, 
    position: { row: 0, col: 6 },
    imageUrl: 'https://cards.scryfall.io/large/front/2/9/295b92bc-d66f-45d8-9bbe-5f5f13e39fd4.jpg?1767773878'
  },
];

type GameStore = GameState & GameActions;

export const useGameStore = create<GameStore>((set) => ({
  cards: mockCards,
  currentPhase: PhaseEnum.BEGINNING,
  currentStep: StepEnum.UNTAP,



  // moveCard now supports optional position for battlefield, hand, and lands placement
  moveCard: (cardId: string, toZone: ZoneType, position?: { row: number; col: number }) => {
    console.log('Store moveCard:', cardId, 'to zone:', toZone, 'position:', position);
    set((state) => {
      if (toZone === Zone.BATTLEFIELD || toZone === Zone.HAND || toZone === Zone.LANDS) {
        // Use provided position if given, otherwise find next available
        let pos = position;
        if (!pos) {
          const zoneCards = state.cards.filter(c => c.zone === toZone && c.position);
          const occupied = zoneCards.map(c => c.position).filter(Boolean) as { row: number; col: number }[];
          let found = false;
          pos = { row: 0, col: 0 };
          const rows = toZone === Zone.BATTLEFIELD ? 2 : 1;
          const cols = toZone === Zone.HAND ? 12 : 10;
          for (let row = 0; row < rows && !found; row++) {
            for (let col = 0; col < cols && !found; col++) {
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
        // Remove position if not on battlefield, hand, or lands
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

  advanceStep: () => {
    set((state) => {
      const { currentPhase, currentStep } = state;
      let newPhase = currentPhase;
      let newStep = currentStep;

      // Define step sequences for each phase
      const stepSequence: Record<Phase, Step[]> = {
        [PhaseEnum.BEGINNING]: [StepEnum.UNTAP, StepEnum.UPKEEP, StepEnum.DRAW],
        [PhaseEnum.MAIN_1]: [StepEnum.MAIN],
        [PhaseEnum.COMBAT]: [
          StepEnum.BEGIN_COMBAT,
          StepEnum.DECLARE_ATTACKERS,
          StepEnum.DECLARE_BLOCKERS,
          StepEnum.COMBAT_DAMAGE,
          StepEnum.END_COMBAT,
        ],
        [PhaseEnum.MAIN_2]: [StepEnum.MAIN],
        [PhaseEnum.ENDING]: [StepEnum.END_STEP, StepEnum.CLEANUP],
      };

      const phaseOrder: Phase[] = [
        PhaseEnum.BEGINNING,
        PhaseEnum.MAIN_1,
        PhaseEnum.COMBAT,
        PhaseEnum.MAIN_2,
        PhaseEnum.ENDING,
      ];

      const currentSteps = stepSequence[currentPhase];
      const currentStepIndex = currentSteps.indexOf(currentStep);

      // If not at end of current phase's steps
      if (currentStepIndex < currentSteps.length - 1) {
        newStep = currentSteps[currentStepIndex + 1];
      } else {
        // Move to next phase
        const currentPhaseIndex = phaseOrder.indexOf(currentPhase);
        if (currentPhaseIndex < phaseOrder.length - 1) {
          newPhase = phaseOrder[currentPhaseIndex + 1];
          newStep = stepSequence[newPhase][0];
        } else {
          // Wrap back to beginning
          newPhase = PhaseEnum.BEGINNING;
          newStep = StepEnum.UNTAP;
        }
      }

      return { currentPhase: newPhase, currentStep: newStep };
    });
  },

  skipToEnd: () => {
    set(() => ({
      currentPhase: PhaseEnum.ENDING,
      currentStep: StepEnum.END_STEP,
    }));
  },

  passToNextTurn: () => {
    set(() => ({
      currentPhase: PhaseEnum.BEGINNING,
      currentStep: StepEnum.UNTAP,
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