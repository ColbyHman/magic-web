import cardCacheData from '../data/cardCache.json';
import type { LegalityStatus, Format, Card } from '../types';

export interface ScryfallCard {
  id: string;
  name: string;
  mana_cost?: string;
  type_line: string;
  oracle_text?: string;
  power?: string;
  toughness?: string;
  image_uris?: {
    normal: string;
    large: string;
  };
  card_faces?: Array<{
    name: string;
    mana_cost?: string;
    type_line: string;
    oracle_text?: string;
    image_uris?: {
      normal: string;
      large: string;
    };
  }>;
  colors?: string[];
  color_identity?: string[];
  rarity?: string;
  set?: string;
  collector_number?: string;
  cmc?: number;
  legalities?: Record<Format, LegalityStatus>;
}

// In-memory cache that starts with the imported JSON data
const cache: Record<string, ScryfallCard> = { ...cardCacheData };

/**
 * Convert ScryfallCard to Card type
 */
function scryfallCardToCard(scryfallCard: ScryfallCard): Card {
  const imageUrl = scryfallCard.image_uris?.normal || 
                   scryfallCard.card_faces?.[0]?.image_uris?.normal || 
                   '';
  
  return {
    scryfallId: scryfallCard.id,
    name: scryfallCard.name,
    manaCost: scryfallCard.mana_cost || '',
    type: scryfallCard.type_line,
    oracleText: scryfallCard.oracle_text,
    power: scryfallCard.power,
    toughness: scryfallCard.toughness,
    colors: scryfallCard.colors,
    colorIdentity: scryfallCard.color_identity,
    cmc: scryfallCard.cmc,
    imageUrl,
    rarity: scryfallCard.rarity,
    set: scryfallCard.set,
    collectorNumber: scryfallCard.collector_number,
    legalities: scryfallCard.legalities,
  };
}

/**
 * Fetches a card from Scryfall by name, using cache if available
 */
export async function getCardData(cardName: string): Promise<Card | null> {
  // Check cache first
  const cacheKey = cardName.toLowerCase();
  if (cache[cacheKey]) {
    console.log(`Card "${cardName}" found in cache`);
    return scryfallCardToCard(cache[cacheKey]);
  }

  // Fetch from Scryfall
  try {
    console.log(`Fetching "${cardName}" from Scryfall...`);
    const response = await fetch(
      `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cardName)}`
    );

    if (!response.ok) {
      console.error(`Failed to fetch card "${cardName}" from Scryfall`);
      return null;
    }

    const data: ScryfallCard = await response.json();
    
    // Cache the result
    cache[cacheKey] = data;
    console.log(`Card "${cardName}" cached successfully`);

    // Save to localStorage for persistence across reloads
    saveToLocalStorage();

    return scryfallCardToCard(data);
  } catch (error) {
    console.error(`Error fetching card "${cardName}":`, error);
    return null;
  }
}

/**
 * Fetches a card from Scryfall by scryfallId, using cache if available
 */
export async function getCardById(scryfallId: string): Promise<Card | null> {
  // Search cache for matching scryfallId
  const cachedEntry = Object.values(cache).find(card => card.id === scryfallId);
  if (cachedEntry) {
    console.log(`Card with ID "${scryfallId}" found in cache`);
    return scryfallCardToCard(cachedEntry);
  }

  // Fetch from Scryfall by ID
  try {
    console.log(`Fetching card with ID "${scryfallId}" from Scryfall...`);
    const response = await fetch(
      `https://api.scryfall.com/cards/${scryfallId}`
    );

    if (!response.ok) {
      console.error(`Failed to fetch card with ID "${scryfallId}" from Scryfall`);
      return null;
    }

    const data: ScryfallCard = await response.json();
    
    // Cache the result using name as key
    const cacheKey = data.name.toLowerCase();
    cache[cacheKey] = data;
    console.log(`Card "${data.name}" (${scryfallId}) cached successfully`);

    // Save to localStorage for persistence across reloads
    saveToLocalStorage();

    return scryfallCardToCard(data);
  } catch (error) {
    console.error(`Error fetching card with ID "${scryfallId}":`, error);
    return null;
  }
}

/**
 * Preload multiple cards at once
 */
export async function preloadCards(cardNames: string[]): Promise<Card[]> {
  const results = await Promise.all(
    cardNames.map(name => getCardData(name))
  );
  return results.filter((card): card is Card => card !== null);
}

/**
 * Get the current cache
 */
export function getCache(): Record<string, ScryfallCard> {
  return { ...cache };
}

/**
 * Save cache to localStorage
 */
function saveToLocalStorage() {
  try {
    localStorage.setItem('mtg-card-cache', JSON.stringify(cache));
  } catch (error) {
    console.error('Failed to save cache to localStorage:', error);
  }
}

/**
 * Load cache from localStorage
 */
export function loadFromLocalStorage() {
  try {
    const stored = localStorage.getItem('mtg-card-cache');
    if (stored) {
      const parsed = JSON.parse(stored);
      Object.assign(cache, parsed);
      console.log(`Loaded ${Object.keys(parsed).length} cards from localStorage`);
    }
  } catch (error) {
    console.error('Failed to load cache from localStorage:', error);
  }
}

// Initialize cache from localStorage on module load
loadFromLocalStorage();
