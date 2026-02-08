export interface ParsedCard {
  quantity: number;
  name: string;
  set?: string;
  collectorNumber?: string;
  category?: string;
  isSideboard: boolean;
  isCommander: boolean;
  originalLine: string;
}

export interface ParsedDeckList {
  deckName?: string;
  cards: ParsedCard[];
}

/**
 * Parses Archidekt format deck lists
 * Format: {quantity}x {name} ({set}) {collector number} {foil indicator} [{category}] ^{color tag data}^
 * 
 * Examples:
 * - "4x Lightning Bolt (2XM) 97 [Removal]"
 * - "1 Sol Ring (C21) 263"
 * - "Commander: Atraxa, Praetors' Voice (C16) 28 [Commander]"
 */
export function parseArchidektFormat(deckListText: string): ParsedDeckList {
  const lines = deckListText.trim().split('\n');
  const cards: ParsedCard[] = [];
  let deckName: string | undefined;
  let currentSection: 'main' | 'sideboard' | 'commander' = 'main';

  // Regex to match card lines
  // Captures: quantity (with/without x), name, set (optional), collector number (optional), category (optional)
  const cardRegex = /^(\d+)x?\s+([^([]+?)(?:\s+\(([^)]+)\)(?:\s+(\S+))?)?(?:\s+\*F\*)?(?:\s+\[([^\]]+)\])?(?:\s+\^[^^]+\^)?$/i;

  // Common card types that should reset section to main
  const cardTypeHeaders = [
    'creature', 'creatures',
    'artifact', 'artifacts',
    'enchantment', 'enchantments',
    'instant', 'instants',
    'sorcery', 'sorceries',
    'planeswalker', 'planeswalkers',
    'land', 'lands',
    'battle', 'battles',
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;

    // Check for section headers
    const lowerLine = line.toLowerCase();
    if (lowerLine === 'sideboard' || lowerLine === 'sideboard:') {
      currentSection = 'sideboard';
      continue;
    }
    if (lowerLine === 'commander' || lowerLine === 'commander:') {
      currentSection = 'commander';
      continue;
    }
    if (lowerLine === 'mainboard' || lowerLine === 'mainboard:' || lowerLine === 'deck' || lowerLine === 'deck:') {
      currentSection = 'main';
      continue;
    }
    
    // Check if this is a card type header (should reset to main deck)
    if (cardTypeHeaders.includes(lowerLine) || cardTypeHeaders.includes(lowerLine.replace(':', ''))) {
      currentSection = 'main';
      continue;
    }

    // Try to parse as a card line
    const match = cardRegex.exec(line);
    
    if (match) {
      const [, quantityStr, name, set, collectorNumber, category] = match;
      
      const parsedCard: ParsedCard = {
        quantity: parseInt(quantityStr, 10),
        name: name.trim(),
        set: set?.trim().toUpperCase(),
        collectorNumber: collectorNumber?.trim(),
        category: category?.trim(),
        isSideboard: currentSection === 'sideboard' || category?.toLowerCase() === 'sideboard',
        isCommander: currentSection === 'commander' || category?.toLowerCase() === 'commander',
        originalLine: line,
      };

      cards.push(parsedCard);
    } else if (i === 0 && !deckName) {
      // First line that doesn't match card format is likely the deck name
      // Remove common prefixes like "Deck: " or just use the line as-is
      deckName = line.replace(/^(deck|decklist):\s*/i, '').trim();
    }
  }

  return {
    deckName: deckName || undefined,
    cards,
  };
}

/**
 * Parses Moxfield format deck lists
 * Format: {quantity} {name} ({set}) {collector number} [*F*]
 * 
 * In Moxfield exports:
 * - The commander(s) are listed FIRST (not alphabetically)
 * - Remaining cards are in alphabetical order
 * - Foil cards are marked with *F*
 * - Format includes set code and collector number
 * 
 * Examples:
 * - "1 Atraxa, Praetors' Voice (C16) 28"
 * - "4 Lightning Bolt (2XM) 97 *F*"
 * - "1 Sol Ring (C21) 263"
 */
export function parseMoxfieldFormat(deckListText: string): ParsedDeckList {
  const lines = deckListText.trim().split('\n');
  const cards: ParsedCard[] = [];
  let deckName: string | undefined;
  let currentSection: 'main' | 'sideboard' | 'commander' = 'main';
  let commanderCount = 0;
  let totalCardsProcessed = 0;

  // Regex to match card lines (includes optional *F* foil marker)
  // Captures: quantity, name, set (optional), collector number (optional), foil marker (optional)
  const cardRegex = /^(\d+)\s+([^(]+?)(?:\s+\(([^)]+)\)(?:\s+(\S+?))?)?(?:\s+\*F\*)?$/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;

    // Check for section headers
    const lowerLine = line.toLowerCase();
    if (lowerLine === 'sideboard' || lowerLine === 'sideboard:') {
      currentSection = 'sideboard';
      continue;
    }
    if (lowerLine.startsWith('commander:')) {
      currentSection = 'commander';
      // Try to parse the commander card on the same line
      const commanderLine = line.substring(10).trim();
      if (commanderLine) {
        const match = cardRegex.exec(commanderLine);
        if (match) {
          const [, quantityStr, name, set, collectorNumber] = match;
          cards.push({
            quantity: parseInt(quantityStr, 10),
            name: name.trim(),
            set: set?.trim().toUpperCase(),
            collectorNumber: collectorNumber?.trim(),
            category: 'Commander',
            isSideboard: false,
            isCommander: true,
            originalLine: line,
          });
          commanderCount++;
        }
      }
      continue;
    }
    if (lowerLine === 'deck' || lowerLine === 'deck:' || lowerLine === 'mainboard' || lowerLine === 'mainboard:') {
      currentSection = 'main';
      continue;
    }

    // Try to parse as a card line
    const match = cardRegex.exec(line);
    
    if (match) {
      const [, quantityStr, name, set, collectorNumber] = match;
      const quantity = parseInt(quantityStr, 10);
      const cardName = name.trim();
      
      // Auto-detect commanders: In Moxfield, the first singleton card is the commander
      // For partner commanders, both must have "Partner" in oracle text - this should be
      // validated after import since we don't have oracle text during parsing
      let isCommander = false;
      if (currentSection === 'commander') {
        isCommander = true;
        commanderCount++;
      } else if (currentSection === 'main' && totalCardsProcessed === 0 && quantity === 1 && commanderCount === 0) {
        // Only mark the very first card as commander if it's a singleton
        isCommander = true;
        commanderCount++;
      }
      
      totalCardsProcessed++;
      
      const parsedCard: ParsedCard = {
        quantity: quantity,
        name: cardName,
        set: set?.trim().toUpperCase(),
        collectorNumber: collectorNumber?.trim(),
        category: currentSection === 'sideboard' ? 'Sideboard' : isCommander ? 'Commander' : undefined,
        isSideboard: currentSection === 'sideboard',
        isCommander: isCommander,
        originalLine: line,
      };

      cards.push(parsedCard);
    } else if (i === 0 && !deckName) {
      // First line that doesn't match card format is likely the deck name
      deckName = line.replace(/^(deck|decklist):\s*/i, '').trim();
    }
  }

  return {
    deckName: deckName || undefined,
    cards,
  };
}

/**
 * Parse a deck list based on the specified platform
 */
export type DeckPlatform = 'archidekt' | 'moxfield';

export function parseDeckList(deckListText: string, platform: DeckPlatform): ParsedDeckList {
  switch (platform) {
    case 'archidekt':
      return parseArchidektFormat(deckListText);
    case 'moxfield':
      return parseMoxfieldFormat(deckListText);
    default:
      return parseArchidektFormat(deckListText);
  }
}

/**
 * Future: Add parsers for other platforms
 * - MTGO format
 * - MTG Arena format
 * - etc.
 */
