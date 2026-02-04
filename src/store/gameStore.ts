import { create } from 'zustand';
import React from 'react';
import type { Card, GameState, GameActions, Zone as ZoneType, Phase, Step } from '../types';
import { Zone, Phase as PhaseEnum, Step as StepEnum } from '../types';
import { initializeCards } from '../utils/initializeCards';

// Initial empty cards array - will be populated from Scryfall
const initialCards: Card[] = [];

type GameStore = GameState & GameActions & {
  loadCards: () => Promise<void>;
  isLoading: boolean;
};

export const useGameStore = create<GameStore>((set) => ({
  cards: initialCards,
  currentPhase: PhaseEnum.BEGINNING,
  currentStep: StepEnum.UNTAP,
  attachmentMode: {
    active: false,
    sourceCardId: null,
  },
  isLoading: true,

  // Load cards from Scryfall with caching
  loadCards: async () => {
    try {
      const cards = await initializeCards();
      set({ cards, isLoading: false });
    } catch (error) {
      console.error('Failed to load cards:', error);
      set({ isLoading: false });
    }
  },

  // moveCard now supports optional position for battlefield, hand, and lands placement
  moveCard: (cardId: string, toZone: ZoneType, position?: { row: number; col: number }) => {
    console.log('Store moveCard:', cardId, 'to zone:', toZone, 'position:', position);
    set((state) => {
      // Detach all attachments if moving away from battlefield
      let updatedCards = state.cards;
      if (toZone !== Zone.BATTLEFIELD) {
        const card = state.cards.find(c => c.id === cardId);
        if (card?.attachedCards && card.attachedCards.length > 0) {
          // Detach all children
          updatedCards = updatedCards.map(c => {
            if (card.attachedCards?.includes(c.id)) {
              return { ...c, attachedTo: undefined };
            }
            return c;
          });
        }
        if (card?.attachedTo) {
          // Remove from parent's attachedCards array
          updatedCards = updatedCards.map(c => {
            if (c.id === card.attachedTo) {
              return {
                ...c,
                attachedCards: c.attachedCards?.filter(id => id !== cardId),
              };
            }
            return c;
          });
        }
      }

      if (toZone === Zone.BATTLEFIELD || toZone === Zone.HAND || toZone === Zone.LANDS) {
        // Use provided position if given, otherwise find next available
        let pos = position;
        
        // Hand doesn't use positions - cards are auto-arranged
        if (toZone === Zone.HAND) {
          pos = undefined;
        } else if (!pos) {
          const zoneCards = updatedCards.filter(c => c.zone === toZone && c.position);
          const occupied = zoneCards.map(c => c.position).filter(Boolean) as { row: number; col: number }[];
          let found = false;
          pos = { row: 0, col: 0 };
          const rows = toZone === Zone.BATTLEFIELD ? 2 : 1;
          const cols = 10;
          for (let row = 0; row < rows && !found; row++) {
            for (let col = 0; col < cols && !found; col++) {
              if (!occupied.some(p => p.row === row && p.col === col)) {
                pos = { row, col };
                found = true;
              }
            }
          }
        }
        const newCards = updatedCards.map((card) =>
          card.id === cardId
            ? { ...card, zone: toZone, tapped: false, position: pos }
            : card
        );
        console.log('Updated cards:', newCards.filter(c => c.zone === toZone));
        return { cards: newCards };
      } else {
        // Remove position if not on battlefield, hand, or lands
        const newCards = updatedCards.map((card) =>
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

  attachCard: (childId: string, parentId: string) => {
    set((state) => {
      const child = state.cards.find(c => c.id === childId);
      const parent = state.cards.find(c => c.id === parentId);

      // Only allow attachment on battlefield
      if (!child || !parent || child.zone !== Zone.BATTLEFIELD || parent.zone !== Zone.BATTLEFIELD) {
        return state;
      }

      // Prevent attaching to self or creating circular references
      if (childId === parentId || parent.attachedTo === childId) {
        return state;
      }

      // Update cards
      const newCards = state.cards.map(card => {
        if (card.id === childId) {
          // If child was already attached to another card, remove it from that parent first
          if (child.attachedTo) {
            const oldParent = state.cards.find(c => c.id === child.attachedTo);
            if (oldParent) {
              const oldParentIndex = state.cards.indexOf(oldParent);
              state.cards[oldParentIndex] = {
                ...oldParent,
                attachedCards: oldParent.attachedCards?.filter(id => id !== childId) || [],
              };
            }
          }
          // Attach child to new parent, inherit parent's position
          return {
            ...card,
            attachedTo: parentId,
            position: parent.position,
          };
        }
        if (card.id === parentId) {
          // Add child to parent's attachedCards array
          return {
            ...card,
            attachedCards: [...(card.attachedCards || []), childId],
          };
        }
        return card;
      });

      return {
        cards: newCards,
        attachmentMode: { active: false, sourceCardId: null },
      };
    });
  },

  detachCard: (childId: string) => {
    set((state) => {
      const child = state.cards.find(c => c.id === childId);
      if (!child || !child.attachedTo) {
        return state;
      }

      const parentId = child.attachedTo;
      const newCards = state.cards.map(card => {
        if (card.id === childId) {
          // Remove attachedTo, keep same position
          return {
            ...card,
            attachedTo: undefined,
          };
        }
        if (card.id === parentId) {
          // Remove child from parent's attachedCards array
          return {
            ...card,
            attachedCards: card.attachedCards?.filter(id => id !== childId) || [],
          };
        }
        return card;
      });

      return { cards: newCards };
    });
  },

  startAttachmentMode: (cardId: string) => {
    set(() => ({
      attachmentMode: {
        active: true,
        sourceCardId: cardId,
      },
    }));
  },

  cancelAttachmentMode: () => {
    set(() => ({
      attachmentMode: {
        active: false,
        sourceCardId: null,
      },
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