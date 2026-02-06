import cardCacheData from '../data/cardCache.json';

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
  rarity?: string;
  set?: string;
  collector_number?: string;
}

// In-memory cache that starts with the imported JSON data
const cache: Record<string, ScryfallCard> = { ...cardCacheData };

/**
 * Fetches a card from Scryfall by name, using cache if available
 */
export async function getCardData(cardName: string): Promise<ScryfallCard | null> {
  // Check cache first
  const cacheKey = cardName.toLowerCase();
  if (cache[cacheKey]) {
    console.log(`Card "${cardName}" found in cache`);
    return cache[cacheKey];
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

    return data;
  } catch (error) {
    console.error(`Error fetching card "${cardName}":`, error);
    return null;
  }
}

/**
 * Preload multiple cards at once
 */
export async function preloadCards(cardNames: string[]): Promise<ScryfallCard[]> {
  const results = await Promise.all(
    cardNames.map(name => getCardData(name))
  );
  return results.filter((card): card is ScryfallCard => card !== null);
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
