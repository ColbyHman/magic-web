import type { DeckEntry } from '../types';

// Define the standard MTG card types in typical display order
export const CARD_TYPE_ORDER = [
  'Land',
  'Creature',
  'Planeswalker',
  'Artifact',
  'Enchantment',
  'Instant',
  'Sorcery'
] as const;

export type CardType = typeof CARD_TYPE_ORDER[number];

/**
 * Extracts the primary card type from a full type line
 * @param typeString - The full type line (e.g., "Legendary Creature — Human Wizard")
 * @returns The primary card type (e.g., "Creature")
 */
export function getPrimaryCardType(typeString: string): string {
  if (!typeString) return 'Other';
  
  // Remove subtypes (everything after —)
  const mainTypes = typeString.split('—')[0].trim();
  
  // Search for standard type keywords in priority order
  for (const type of CARD_TYPE_ORDER) {
    if (mainTypes.includes(type)) {
      return type;
    }
  }
  
  // Fallback to first word if no standard type found
  return mainTypes.split(' ')[0] || 'Other';
}

export type SortOption = 'cmc-asc' | 'cmc-desc' | 'name-asc' | 'name-desc' | 'color';

/**
 * Groups deck entries by their primary card type
 * @param entries - Array of deck entries to group
 * @param sortOption - How to sort cards within each type group
 * @returns Object with card types as keys and sorted arrays of entries as values
 */
export function groupCardsByType(
  entries: DeckEntry[],
  sortOption: SortOption = 'name-asc'
): Record<string, DeckEntry[]> {
  const groups: Record<string, DeckEntry[]> = {};
  
  // Group cards by type
  entries.forEach(entry => {
    const type = getPrimaryCardType(entry.card.type);
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(entry);
  });
  
  // Sort cards within each group
  Object.keys(groups).forEach(type => {
    groups[type].sort((a, b) => sortCards(a, b, sortOption));
  });
  
  return groups;
}

/**
 * Sorts two deck entries based on the specified sort option
 */
function sortCards(a: DeckEntry, b: DeckEntry, sortOption: SortOption): number {
  switch (sortOption) {
    case 'cmc-asc':
      const cmcDiff = (a.card.cmc || 0) - (b.card.cmc || 0);
      return cmcDiff !== 0 ? cmcDiff : a.card.name.localeCompare(b.card.name);
    
    case 'cmc-desc':
      const cmcDiffDesc = (b.card.cmc || 0) - (a.card.cmc || 0);
      return cmcDiffDesc !== 0 ? cmcDiffDesc : a.card.name.localeCompare(b.card.name);
    
    case 'name-asc':
      return a.card.name.localeCompare(b.card.name);
    
    case 'name-desc':
      return b.card.name.localeCompare(a.card.name);
    
    case 'color':
      const colorA = a.card.colors?.[0] || 'Z';
      const colorB = b.card.colors?.[0] || 'Z';
      const colorDiff = colorA.localeCompare(colorB);
      return colorDiff !== 0 ? colorDiff : a.card.name.localeCompare(b.card.name);
    
    default:
      return a.card.name.localeCompare(b.card.name);
  }
}

/**
 * Gets the ordered list of card types that have cards in them
 * @param groupedCards - Object with card types as keys
 * @returns Array of card types in standard display order
 */
export function getOrderedTypes(groupedCards: Record<string, DeckEntry[]>): string[] {
  const typesInDeck = Object.keys(groupedCards);
  
  // Filter CARD_TYPE_ORDER to only include types present in the deck
  const orderedTypes = CARD_TYPE_ORDER.filter(type => typesInDeck.includes(type));
  
  // Add any non-standard types at the end
  const otherTypes = typesInDeck.filter(type => !CARD_TYPE_ORDER.includes(type as CardType));
  
  return [...orderedTypes, ...otherTypes];
}

/**
 * Calculates CMC distribution for bar graph
 * @param entries - Array of deck entries
 * @returns Object with CMC values as keys and counts as values
 */
export function calculateCMCDistribution(entries: DeckEntry[]): Record<string, number> {
  const distribution: Record<string, number> = {};
  
  entries.forEach(entry => {
    const cmc = entry.card.cmc || 0;
    
    // Only count cards with CMC greater than 0
    if (cmc <= 0) {
      return;
    }
    
    const cmcKey = cmc >= 7 ? '7+' : cmc.toString();
    distribution[cmcKey] = (distribution[cmcKey] || 0) + entry.quantity;
  });
  
  return distribution;
}
