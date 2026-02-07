import type { Deck } from '../types';

const STORAGE_KEY = 'mtg-decks';

/**
 * Save decks to localStorage
 */
export function saveDecks(decks: Deck[]): void {
  try {
    // Convert dates to ISO strings for storage
    const serialized = decks.map(deck => ({
      ...deck,
      createdAt: deck.createdAt.toISOString(),
      updatedAt: deck.updatedAt.toISOString(),
      lastPlayed: deck.lastPlayed?.toISOString(),
    }));
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  } catch (error) {
    console.error('Failed to save decks to localStorage:', error);
  }
}

/**
 * Load decks from localStorage
 */
export function loadDecks(): Deck[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    
    const parsed = JSON.parse(stored);
    
    // Convert ISO strings back to Date objects
    return parsed.map((deck: any) => ({
      ...deck,
      createdAt: new Date(deck.createdAt),
      updatedAt: new Date(deck.updatedAt),
      lastPlayed: deck.lastPlayed ? new Date(deck.lastPlayed) : undefined,
    }));
  } catch (error) {
    console.error('Failed to load decks from localStorage:', error);
    return [];
  }
}

/**
 * Save a single deck (updates existing or adds new)
 */
export function saveDeck(deck: Deck): void {
  const decks = loadDecks();
  const index = decks.findIndex(d => d.id === deck.id);
  
  if (index >= 0) {
    decks[index] = deck;
  } else {
    decks.push(deck);
  }
  
  saveDecks(decks);
}

/**
 * Delete a deck by ID
 */
export function deleteDeck(deckId: string): void {
  const decks = loadDecks();
  const filtered = decks.filter(d => d.id !== deckId);
  saveDecks(filtered);
}

/**
 * Get a single deck by ID
 */
export function getDeck(deckId: string): Deck | null {
  const decks = loadDecks();
  return decks.find(d => d.id === deckId) || null;
}
