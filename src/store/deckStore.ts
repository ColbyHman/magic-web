import { create } from 'zustand';
import type { Deck, DeckEntry, Format, ValidationResult, DeckStats, Folder } from '../types';
import { loadDecks, saveDecks, saveDeck as saveSingleDeck, deleteDeck as deleteSingleDeck } from '../utils/deckStorage';
import { loadFolders, saveFolders } from '../utils/folderStorage';
import { validateDeck, calculateDeckStats } from '../utils/deckValidation';
import { getCardData } from '../utils/cardCache';
import type { ParsedCard } from '../utils/deckImportParser';

export interface ImportProgress {
  current: number;
  total: number;
  currentCardName: string;
}

export interface ImportFailedCard {
  originalLine: string;
  cardName: string;
  error: string;
}

export interface ImportConflict {
  conflict: true;
  suggestedName: string;
  existingDeckId: string;
  pendingDeck: Deck;
  validation: ValidationResult;
}

export interface ImportSuccess {
  success: true;
  deck: Deck;
  validation: ValidationResult;
}

export interface ImportError {
  error: true;
  failedCards: ImportFailedCard[];
  partialDeck?: Deck;
}

export type ImportResult = ImportSuccess | ImportConflict | ImportError;

interface DeckStore {
  decks: Deck[];
  currentDeckId: string | null;
  isLoading: boolean;
  isAddingCard: boolean;
  folders: Folder[];
  currentFolderId: string | null;
  
  // Deck CRUD operations
  loadDecks: () => Promise<void>;
  createDeck: (name: string, format: Format, folderId?: string | null) => Deck;
  deleteDeck: (deckId: string) => void;
  updateDeck: (deckId: string, updates: Partial<Deck>) => void;
  duplicateDeck: (deckId: string) => Deck | null;
  setCurrentDeck: (deckId: string | null) => void;
  importDeck: (
    deckName: string,
    format: Format,
    parsedCards: ParsedCard[],
    onProgress?: (progress: ImportProgress) => void
  ) => Promise<ImportResult>;
  savePendingDeck: (deck: Deck, overwriteId?: string) => void;
  
  // Card management
  addCardToDeck: (deckId: string, cardName: string, isSideboard?: boolean) => Promise<void>;
  removeCardFromDeck: (deckId: string, scryfallId: string, isSideboard?: boolean) => void;
  updateCardQuantity: (deckId: string, scryfallId: string, quantity: number, isSideboard?: boolean) => void;
  moveCardToSideboard: (deckId: string, scryfallId: string, toSideboard: boolean) => void;
  setCommander: (deckId: string, scryfallId: string) => void;
  removeCommander: (deckId: string, scryfallId: string) => void;
  
  // Folder operations
  loadFolders: () => Promise<void>;
  createFolder: (name: string, parentId: string | null, color?: string) => Folder;
  deleteFolder: (folderId: string, deleteContents: boolean) => void;
  renameFolder: (folderId: string, newName: string) => void;
  updateFolderColor: (folderId: string, color: string) => void;
  moveFolder: (folderId: string, newParentId: string | null) => void;
  moveDecksToFolder: (deckIds: string[], folderId: string | null) => void;
  setCurrentFolder: (folderId: string | null) => void;
  getFolderPath: (folderId: string | null) => Folder[];
  getSubfolders: (parentId: string | null) => Folder[];
  getDecksInFolder: (folderId: string | null) => Deck[];
  
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
  folders: [],
  currentFolderId: null,
  
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
  createDeck: (name: string, format: Format, folderId?: string | null) => {
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
      folderId: folderId || null,
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

  // Import a deck from parsed card data
  importDeck: async (
    deckName: string,
    format: Format,
    parsedCards: ParsedCard[],
    onProgress?: (progress: ImportProgress) => void
  ): Promise<ImportResult> => {
    const failedCards: ImportFailedCard[] = [];
    const deckEntries: DeckEntry[] = [];

    // Sequentially fetch each card
    for (let i = 0; i < parsedCards.length; i++) {
      const parsedCard = parsedCards[i];
      
      // Report progress
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: parsedCards.length,
          currentCardName: parsedCard.name,
        });
      }

      try {
        // Fetch card data, prioritizing set/collector if available
        const card = await getCardData(parsedCard.name, {
          set: parsedCard.set,
          collectorNumber: parsedCard.collectorNumber,
        });

        if (!card) {
          failedCards.push({
            originalLine: parsedCard.originalLine,
            cardName: parsedCard.name,
            error: 'Card not found in Scryfall database',
          });
          continue;
        }

        // Create deck entry
        const deckEntry: DeckEntry = {
          card,
          quantity: parsedCard.quantity,
          isSideboard: parsedCard.isSideboard,
          isCommander: parsedCard.isCommander,
          category: parsedCard.category as DeckEntry['category'],
        };

        deckEntries.push(deckEntry);
      } catch (error) {
        failedCards.push({
          originalLine: parsedCard.originalLine,
          cardName: parsedCard.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // If all cards failed, return error
    if (deckEntries.length === 0) {
      return {
        error: true,
        failedCards,
      };
    }

    // Calculate color identity from all cards
    const colorSet = new Set<string>();
    deckEntries.forEach(entry => {
      entry.card.colorIdentity?.forEach(color => colorSet.add(color));
    });
    const colors = Array.from(colorSet);

    // Calculate card count
    const cardCount = deckEntries.reduce((sum, entry) => sum + entry.quantity, 0);

    // Create the deck object
    const { currentFolderId } = get();
    const newDeck: Deck = {
      id: crypto.randomUUID(),
      name: deckName,
      format,
      cards: deckEntries,
      createdAt: new Date(),
      updatedAt: new Date(),
      colors,
      cardCount,
      isFavorite: false,
      tags: [],
      folderId: currentFolderId,
    };

    // Validate the deck
    const validation = validateDeck(newDeck);

    // Check for duplicate deck name
    const { decks } = get();
    const existingDeck = decks.find(d => d.name.toLowerCase() === deckName.toLowerCase());
    
    if (existingDeck) {
      // Generate suggested name with timestamp
      const now = new Date();
      const timestamp = now.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      const suggestedName = `${deckName} (${timestamp})`;

      return {
        conflict: true,
        suggestedName,
        existingDeckId: existingDeck.id,
        pendingDeck: newDeck,
        validation,
      };
    }

    // If there are failed cards, return partial success
    if (failedCards.length > 0) {
      return {
        error: true,
        failedCards,
        partialDeck: newDeck,
      };
    }

    // If there are validation warnings, return success but don't save yet
    // The deck will be saved after user confirms via savePendingDeck
    if (validation.warnings && validation.warnings.length > 0) {
      return {
        success: true,
        deck: newDeck,
        validation,
      };
    }

    // No conflicts, errors, or warnings - save the deck immediately
    const updatedDecks = [...decks, newDeck];
    set({ decks: updatedDecks });
    saveDecks(updatedDecks);

    return {
      success: true,
      deck: newDeck,
      validation,
    };
  },

  // Save a pending deck after resolving conflicts
  savePendingDeck: (deck: Deck, overwriteId?: string) => {
    const { decks } = get();
    
    if (overwriteId) {
      // Overwrite existing deck
      const updatedDecks = decks.map(d => {
        if (d.id === overwriteId) {
          return { ...deck, id: overwriteId, createdAt: d.createdAt };
        }
        return d;
      });
      set({ decks: updatedDecks });
      saveDecks(updatedDecks);
    } else {
      // Add as new deck
      const updatedDecks = [...decks, deck];
      set({ decks: updatedDecks });
      saveDecks(updatedDecks);
    }
  },

  // Load folders from localStorage
  loadFolders: async () => {
    try {
      const folders = loadFolders();
      set({ folders });
    } catch (error) {
      console.error('Failed to load folders:', error);
    }
  },

  // Create a new folder
  createFolder: (name: string, parentId: string | null, color?: string) => {
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name,
      parentId,
      createdAt: new Date(),
      color,
    };
    
    const { folders } = get();
    const updatedFolders = [...folders, newFolder];
    set({ folders: updatedFolders });
    saveFolders(updatedFolders);
    
    return newFolder;
  },

  // Delete a folder
  deleteFolder: (folderId: string, deleteContents: boolean) => {
    const { folders, decks } = get();
    
    if (deleteContents) {
      // Delete folder and all decks in it (including subfolders recursively)
      const getAllDescendantFolderIds = (parentId: string): string[] => {
        const children = folders.filter(f => f.parentId === parentId);
        const childIds = children.map(f => f.id);
        const grandchildIds = children.flatMap(f => getAllDescendantFolderIds(f.id));
        return [...childIds, ...grandchildIds];
      };
      
      const folderIdsToDelete = [folderId, ...getAllDescendantFolderIds(folderId)];
      
      // Delete all decks in these folders
      const updatedDecks = decks.filter(d => !folderIdsToDelete.includes(d.folderId || ''));
      
      // Delete all folders
      const updatedFolders = folders.filter(f => !folderIdsToDelete.includes(f.id));
      
      set({ folders: updatedFolders, decks: updatedDecks, currentFolderId: null });
      saveFolders(updatedFolders);
      saveDecks(updatedDecks);
    } else {
      // Delete folder but move decks and subfolders to root
      const updatedDecks = decks.map(d => 
        d.folderId === folderId ? { ...d, folderId: null } : d
      );
      
      const updatedFolders = folders
        .filter(f => f.id !== folderId)
        .map(f => f.parentId === folderId ? { ...f, parentId: null } : f);
      
      set({ folders: updatedFolders, decks: updatedDecks, currentFolderId: null });
      saveFolders(updatedFolders);
      saveDecks(updatedDecks);
    }
  },

  // Rename a folder
  renameFolder: (folderId: string, newName: string) => {
    const { folders } = get();
    const updatedFolders = folders.map(f => 
      f.id === folderId ? { ...f, name: newName } : f
    );
    set({ folders: updatedFolders });
    saveFolders(updatedFolders);
  },

  // Update folder color
  updateFolderColor: (folderId: string, color: string) => {
    const { folders } = get();
    const updatedFolders = folders.map(f => 
      f.id === folderId ? { ...f, color } : f
    );
    set({ folders: updatedFolders });
    saveFolders(updatedFolders);
  },

  // Move a folder to a new parent
  moveFolder: (folderId: string, newParentId: string | null) => {
    const { folders } = get();
    
    // Prevent moving a folder into itself or its descendants
    const getAllDescendantIds = (parentId: string): string[] => {
      const children = folders.filter(f => f.parentId === parentId);
      const childIds = children.map(f => f.id);
      const grandchildIds = children.flatMap(f => getAllDescendantIds(f.id));
      return [...childIds, ...grandchildIds];
    };
    
    const descendantIds = getAllDescendantIds(folderId);
    if (newParentId && (newParentId === folderId || descendantIds.includes(newParentId))) {
      console.error('Cannot move folder into itself or its descendants');
      return;
    }
    
    const updatedFolders = folders.map(f => 
      f.id === folderId ? { ...f, parentId: newParentId } : f
    );
    set({ folders: updatedFolders });
    saveFolders(updatedFolders);
  },

  // Move multiple decks to a folder
  moveDecksToFolder: (deckIds: string[], folderId: string | null) => {
    const { decks } = get();
    const updatedDecks = decks.map(d => 
      deckIds.includes(d.id) ? { ...d, folderId, updatedAt: new Date() } : d
    );
    set({ decks: updatedDecks });
    saveDecks(updatedDecks);
  },

  // Set current folder for navigation
  setCurrentFolder: (folderId: string | null) => {
    set({ currentFolderId: folderId });
  },

  // Get folder path (breadcrumbs)
  getFolderPath: (folderId: string | null) => {
    const { folders } = get();
    if (!folderId) return [];
    
    const path: Folder[] = [];
    let currentId: string | null = folderId;
    
    while (currentId) {
      const folder = folders.find(f => f.id === currentId);
      if (!folder) break;
      path.unshift(folder);
      currentId = folder.parentId;
    }
    
    return path;
  },

  // Get subfolders of a parent
  getSubfolders: (parentId: string | null) => {
    const { folders } = get();
    return folders.filter(f => f.parentId === parentId);
  },

  // Get decks in a specific folder
  getDecksInFolder: (folderId: string | null) => {
    const { decks } = get();
    return decks.filter(d => (d.folderId || null) === folderId);
  },
}));
