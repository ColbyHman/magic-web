import type { Deck, DeckEntry, ValidationResult, ValidationWarning } from '../types';

/**
 * Validates a deck according to its format rules
 */
export function validateDeck(deck: Deck): ValidationResult {
  switch (deck.format) {
    case 'standard':
      return validateStandardDeck(deck);
    case 'commander':
      return validateCommanderDeck(deck);
    case 'modern':
    case 'legacy':
    case 'vintage':
    case 'casual':
      return validateCasualDeck(deck);
    default:
      return { isValid: true, warnings: [] };
  }
}

/**
 * Validates a Standard format deck
 * Rules: 60-card minimum, max 4 copies (except basic lands), 15-card sideboard max
 */
function validateStandardDeck(deck: Deck): ValidationResult {
  const warnings: ValidationWarning[] = [];
  const mainDeck = deck.cards.filter(c => !c.isSideboard && !c.isCommander);
  const sideboard = deck.cards.filter(c => c.isSideboard);
  
  // Check deck size
  const mainDeckCount = mainDeck.reduce((sum, card) => sum + card.quantity, 0);
  if (mainDeckCount < 60) {
    warnings.push({
      severity: 'warning',
      message: `Deck has ${mainDeckCount} cards. Standard format requires at least 60 cards.`,
    });
  }
  
  // Check sideboard size
  const sideboardCount = sideboard.reduce((sum, card) => sum + card.quantity, 0);
  if (sideboardCount > 15) {
    warnings.push({
      severity: 'warning',
      message: `Sideboard has ${sideboardCount} cards. Standard allows a maximum of 15 sideboard cards.`,
    });
  }
  
  // Check for more than 4 copies of non-basic lands
  const cardCounts = new Map<string, number>();
  [...mainDeck, ...sideboard].forEach(entry => {
    const current = cardCounts.get(entry.card.name) || 0;
    cardCounts.set(entry.card.name, current + entry.quantity);
  });
  
  const basicLandTypes = ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest', 'Wastes'];
  const overLimitCards: string[] = [];
  
  cardCounts.forEach((count, cardName) => {
    if (count > 4 && !basicLandTypes.includes(cardName)) {
      overLimitCards.push(cardName);
    }
  });
  
  if (overLimitCards.length > 0) {
    warnings.push({
      severity: 'error',
      message: `The following cards exceed the 4-copy limit:`,
      cardNames: overLimitCards,
    });
  }
  
  // Check card legality in Standard
  const illegalCards = deck.cards.filter(entry => {
    const legality = entry.card.legalities?.standard;
    return legality && legality !== 'legal';
  });
  
  if (illegalCards.length > 0) {
    const bannedCards = illegalCards.filter(c => c.card.legalities?.standard === 'banned');
    const notLegalCards = illegalCards.filter(c => c.card.legalities?.standard === 'not_legal');
    
    if (bannedCards.length > 0) {
      warnings.push({
        severity: 'error',
        message: 'The following cards are banned in Standard:',
        cardNames: bannedCards.map(c => c.card.name),
      });
    }
    
    if (notLegalCards.length > 0) {
      warnings.push({
        severity: 'error',
        message: 'The following cards are not legal in Standard:',
        cardNames: notLegalCards.map(c => c.card.name),
      });
    }
  }
  
  return {
    isValid: warnings.filter(w => w.severity === 'error').length === 0,
    warnings,
  };
}

/**
 * Validates a Commander format deck
 * Rules: Exactly 100 cards (including commander), singleton (except basics), 
 * commander must be legendary, color identity must match
 */
function validateCommanderDeck(deck: Deck): ValidationResult {
  const warnings: ValidationWarning[] = [];
  const commanders = deck.cards.filter(c => c.isCommander);
  const mainDeck = deck.cards.filter(c => !c.isSideboard && !c.isCommander);
  
  // Check for commander
  if (commanders.length === 0) {
    warnings.push({
      severity: 'error',
      message: 'Commander deck must have at least one commander.',
    });
  } else if (commanders.length > 2) {
    warnings.push({
      severity: 'error',
      message: 'Commander deck cannot have more than 2 commanders.',
    });
  } else if (commanders.length === 2) {
    // Check if both commanders have Partner
    const bothHavePartner = commanders.every(cmd => 
      cmd.card.oracleText?.toLowerCase().includes('partner')
    );
    
    if (!bothHavePartner) {
      warnings.push({
        severity: 'error',
        message: 'Both commanders must have the Partner keyword to be used together.',
        cardNames: commanders.map(c => c.card.name),
      });
    }
  }
  
  // Check if commanders are legendary
  commanders.forEach(commander => {
    if (commander.card.type && !commander.card.type.toLowerCase().includes('legendary')) {
      warnings.push({
        severity: 'error',
        message: 'Commander must be a legendary creature or planeswalker.',
        cardNames: [commander.card.name],
      });
    }
  });
  
  // Check total deck size (including commander)
  const totalCards = deck.cards.reduce((sum, entry) => {
    if (entry.isCommander) return sum + 1; // Commanders count as 1 regardless of quantity field
    return sum + entry.quantity;
  }, 0);
  
  if (totalCards !== 100) {
    warnings.push({
      severity: 'warning',
      message: `Deck has ${totalCards} cards. Commander format requires exactly 100 cards (including commander).`,
    });
  }
  
  // Check singleton rule (except basic lands)
  const basicLandTypes = ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest', 'Wastes'];
  const duplicateCards: string[] = [];
  
  mainDeck.forEach(entry => {
    if (entry.quantity > 1 && !basicLandTypes.includes(entry.card.name)) {
      duplicateCards.push(entry.card.name);
    }
  });
  
  if (duplicateCards.length > 0) {
    warnings.push({
      severity: 'error',
      message: 'Commander format allows only 1 copy of each card (except basic lands):',
      cardNames: duplicateCards,
    });
  }
  
  // Check color identity
  if (commanders.length > 0) {
    const commanderColorIdentity = new Set<string>();
    commanders.forEach(cmd => {
      cmd.card.colorIdentity?.forEach(color => commanderColorIdentity.add(color));
    });
    
    const offColorCards: string[] = [];
    mainDeck.forEach(entry => {
      if (entry.card.colorIdentity) {
        const hasOffColorIdentity = entry.card.colorIdentity.some(
          color => !commanderColorIdentity.has(color)
        );
        if (hasOffColorIdentity) {
          offColorCards.push(entry.card.name);
        }
      }
    });
    
    if (offColorCards.length > 0) {
      warnings.push({
        severity: 'error',
        message: "The following cards don't match your commander's color identity:",
        cardNames: offColorCards,
      });
    }
  }
  
  // Check card legality in Commander
  const illegalCards = deck.cards.filter(entry => {
    const legality = entry.card.legalities?.commander;
    return legality && legality !== 'legal';
  });
  
  if (illegalCards.length > 0) {
    const bannedCards = illegalCards.filter(c => c.card.legalities?.commander === 'banned');
    const notLegalCards = illegalCards.filter(c => c.card.legalities?.commander === 'not_legal');
    
    if (bannedCards.length > 0) {
      warnings.push({
        severity: 'error',
        message: 'The following cards are banned in Commander:',
        cardNames: bannedCards.map(c => c.card.name),
      });
    }
    
    if (notLegalCards.length > 0) {
      warnings.push({
        severity: 'error',
        message: 'The following cards are not legal in Commander:',
        cardNames: notLegalCards.map(c => c.card.name),
      });
    }
  }
  
  return {
    isValid: warnings.filter(w => w.severity === 'error').length === 0,
    warnings,
  };
}

/**
 * Basic validation for casual formats
 */
function validateCasualDeck(deck: Deck): ValidationResult {
  const warnings: ValidationWarning[] = [];
  const mainDeck = deck.cards.filter(c => !c.isSideboard && !c.isCommander);
  
  // Just check for reasonable deck size
  const mainDeckCount = mainDeck.reduce((sum, entry) => sum + entry.quantity, 0);
  if (mainDeckCount < 40) {
    warnings.push({
      severity: 'warning',
      message: `Deck has ${mainDeckCount} cards. Most formats require at least 60 cards.`,
    });
  }
  
  return {
    isValid: true,
    warnings,
  };
}

/**
 * Calculate deck statistics
 */
export function calculateDeckStats(deck: Deck) {
  const mainDeck = deck.cards.filter(c => !c.isSideboard && !c.isCommander);
  const sideboard = deck.cards.filter(c => c.isSideboard);
  const commanders = deck.cards.filter(c => c.isCommander);
  
  const mainDeckCount = mainDeck.reduce((sum, entry) => sum + entry.quantity, 0);
  const sideboardCount = sideboard.reduce((sum, entry) => sum + entry.quantity, 0);
  
  // Calculate average CMC
  let totalCMC = 0;
  let totalCards = 0;
  mainDeck.forEach(entry => {
    if (entry.card.cmc !== undefined) {
      totalCMC += entry.card.cmc * entry.quantity;
      totalCards += entry.quantity;
    }
  });
  
  const averageCMC = totalCards > 0 ? totalCMC / totalCards : 0;
  
  // Calculate mana curve
  const manaCurve: Record<number, number> = {};
  mainDeck.forEach(entry => {
    if (entry.card.cmc !== undefined) {
      const cmc = Math.min(entry.card.cmc, 7); // 7+ grouped together
      manaCurve[cmc] = (manaCurve[cmc] || 0) + entry.quantity;
    }
  });
  
  // Calculate color distribution
  const colorDistribution: Record<string, number> = {};
  mainDeck.forEach(entry => {
    entry.card.colorIdentity?.forEach(color => {
      colorDistribution[color] = (colorDistribution[color] || 0) + entry.quantity;
    });
  });
  
  // Calculate type distribution
  const typeDistribution: Record<string, number> = {};
  mainDeck.forEach(entry => {
    if (entry.card.type) {
      // Extract main type (e.g., "Creature" from "Creature — Human Wizard")
      const mainType = entry.card.type.split('—')[0].trim().split(' ')[0];
      typeDistribution[mainType] = (typeDistribution[mainType] || 0) + entry.quantity;
    }
  });
  
  return {
    totalCards: mainDeckCount + sideboardCount + commanders.length,
    mainDeckCount,
    sideboardCount,
    commanderCount: commanders.length,
    averageCMC: parseFloat(averageCMC.toFixed(2)),
    manaCurve,
    colorDistribution,
    typeDistribution,
  };
}

/**
 * Check if a card has the Partner keyword
 */
export function hasPartnerKeyword(entry: DeckEntry): boolean {
  return entry.card.oracleText?.toLowerCase().includes('partner') || false;
}

/**
 * Get color identity from a card
 */
export function getColorIdentity(entry: DeckEntry): string[] {
  return entry.card.colorIdentity || [];
}
