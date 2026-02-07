import type { Card, GameCard } from '../types';
import { Zone } from '../types';
import { preloadCards } from './cardCache';
import { createGameCard } from '../store/gameStore';

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
 * Initialize cards by fetching from Scryfall (with caching)
 */
export async function initializeCards(): Promise<GameCard[]> {
  console.log('Initializing cards from Scryfall...');
  
  const cards = await preloadCards(cardNames);
  
  // Create a map for easy lookup
  const cardMap = new Map<string, Card>();
  cards.forEach(card => {
    cardMap.set(card.name.toLowerCase(), card);
  });

  // Helper to get card or null
  const getCard = (name: string) => cardMap.get(name.toLowerCase());

  const gameCards: GameCard[] = [];

  // Hand cards
  const venom = getCard('Venom, Evil Unleashed');
  if (venom) gameCards.push(createGameCard(venom, Zone.HAND, { row: 0, col: 2 }));

  const ezio = getCard('Ezio, Brash Novice');
  if (ezio) gameCards.push(createGameCard(ezio, Zone.HAND, { row: 0, col: 3 }));

  const lightning = getCard('Lightning Bolt');
  if (lightning) gameCards.push(createGameCard(lightning, Zone.HAND, { row: 0, col: 4 }));

  const counterspell = getCard('Counterspell');
  if (counterspell) gameCards.push(createGameCard(counterspell, Zone.HAND, { row: 0, col: 6 }));

  const fireball = getCard('Fireball');
  if (fireball) gameCards.push(createGameCard(fireball, Zone.HAND, { row: 0, col: 7 }));

  const goblin = getCard('Goblin Guide');
  if (goblin) gameCards.push(createGameCard(goblin, Zone.HAND, { row: 0, col: 8 }));

  const forestHand = getCard('Forest');
  if (forestHand) gameCards.push(createGameCard(forestHand, Zone.HAND, { row: 0, col: 9 }));

  // Battlefield cards
  const solRing = getCard('Sol Ring');
  if (solRing) gameCards.push(createGameCard(solRing, Zone.BATTLEFIELD, { row: 0, col: 2 }));

  const tarmogoyf = getCard('Tarmogoyf');
  if (tarmogoyf) gameCards.push(createGameCard(tarmogoyf, Zone.BATTLEFIELD, { row: 0, col: 5 }));

  const ancestral = getCard('Ancestral Recall');
  if (ancestral) gameCards.push(createGameCard(ancestral, Zone.BATTLEFIELD, { row: 1, col: 7 }));

  // Lands
  const mountain = getCard('Mountain');
  if (mountain) {
    gameCards.push(createGameCard(mountain, Zone.LANDS, { row: 0, col: 3 }));
    gameCards.push(createGameCard(mountain, Zone.LANDS, { row: 0, col: 6 }));
  }

  const island = getCard('Island');
  if (island) gameCards.push(createGameCard(island, Zone.LANDS, { row: 0, col: 4 }));

  const forest = getCard('Forest');
  if (forest) gameCards.push(createGameCard(forest, Zone.LANDS, { row: 0, col: 5 }));

  console.log(`Initialized ${gameCards.length} cards`);
  return gameCards;
}
