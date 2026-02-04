import type { Card } from '../types';
import { Zone } from '../types';
import { preloadCards, type ScryfallCard } from './cardCache';

// Card names we want to load
const cardNames = [
  'Venom, Evil Unleashed',
  'Ezio, Brash Novice',
  'Lightning Bolt',
  'Counterspell',
  'Fireball',
  'Goblin Guide',
  'Forest',
  'Sol Ring',
  'Tarmogoyf',
  'Ancestral Recall',
  'Mountain',
  'Island',
];

/**
 * Converts Scryfall card data to our Card type
 */
function convertToCard(scryfallCard: ScryfallCard, id: string, zone: Zone, position?: { row: number; col: number }): Card {
  return {
    id,
    name: scryfallCard.name,
    manaCost: scryfallCard.mana_cost || '',
    type: scryfallCard.type_line,
    zone,
    tapped: false,
    position,
    imageUrl: scryfallCard.image_uris?.large || scryfallCard.image_uris?.normal,
  };
}

/**
 * Initialize cards by fetching from Scryfall (with caching)
 */
export async function initializeCards(): Promise<Card[]> {
  console.log('Initializing cards from Scryfall...');
  
  const scryfallCards = await preloadCards(cardNames);
  
  // Create a map for easy lookup
  const cardMap = new Map<string, ScryfallCard>();
  scryfallCards.forEach(card => {
    cardMap.set(card.name.toLowerCase(), card);
  });

  // Helper to get card or null
  const getCard = (name: string) => cardMap.get(name.toLowerCase());

  const cards: Card[] = [];

  // Hand cards
  const venom = getCard('Venom, Evil Unleashed');
  if (venom) cards.push(convertToCard(venom, 'venom', Zone.HAND, { row: 0, col: 2 }));

  const ezio = getCard('Ezio, Brash Novice');
  if (ezio) cards.push(convertToCard(ezio, 'ezio', Zone.HAND, { row: 0, col: 3 }));

  const lightning = getCard('Lightning Bolt');
  if (lightning) cards.push(convertToCard(lightning, 'lightning', Zone.HAND, { row: 0, col: 4 }));

  const counterspell = getCard('Counterspell');
  if (counterspell) cards.push(convertToCard(counterspell, 'counterspell', Zone.HAND, { row: 0, col: 6 }));

  const fireball = getCard('Fireball');
  if (fireball) cards.push(convertToCard(fireball, 'fireball', Zone.HAND, { row: 0, col: 7 }));

  const goblin = getCard('Goblin Guide');
  if (goblin) cards.push(convertToCard(goblin, 'goblin', Zone.HAND, { row: 0, col: 8 }));

  const forestHand = getCard('Forest');
  if (forestHand) cards.push(convertToCard(forestHand, 'forest-hand', Zone.HAND, { row: 0, col: 9 }));

  // Battlefield cards
  const solRing = getCard('Sol Ring');
  if (solRing) cards.push(convertToCard(solRing, 'sol-ring', Zone.BATTLEFIELD, { row: 0, col: 2 }));

  const tarmogoyf = getCard('Tarmogoyf');
  if (tarmogoyf) cards.push(convertToCard(tarmogoyf, 'tarmogoyf', Zone.BATTLEFIELD, { row: 0, col: 5 }));

  const ancestral = getCard('Ancestral Recall');
  if (ancestral) cards.push(convertToCard(ancestral, 'ancestral', Zone.BATTLEFIELD, { row: 1, col: 7 }));

  // Lands
  const mountain = getCard('Mountain');
  if (mountain) {
    cards.push(convertToCard(mountain, 'mountain-1', Zone.LANDS, { row: 0, col: 3 }));
    cards.push(convertToCard(mountain, 'mountain-2', Zone.LANDS, { row: 0, col: 6 }));
  }

  const island = getCard('Island');
  if (island) cards.push(convertToCard(island, 'island-1', Zone.LANDS, { row: 0, col: 4 }));

  const forest = getCard('Forest');
  if (forest) cards.push(convertToCard(forest, 'forest-1', Zone.LANDS, { row: 0, col: 5 }));

  console.log(`Initialized ${cards.length} cards`);
  return cards;
}
