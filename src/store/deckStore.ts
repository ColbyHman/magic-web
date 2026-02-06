import { create } from 'zustand';
import type { Deck, DeckEntry, Format, ValidationResult, DeckStats } from '../types';
import { loadDecks, saveDecks, saveDeck as saveSingleDeck, deleteDeck as deleteSingleDeck } from '../utils/deckStorage';
import { validateDeck, calculateDeckStats } from '../utils/deckValidation';
import { getCardData } from '../utils/cardCache';

interface DeckStore {
  decks: Deck[];
  currentDeckId: string | null;
  isLoading: boolean;
  isAddingCard: boolean;
  
  // Deck CRUD operations
  loadDecks: () => Promise<void>;
  createDeck: (name: string, format: Format) => Deck;
  deleteDeck: (deckId: string) => void;
  updateDeck: (deckId: string, updates: Partial<Deck>) => void;
  duplicateDeck: (deckId: string) => Deck | null;
  setCurrentDeck: (deckId: string | null) => void;
  
  // Card management
  addCardToDeck: (deckId: string, cardName: string, isSideboard?: boolean) => Promise<void>;
  removeCardFromDeck: (deckId: string, scryfallId: string, isSideboard?: boolean) => void;
  updateCardQuantity: (deckId: string, scryfallId: string, quantity: number, isSideboard?: boolean) => void;
  moveCardToSideboard: (deckId: string, scryfallId: string, toSideboard: boolean) => void;
  setCommander: (deckId: string, scryfallId: string) => void;
  removeCommander: (deckId: string, scryfallId: string) => void;
  
  // Utilities
  getCurrentDeck: () => Deck | null;
  getDeckById: (deckId: string) => Deck | null;
  validateCurrentDeck: () => ValidationResult;
  getCurrentDeckStats: () => DeckStats | null;
}

export const useDeckStore = create<DeckStore>((set, get) => ({
  decks: [],
  currentDeckId: null,
  isLoading: false,
  isAddingCard: false,
  
  // Load decks from localStorage
  loadDecks: async () => {
    set({ isLoading: true });
    try {
      const decks = loadDecks();
      set({ decks, isLoading: false });
    } catch (error) {
      console.error('Failed to load decks:', error);
      set({ isLoading: false });
    }
  },
  
  // Create a new deck
  createDeck: (name: string, format: Format) => {
    const newDeck: Deck = {
      id: crypto.randomUUID(),
      name,
      format,
      cards: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      colors: [],
      cardCount: 0,
      isFavorite: false,
      tags: [],
    };
    
    const { decks } = get();
    const updatedDecks = [...decks, newDeck];
    set({ decks: updatedDecks });
    saveDecks(updatedDecks);
    
    return newDeck;
  },
  
  // Delete a deck
  deleteDeck: (deckId: string) => {
    const { decks, currentDeckId } = get();
    const updatedDecks = decks.filter(d => d.id !== deckId);
    set({ 
      decks: updatedDecks,
      currentDeckId: currentDeckId === deckId ? null : currentDeckId,
    });
    deleteSingleDeck(deckId);
  },
  
  // Update deck properties
  updateDeck: (deckId: string, updates: Partial<Deck>) => {
    const { decks } = get();
    const updatedDecks = decks.map(deck => {
      if (deck.id === deckId) {
        const updated = { ...deck, ...updates, updatedAt: new Date() };
        saveSingleDeck(updated);
        return updated;
      }
      return deck;
    });
    set({ decks: updatedDecks });
  },
  
  // Duplicate a deck
  duplicateDeck: (deckId: string) => {
    const { decks } = get();
    const original = decks.find(d => d.id === deckId);
    if (!original) return null;
    
    const duplicate: Deck = {
      ...original,
      id: crypto.randomUUID(),
      name: `${original.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastPlayed: undefined,
    };
    
    const updatedDecks = [...decks, duplicate];
    set({ decks: updatedDecks });
    saveDecks(updatedDecks);
    
    return duplicate;
  },
  
  // Set current deck
  setCurrentDeck: (deckId: string | null) => {
    set({ currentDeckId: deckId });
  },
  
  // Add a card to deck (fetch full data from Scryfall)
  addCardToDeck: async (deckId: string, cardName: string, isSideboard = false) => {
    const { decks } = get();
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return;
    
    // Set loading state immediately
    set({ isAddingCard: true });
    
    // Fetch card data from Scryfall
    const card = await getCardData(cardName);
    if (!card) {
      console.error(`Could not fetch card data for ${cardName}`);
      set({ isAddingCard: false });
      return;
    }
    
    // Check if card already exists in the deck
    const existingEntry = deck.cards.find(
      c => c.card.scryfallId === card.scryfallId && c.isSideboard === isSideboard
    );
    
    if (existingEntry) {
      // Increment quantity
      get().updateCardQuantity(deckId, card.scryfallId, existingEntry.quantity + 1, isSideboard);
      set({ isAddingCard: false });
      return;
    }
    
    // Create deck entry with full Card object
    const newEntry: DeckEntry = {
      card,
      quantity: 1,
      isSideboard,
      isCommander: false,
    };
    
    const updatedDeck = {
      ...deck,
      cards: [...deck.cards, newEntry],
      updatedAt: new Date(),
    };
    
    // Update colors and card count
    const colors = new Set<string>();
    updatedDeck.cards.forEach(entry => {
      entry.card.colorIdentity?.forEach(color => colors.add(color));
    });
    updatedDeck.colors = Array.from(colors);
    updatedDeck.cardCount = updatedDeck.cards.reduce((sum, c) => sum + (c.isCommander ? 1 : c.quantity), 0);
    
    const updatedDecks = decks.map(d => d.id === deckId ? updatedDeck : d);
    set({ decks: updatedDecks, isAddingCard: false });
    saveSingleDeck(updatedDeck);
  },
  
  // Remove a card from deck
  removeCardFromDeck: (deckId: string, scryfallId: string, isSideboard = false) => {
    const { decks } = get();
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return;
    
    const updatedDeck = {
      ...deck,
      cards: deck.cards.filter(c => !(c.card.scryfallId === scryfallId && c.isSideboard === isSideboard)),
      updatedAt: new Date(),
    };
    
    // Update colors and card count
    const colors = new Set<string>();
    updatedDeck.cards.forEach(entry => {
      entry.card.colorIdentity?.forEach(color => colors.add(color));
    });
    updatedDeck.colors = Array.from(colors);
    updatedDeck.cardCount = updatedDeck.cards.reduce((sum, c) => sum + (c.isCommander ? 1 : c.quantity), 0);
    
    const updatedDecks = decks.map(d => d.id === deckId ? updatedDeck : d);
    set({ decks: updatedDecks });
    saveSingleDeck(updatedDeck);
  },
  
  // Update card quantity
  updateCardQuantity: (deckId: string, scryfallId: string, quantity: number, isSideboard = false) => {
    if (quantity <= 0) {
      get().removeCardFromDeck(deckId, scryfallId, isSideboard);
      return;
    }
    
    const { decks } = get();
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return;
    
    const updatedDeck = {
      ...deck,
      cards: deck.cards.map(entry => {
        if (entry.card.scryfallId === scryfallId && entry.isSideboard === isSideboard) {
          return { ...entry, quantity };
        }
        return entry;
      }),
      updatedAt: new Date(),
    };
    
    updatedDeck.cardCount = updatedDeck.cards.reduce((sum, c) => sum + (c.isCommander ? 1 : c.quantity), 0);
    
    const updatedDecks = decks.map(d => d.id === deckId ? updatedDeck : d);
    set({ decks: updatedDecks });
    saveSingleDeck(updatedDeck);
  },
  
  // Move card between main deck and sideboard
  moveCardToSideboard: (deckId: string, scryfallId: string, toSideboard: boolean) => {
    const { decks } = get();
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return;
    
    const updatedDeck = {
      ...deck,
      cards: deck.cards.map(entry => {
        if (entry.card.scryfallId === scryfallId) {
          return { ...entry, isSideboard: toSideboard };
        }
        return entry;
      }),
      updatedAt: new Date(),
    };
    
    const updatedDecks = decks.map(d => d.id === deckId ? updatedDeck : d);
    set({ decks: updatedDecks });
    saveSingleDeck(updatedDeck);
  },
  
  // Set a card as commander
  setCommander: (deckId: string, scryfallId: string) => {
    const { decks } = get();
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return;
    
    const entry = deck.cards.find(c => c.card.scryfallId === scryfallId);
    if (!entry) return;
    
    // Check how many commanders already exist
    const currentCommanders = deck.cards.filter(c => c.isCommander);
    
    // If there's already 1 commander, check if the existing one has Partner
    if (currentCommanders.length === 1) {
      const existingCommander = currentCommanders[0];
      const hasPartner = existingCommander.card.oracleText?.toLowerCase().includes('partner');
      const newCardHasPartner = entry.card.oracleText?.toLowerCase().includes('partner');
      
      if (!hasPartner || !newCardHasPartner) {
        console.warn('Cannot add second commander without Partner keyword on both');
        return;
      }
    }
    
    // Don't allow more than 2 commanders
    if (currentCommanders.length >= 2) {
      console.warn('Cannot have more than 2 commanders');
      return;
    }
    
    const updatedDeck = {
      ...deck,
      cards: deck.cards.map(c => {
        if (c.card.scryfallId === scryfallId) {
          return { ...c, isCommander: true, isSideboard: false, quantity: 1 };
        }
        return c;
      }),
      updatedAt: new Date(),
    };
    
    const updatedDecks = decks.map(d => d.id === deckId ? updatedDeck : d);
    set({ decks: updatedDecks });
    saveSingleDeck(updatedDeck);
  },
  
  // Remove commander designation
  removeCommander: (deckId: string, scryfallId: string) => {
    const { decks } = get();
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return;
    
    const updatedDeck = {
      ...deck,
      cards: deck.cards.map(c => {
        if (c.card.scryfallId === scryfallId) {
          return { ...c, isCommander: false };
        }
        return c;
      }),
      updatedAt: new Date(),
    };
    
    const updatedDecks = decks.map(d => d.id === deckId ? updatedDeck : d);
    set({ decks: updatedDecks });
    saveSingleDeck(updatedDeck);
  },
  
  // Get current deck
  getCurrentDeck: () => {
    const { decks, currentDeckId } = get();
    return decks.find(d => d.id === currentDeckId) || null;
  },
  
  // Get deck by ID
  getDeckById: (deckId: string) => {
    const { decks } = get();
    return decks.find(d => d.id === deckId) || null;
  },
  
  // Validate current deck
  validateCurrentDeck: () => {
    const deck = get().getCurrentDeck();
    if (!deck) {
      return { isValid: true, warnings: [] };
    }
    return validateDeck(deck);
  },
  
  // Get stats for current deck
  getCurrentDeckStats: () => {
    const deck = get().getCurrentDeck();
    if (!deck) return null;
    return calculateDeckStats(deck);
  },
}));
