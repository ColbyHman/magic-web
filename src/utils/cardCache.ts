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
 * Fetches a card from Scryfall by set and collector number, using cache if available
 */
export async function getCardBySetAndCollector(
  setCode: string,
  collectorNumber: string
): Promise<Card | null> {
  // Search cache for matching set and collector number
  const cachedEntry = Object.values(cache).find(
    card => card.set?.toLowerCase() === setCode.toLowerCase() && 
            card.collector_number === collectorNumber
  );
  
  if (cachedEntry) {
    console.log(`Card from set "${setCode}" #${collectorNumber} found in cache`);
    return scryfallCardToCard(cachedEntry);
  }

  // Fetch from Scryfall
  try {
    console.log(`Fetching card from set "${setCode}" #${collectorNumber} from Scryfall...`);
    const response = await fetch(
      `https://api.scryfall.com/cards/${encodeURIComponent(setCode.toLowerCase())}/${encodeURIComponent(collectorNumber)}`
    );

    if (!response.ok) {
      console.error(`Failed to fetch card from set "${setCode}" #${collectorNumber} from Scryfall`);
      return null;
    }

    const data: ScryfallCard = await response.json();
    
    // Cache the result using name as primary key
    const nameCacheKey = data.name.toLowerCase();
    cache[nameCacheKey] = data;
    console.log(`Card "${data.name}" from ${setCode} #${collectorNumber} cached successfully`);

    // Save to localStorage for persistence across reloads
    saveToLocalStorage();

    return scryfallCardToCard(data);
  } catch (error) {
    console.error(`Error fetching card from set "${setCode}" #${collectorNumber}:`, error);
    return null;
  }
}

/**
 * Fetches a card from Scryfall by name, using cache if available.
 * If set and collector number are provided, prioritizes exact match lookup.
 */
export async function getCardData(
  cardName: string,
  options?: { set?: string; collectorNumber?: string }
): Promise<Card | null> {
  // If set and collector number provided, try exact match first
  if (options?.set && options?.collectorNumber) {
    const exactMatch = await getCardBySetAndCollector(options.set, options.collectorNumber);
    if (exactMatch) {
      return exactMatch;
    }
    // If exact match fails, fall through to fuzzy name search
    console.log(`Exact match failed for ${options.set} #${options.collectorNumber}, trying fuzzy name search...`);
  }

  const cacheKey = cardName.toLowerCase();
  
  // If no set is specified, we want the latest printing
  // Don't use cache in this case as it might have an older printing
  const wantLatestPrinting = !options?.set && !options?.collectorNumber;
  
  // Check cache first (but skip if we want the latest printing)
  if (!wantLatestPrinting && cache[cacheKey]) {
    console.log(`Card "${cardName}" found in cache`);
    return scryfallCardToCard(cache[cacheKey]);
  }

  // Fetch from Scryfall
  // If no set is specified, use the search API to get the latest printing
  try {
    console.log(`Fetching "${cardName}" from Scryfall...`);
    
    let data: ScryfallCard;
    
    if (wantLatestPrinting) {
      // No set specified - fetch the latest printing using search API
      const searchResponse = await fetch(
        `https://api.scryfall.com/cards/search?q=${encodeURIComponent(`!"${cardName}"`)}&order=released&dir=desc&unique=prints`
      );
      
      if (!searchResponse.ok) {
        console.error(`Failed to fetch card "${cardName}" from Scryfall search`);
        return null;
      }
      
      const searchData = await searchResponse.json();
      if (!searchData.data || searchData.data.length === 0) {
        console.error(`No results found for "${cardName}"`);
        return null;
      }
      
      // Get the first result (latest printing)
      data = searchData.data[0];
      console.log(`Found latest printing: ${data.set?.toUpperCase()} #${data.collector_number}`);
    } else {
      // Use fuzzy name search as fallback
      const response = await fetch(
        `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cardName)}`
      );

      if (!response.ok) {
        console.error(`Failed to fetch card "${cardName}" from Scryfall`);
        return null;
      }

      data = await response.json();
    }
    
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
