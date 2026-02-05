import type { Card } from '../types';

// Sample card data for the vault - no external API calls needed
const sampleVaultCards = [
  // White Cards
  {
    id: 'swords-to-plowshares',
    name: 'Swords to Plowshares',
    manaCost: '{W}',
    type: 'Instant',
    colors: ['W'],
    rarity: 'Rare',
    set: 'LEA',
    collector_number: '1',
    oracle_text: 'Exile target creature. Its controller gains life equal to its power.',
    keywords: ['Exile'],
    imageUrl: 'https://cards.scryfall.io/large/front/2/8/28c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c0b.jpg?1592761474'
  },
  {
    id: 'path-to-exile',
    name: 'Path to Exile',
    manaCost: '{W}',
    type: 'Instant',
    colors: ['W'],
    rarity: 'Uncommon',
    set: 'CON',
    collector_number: '1',
    oracle_text: 'Exile target creature. Its controller may search their library for a basic land card, put it onto the battlefield, then shuffle.',
    keywords: ['Exile', 'Search'],
    imageUrl: 'https://cards.scryfall.io/large/front/3/9/39c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c0c.jpg?1592761474'
  },
  {
    id: 'wrath-of-god',
    name: 'Wrath of God',
    manaCost: '{2}{W}{W}',
    type: 'Sorcery',
    colors: ['W'],
    rarity: 'Rare',
    set: 'LEA',
    collector_number: '2',
    oracle_text: 'Destroy all creatures. They can\'t be regenerated.',
    keywords: ['Destroy', 'Regeneration'],
    imageUrl: 'https://cards.scryfall.io/large/front/4/0/40c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c0d.jpg?1592761474'
  },
  {
    id: 'serra-angel',
    name: 'Serra Angel',
    manaCost: '{3}{W}{W}',
    type: 'Creature — Angel',
    colors: ['W'],
    rarity: 'Rare',
    set: 'LEA',
    collector_number: '3',
    power: '4',
    toughness: '4',
    oracle_text: 'Flying, vigilance',
    keywords: ['Flying', 'Vigilance'],
    imageUrl: 'https://cards.scryfall.io/large/front/5/1/51c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c0e.jpg?1592761474'
  },
  {
    id: 'gideon-ally-of-zendikar',
    name: 'Gideon, Ally of Zendikar',
    manaCost: '{2}{W}{W}',
    type: 'Planeswalker — Gideon',
    colors: ['W'],
    rarity: 'Mythic Rare',
    set: 'BFZ',
    collector_number: '1',
    oracle_text: '+1: Create a 2/2 white Knight creature token with vigilance.\n-2: Target creature gets +2/+2 until end of turn.\n-7: You get an emblem with "Creatures you control get +2/+2 and have vigilance."',
    keywords: ['Token', 'Emblem'],
    imageUrl: 'https://cards.scryfall.io/large/front/6/2/62c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c0f.jpg?1592761474'
  },

  // Blue Cards
  {
    id: 'ancestral-recall',
    name: 'Ancestral Recall',
    manaCost: '{U}',
    type: 'Instant',
    colors: ['U'],
    rarity: 'Rare',
    set: 'LEA',
    collector_number: '4',
    oracle_text: 'Target player draws three cards.',
    keywords: ['Draw'],
    imageUrl: 'https://cards.scryfall.io/large/front/7/3/73c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c10.jpg?1592761474'
  },
  {
    id: 'counterspell',
    name: 'Counterspell',
    manaCost: '{U}{U}',
    type: 'Instant',
    colors: ['U'],
    rarity: 'Uncommon',
    set: 'LEA',
    collector_number: '5',
    oracle_text: 'Counter target spell.',
    keywords: ['Counter'],
    imageUrl: 'https://cards.scryfall.io/large/front/8/4/84c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c11.jpg?1592761474'
  },
  {
    id: 'brainstorm',
    name: 'Brainstorm',
    manaCost: '{U}',
    type: 'Instant',
    colors: ['U'],
    rarity: 'Common',
    set: 'LEA',
    collector_number: '6',
    oracle_text: 'Draw three cards, then put two cards from your hand on top of your library in any order.',
    keywords: ['Draw'],
    imageUrl: 'https://cards.scryfall.io/large/front/9/5/95c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c12.jpg?1592761474'
  },
  {
    id: 'snapcaster-mage',
    name: 'Snapcaster Mage',
    manaCost: '{1}{U}',
    type: 'Creature — Human Wizard',
    colors: ['U'],
    rarity: 'Mythic Rare',
    set: 'ISD',
    collector_number: '2',
    power: '2',
    toughness: '1',
    oracle_text: 'Flash\nWhen Snapcaster Mage enters the battlefield, target instant or sorcery card in your graveyard gains flashback until end of turn. The flashback cost is equal to its mana cost.',
    keywords: ['Flash', 'Flashback'],
    imageUrl: 'https://cards.scryfall.io/large/front/0/6/06c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c13.jpg?1592761474'
  },
  {
    id: 'jace-mind-sculptor',
    name: 'Jace, the Mind Sculptor',
    manaCost: '{2}{U}{U}',
    type: 'Planeswalker — Jace',
    colors: ['U'],
    rarity: 'Mythic Rare',
    set: 'WWK',
    collector_number: '1',
    oracle_text: '+1: Draw a card, then discard a card.\n-2: Target player mills three cards.\n-8: You get an emblem with "You may cast nonland cards from your hand without paying their mana costs."',
    keywords: ['Draw', 'Mill', 'Emblem'],
    imageUrl: 'https://cards.scryfall.io/large/front/1/7/17c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c14.jpg?1592761474'
  },

  // Black Cards
  {
    id: 'dark-ritual',
    name: 'Dark Ritual',
    manaCost: '{B}',
    type: 'Instant',
    colors: ['B'],
    rarity: 'Common',
    set: 'LEA',
    collector_number: '7',
    oracle_text: 'Add {B}{B}{B}.',
    keywords: ['Mana'],
    imageUrl: 'https://cards.scryfall.io/large/front/2/8/28c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c15.jpg?1592761474'
  },
  {
    id: 'demonic-tutor',
    name: 'Demonic Tutor',
    manaCost: '{1}{B}',
    type: 'Sorcery',
    colors: ['B'],
    rarity: 'Rare',
    set: 'LEA',
    collector_number: '8',
    oracle_text: 'Search your library for a card, put that card into your hand, then shuffle.',
    keywords: ['Search'],
    imageUrl: 'https://cards.scryfall.io/large/front/3/9/39c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c16.jpg?1592761474'
  },
  {
    id: 'thoughtseize',
    name: 'Thoughtseize',
    manaCost: '{B}',
    type: 'Sorcery',
    colors: ['B'],
    rarity: 'Rare',
    set: 'LRW',
    collector_number: '3',
    oracle_text: 'Target player reveals their hand. You choose a nonland card from it. That player discards that card. You lose 2 life.',
    keywords: ['Discard'],
    imageUrl: 'https://cards.scryfall.io/large/front/4/0/40c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c17.jpg?1592761474'
  },
  {
    id: 'liliana-veil',
    name: 'Liliana of the Veil',
    manaCost: '{1}{B}{B}',
    type: 'Planeswalker — Liliana',
    colors: ['B'],
    rarity: 'Mythic Rare',
    set: 'ISD',
    collector_number: '4',
    oracle_text: '+1: Each player discards a card.\n-2: Target player sacrifices a creature.\n-6: Target player sacrifices two permanents and discards their hand.',
    keywords: ['Discard', 'Sacrifice'],
    imageUrl: 'https://cards.scryfall.io/large/front/5/1/51c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c18.jpg?1592761474'
  },
  {
    id: 'grave-titan',
    name: 'Grave Titan',
    manaCost: '{4}{B}{B}',
    type: 'Creature — Giant',
    colors: ['B'],
    rarity: 'Mythic Rare',
    set: 'M11',
    collector_number: '5',
    power: '6',
    toughness: '6',
    oracle_text: 'Deathtouch\nWhenever Grave Titan attacks, you may create two 2/2 black Zombie creature tokens.',
    keywords: ['Deathtouch', 'Token'],
    imageUrl: 'https://cards.scryfall.io/large/front/6/2/62c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c19.jpg?1592761474'
  },

  // Red Cards
  {
    id: 'lightning-bolt',
    name: 'Lightning Bolt',
    manaCost: '{R}',
    type: 'Instant',
    colors: ['R'],
    rarity: 'Common',
    set: 'LEA',
    collector_number: '9',
    oracle_text: 'Lightning Bolt deals 3 damage to any target.',
    keywords: ['Damage'],
    imageUrl: 'https://cards.scryfall.io/large/front/7/3/73c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c1a.jpg?1592761474'
  },
  {
    id: 'goblin-guide',
    name: 'Goblin Guide',
    manaCost: '{R}',
    type: 'Creature — Goblin Scout',
    colors: ['R'],
    rarity: 'Rare',
    set: 'ZEN',
    collector_number: '6',
    power: '2',
    toughness: '2',
    oracle_text: 'Haste\nWhenever Goblin Guide attacks, defending player reveals the top card of their library. If it\'s a land card, that player puts it into their hand.',
    keywords: ['Haste'],
    imageUrl: 'https://cards.scryfall.io/large/front/8/4/84c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c1b.jpg?1592761474'
  },
  {
    id: 'young-pyromancer',
    name: 'Young Pyromancer',
    manaCost: '{1}{R}',
    type: 'Creature — Human Shaman',
    colors: ['R'],
    rarity: 'Rare',
    set: 'M14',
    collector_number: '7',
    power: '2',
    toughness: '1',
    oracle_text: 'Whenever you cast an instant or sorcery spell, create a 1/1 red Elemental creature token.',
    keywords: ['Token'],
    imageUrl: 'https://cards.scryfall.io/large/front/9/5/95c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c1c.jpg?1592761474'
  },
  {
    id: 'monastery-swiftspear',
    name: 'Monastery Swiftspear',
    manaCost: '{R}',
    type: 'Creature — Human Monk',
    colors: ['R'],
    rarity: 'Rare',
    set: 'FRF',
    collector_number: '8',
    power: '1',
    toughness: '2',
    oracle_text: 'Prowess\nHaste',
    keywords: ['Prowess', 'Haste'],
    imageUrl: 'https://cards.scryfall.io/large/front/0/6/06c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c1d.jpg?1592761474'
  },
  {
    id: 'arclight-phoenix',
    name: 'Arclight Phoenix',
    manaCost: '{2}{R}{R}',
    type: 'Creature — Phoenix',
    colors: ['R'],
    rarity: 'Mythic Rare',
    set: 'GRN',
    collector_number: '9',
    power: '3',
    toughness: '2',
    oracle_text: 'Flying, haste\nWhenever you cast your third instant or sorcery spell each turn, return Arclight Phoenix from your graveyard to the battlefield at the beginning of the next end step.',
    keywords: ['Flying', 'Haste'],
    imageUrl: 'https://cards.scryfall.io/large/front/1/7/17c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c1e.jpg?1592761474'
  },

  // Green Cards
  {
    id: 'tarmogoyf',
    name: 'Tarmogoyf',
    manaCost: '{1}{G}',
    type: 'Creature — Lhurgoyf',
    colors: ['G'],
    rarity: 'Mythic Rare',
    set: 'FUT',
    collector_number: '10',
    power: '*',
    toughness: '1+*',
    oracle_text: 'Tarmogoyf\'s power is equal to the number of card types among cards in all graveyards and its toughness is equal to that number plus 1.',
    keywords: [],
    imageUrl: 'https://cards.scryfall.io/large/front/2/8/28c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c1f.jpg?1592761474'
  },
  {
    id: 'noble-hierarch',
    name: 'Noble Hierarch',
    manaCost: '{G}',
    type: 'Creature — Human Cleric',
    colors: ['G'],
    rarity: 'Rare',
    set: 'CON',
    collector_number: '11',
    power: '1',
    toughness: '1',
    oracle_text: 'Exalted ({G}: Whenever a creature you control attacks alone, that creature gets +1/+1 until end of turn.)\n{T}: Add {G}, {W}, or {U}.',
    keywords: ['Exalted', 'Mana'],
    imageUrl: 'https://cards.scryfall.io/large/front/3/9/39c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c20.jpg?1592761474'
  },
  {
    id: 'birds-of-paradise',
    name: 'Birds of Paradise',
    manaCost: '{G}',
    type: 'Creature — Bird',
    colors: ['G'],
    rarity: 'Rare',
    set: 'LEA',
    collector_number: '11',
    power: '0',
    toughness: '1',
    oracle_text: 'Flying\n{T}: Add one mana of any color.',
    keywords: ['Flying', 'Mana'],
    imageUrl: 'https://cards.scryfall.io/large/front/4/0/40c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c21.jpg?1592761474'
  },
  {
    id: 'giant-growth',
    name: 'Giant Growth',
    manaCost: '{G}',
    type: 'Instant',
    colors: ['G'],
    rarity: 'Common',
    set: 'LEA',
    collector_number: '12',
    oracle_text: 'Target creature gets +3/+3 until end of turn.',
    keywords: ['Pump'],
    imageUrl: 'https://cards.scryfall.io/large/front/5/1/51c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c22.jpg?1592761474'
  },
  {
    id: 'primeval-titan',
    name: 'Primeval Titan',
    manaCost: '{4}{G}{G}',
    type: 'Creature — Giant',
    colors: ['G'],
    rarity: 'Mythic Rare',
    set: 'M11',
    collector_number: '12',
    power: '6',
    toughness: '6',
    oracle_text: 'Trample\nWhenever Primeval Titan enters the battlefield or attacks, you may search your library for up to two land cards, put them onto the battlefield tapped, then shuffle.',
    keywords: ['Trample', 'Search'],
    imageUrl: 'https://cards.scryfall.io/large/front/6/2/62c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c23.jpg?1592761474'
  },

  // Colorless/Artifacts
  {
    id: 'sol-ring',
    name: 'Sol Ring',
    manaCost: '{1}',
    type: 'Artifact',
    colors: [],
    rarity: 'Rare',
    set: 'LEA',
    collector_number: '13',
    oracle_text: '{T}: Add {C}{C}.',
    keywords: ['Mana'],
    imageUrl: 'https://cards.scryfall.io/large/front/7/3/73c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c24.jpg?1592761474'
  },
  {
    id: 'black-lotus',
    name: 'Black Lotus',
    manaCost: '{0}',
    type: 'Artifact',
    colors: [],
    rarity: 'Rare',
    set: 'LEA',
    collector_number: '14',
    oracle_text: '{T}, Sacrifice Black Lotus: Add three mana of any one color.',
    keywords: ['Mana'],
    imageUrl: 'https://cards.scryfall.io/large/front/8/4/84c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c25.jpg?1592761474'
  },
  {
    id: 'mox-sapphire',
    name: 'Mox Sapphire',
    manaCost: '{0}',
    type: 'Artifact',
    colors: [],
    rarity: 'Rare',
    set: 'LEA',
    collector_number: '15',
    oracle_text: '{T}: Add {U}.',
    keywords: ['Mana'],
    imageUrl: 'https://cards.scryfall.io/large/front/9/5/95c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c26.jpg?1592761474'
  },
  {
    id: 'mox-jet',
    name: 'Mox Jet',
    manaCost: '{0}',
    type: 'Artifact',
    colors: [],
    rarity: 'Rare',
    set: 'LEA',
    collector_number: '16',
    oracle_text: '{T}: Add {B}.',
    keywords: ['Mana'],
    imageUrl: 'https://cards.scryfall.io/large/front/0/6/06c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c27.jpg?1592761474'
  },
  {
    id: 'mox-pearl',
    name: 'Mox Pearl',
    manaCost: '{0}',
    type: 'Artifact',
    colors: [],
    rarity: 'Rare',
    set: 'LEA',
    collector_number: '17',
    oracle_text: '{T}: Add {W}.',
    keywords: ['Mana'],
    imageUrl: 'https://cards.scryfall.io/large/front/1/7/17c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c28.jpg?1592761474'
  },
  {
    id: 'mox-ruby',
    name: 'Mox Ruby',
    manaCost: '{0}',
    type: 'Artifact',
    colors: [],
    rarity: 'Rare',
    set: 'LEA',
    collector_number: '18',
    oracle_text: '{T}: Add {R}.',
    keywords: ['Mana'],
    imageUrl: 'https://cards.scryfall.io/large/front/2/8/28c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c29.jpg?1592761474'
  },
  {
    id: 'mox-emerald',
    name: 'Mox Emerald',
    manaCost: '{0}',
    type: 'Artifact',
    colors: [],
    rarity: 'Rare',
    set: 'LEA',
    collector_number: '19',
    oracle_text: '{T}: Add {G}.',
    keywords: ['Mana'],
    imageUrl: 'https://cards.scryfall.io/large/front/3/9/39c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c2a.jpg?1592761474'
  },
  {
    id: 'mana-crypt',
    name: 'Mana Crypt',
    manaCost: '{0}',
    type: 'Artifact',
    colors: [],
    rarity: 'Rare',
    set: 'VMA',
    collector_number: '20',
    oracle_text: '{T}: Add {C}{C}.\nAt the beginning of your upkeep, you may pay {2}. If you don\'t, Mana Crypt deals 3 damage to you.',
    keywords: ['Mana'],
    imageUrl: 'https://cards.scryfall.io/large/front/4/0/40c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c2b.jpg?1592761474'
  },
  {
    id: 'senseis-divining-top',
    name: 'Sensei\'s Divining Top',
    manaCost: '{1}',
    type: 'Artifact',
    colors: [],
    rarity: 'Rare',
    set: 'CHK',
    collector_number: '21',
    oracle_text: '{1}: Look at the top three cards of your library, then put them back in any order.\n{T}: Draw a card, then put Sensei\'s Divining Top on top of its owner\'s library.',
    keywords: ['Draw', 'Scry'],
    imageUrl: 'https://cards.scryfall.io/large/front/5/1/51c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c2c.jpg?1592761474'
  },

  // Lands
  {
    id: 'underground-sea',
    name: 'Underground Sea',
    manaCost: '',
    type: 'Land — Island Swamp',
    colors: ['U', 'B'],
    rarity: 'Rare',
    set: 'LEA',
    collector_number: '22',
    oracle_text: '({T}: Add {U} or {B}.)',
    keywords: ['Mana'],
    imageUrl: 'https://cards.scryfall.io/large/front/6/2/62c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c2d.jpg?1592761474'
  },
  {
    id: 'tundra',
    name: 'Tundra',
    manaCost: '',
    type: 'Land — Plains Island',
    colors: ['W', 'U'],
    rarity: 'Rare',
    set: 'LEA',
    collector_number: '23',
    oracle_text: '({T}: Add {W} or {U}.)',
    keywords: ['Mana'],
    imageUrl: 'https://cards.scryfall.io/large/front/7/3/73c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c2e.jpg?1592761474'
  },
  {
    id: 'volcanic-island',
    name: 'Volcanic Island',
    manaCost: '',
    type: 'Land — Island Mountain',
    colors: ['U', 'R'],
    rarity: 'Rare',
    set: 'LEA',
    collector_number: '24',
    oracle_text: '({T}: Add {U} or {R}.)',
    keywords: ['Mana'],
    imageUrl: 'https://cards.scryfall.io/large/front/8/4/84c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c2f.jpg?1592761474'
  },
  {
    id: 'badlands',
    name: 'Badlands',
    manaCost: '',
    type: 'Land — Mountain Swamp',
    colors: ['R', 'B'],
    rarity: 'Rare',
    set: 'LEA',
    collector_number: '25',
    oracle_text: '({T}: Add {R} or {B}.)',
    keywords: ['Mana'],
    imageUrl: 'https://cards.scryfall.io/large/front/9/5/95c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c30.jpg?1592761474'
  },
  {
    id: 'wasteland',
    name: 'Wasteland',
    manaCost: '',
    type: 'Land',
    colors: [],
    rarity: 'Rare',
    set: 'ICE',
    collector_number: '26',
    oracle_text: '{T}: Add {C}.\n{1}, {T}, Sacrifice Wasteland: Destroy target nonbasic land.',
    keywords: ['Destroy', 'Mana'],
    imageUrl: 'https://cards.scryfall.io/large/front/0/6/06c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c31.jpg?1592761474'
  }
];

export interface VaultCard extends Card {
  id: string;
  quantity: number;
  favorite: boolean;
  lastUsed?: Date;
  acquisitionDate: Date;
  condition: 'Mint' | 'Near Mint' | 'Excellent' | 'Good' | 'Fair' | 'Poor';
  setCode?: string;
  collectorNumber?: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Mythic Rare' | 'Special';
  colorIdentity: string[];
  keywords: string[];
}

/**
 * Convert sample card data to VaultCard type
 */
function convertToVaultCard(sampleCard: any): VaultCard {
  const colorIdentity = sampleCard.colors || [];
  const keywords = sampleCard.keywords || [];

  // Create fallback image URLs that should work better
  const fallbackImages = {
    'swords-to-plowshares': 'https://cards.scryfall.io/large/front/2/8/28c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c.jpg?1562795126',
    'path-to-exile': 'https://cards.scryfall.io/large/front/3/9/39c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c.jpg?1562795126',
    'lightning-bolt': 'https://cards.scryfall.io/large/front/7/3/73c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c1a.jpg?1562795126',
    'ancestral-recall': 'https://cards.scryfall.io/large/front/2/8/28c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c10.jpg?1562795126',
    'sol-ring': 'https://cards.scryfall.io/large/front/7/3/73c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c24.jpg?1562795126',
    'black-lotus': 'https://cards.scryfall.io/large/front/8/4/84c6b0b2-0c4b-4f5a-9b0a-0e8f0c0b0c25.jpg?1562795126'
  };

  // Determine rarity
  let rarity: VaultCard['rarity'] = 'Common';
  switch (sampleCard.rarity) {
    case 'common': rarity = 'Common'; break;
    case 'uncommon': rarity = 'Uncommon'; break;
    case 'rare': rarity = 'Rare'; break;
    case 'mythic': rarity = 'Mythic Rare'; break;
    default: rarity = 'Special'; break;
  }

  return {
    id: sampleCard.id,
    name: sampleCard.name,
    manaCost: sampleCard.manaCost || '',
    type: sampleCard.type,
    zone: 'hand' as any, // Default zone for vault
    tapped: false,
    imageUrl: fallbackImages[sampleCard.id as keyof typeof fallbackImages] || sampleCard.imageUrl || `https://via.placeholder.com/300x420/1a1a1a/ffffff?text=${encodeURIComponent(sampleCard.name)}`,
    quantity: Math.floor(Math.random() * 4) + 1, // Random quantity 1-4 for demo
    favorite: Math.random() > 0.7, // 30% chance of being favorite
    acquisitionDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date within last year
    condition: (['Mint', 'Near Mint', 'Excellent', 'Good', 'Fair', 'Poor'] as const)[Math.floor(Math.random() * 6)],
    setCode: sampleCard.set,
    collectorNumber: sampleCard.collector_number,
    rarity,
    colorIdentity,
    keywords
  };
}

/**
 * Initialize the Card Vault with sample data (no API calls)
 */
export async function initializeCardVault(): Promise<VaultCard[]> {
  console.log('Initializing Card Vault with sample data...');
  
  // Simulate loading delay for better UX
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const vaultCards = sampleVaultCards.map(sampleCard => 
    convertToVaultCard(sampleCard)
  );
  
  console.log(`Card Vault initialized with ${vaultCards.length} cards`);
  return vaultCards;
}

/**
 * Search vault cards by various criteria
 */
export function searchVaultCards(cards: VaultCard[], query: string, filters: {
  color?: string;
  rarity?: string;
  type?: string;
  favorite?: boolean;
  minQuantity?: number;
} = {}): VaultCard[] {
  return cards.filter(card => {
    // Text search
    const matchesQuery = !query || 
      card.name.toLowerCase().includes(query.toLowerCase()) ||
      card.type.toLowerCase().includes(query.toLowerCase()) ||
      (card.keywords && card.keywords.some(keyword => keyword.toLowerCase().includes(query.toLowerCase())));
    
    // Color filter
    const matchesColor = !filters.color || filters.color === 'All' || 
      card.colorIdentity.includes(filters.color);
    
    // Rarity filter
    const matchesRarity = !filters.rarity || filters.rarity === 'All' ||
      card.rarity === filters.rarity;
    
    // Type filter
    const matchesType = !filters.type || 
      card.type.toLowerCase().includes(filters.type.toLowerCase());
    
    // Favorite filter
    const matchesFavorite = filters.favorite === undefined || card.favorite === filters.favorite;
    
    // Quantity filter
    const matchesQuantity = !filters.minQuantity || card.quantity >= filters.minQuantity;
    
    return matchesQuery && matchesColor && matchesRarity && matchesType && matchesFavorite && matchesQuantity;
  });
}

/**
 * Get vault statistics
 */
export function getVaultStats(cards: VaultCard[]) {
  const stats = {
    totalCards: cards.length,
    totalQuantity: cards.reduce((sum, card) => sum + card.quantity, 0),
    favorites: cards.filter(card => card.favorite).length,
    byRarity: {} as Record<string, number>,
    byColor: {} as Record<string, number>,
    byType: {} as Record<string, number>
  };

  cards.forEach(card => {
    // By rarity
    stats.byRarity[card.rarity] = (stats.byRarity[card.rarity] || 0) + 1;
    
    // By color
    if (card.colorIdentity.length === 0) {
      stats.byColor['Colorless'] = (stats.byColor['Colorless'] || 0) + 1;
    } else {
      card.colorIdentity.forEach(color => {
        stats.byColor[color] = (stats.byColor[color] || 0) + 1;
      });
    }
    
    // By type (main type only)
    const mainType = card.type.split('—')[0].trim();
    stats.byType[mainType] = (stats.byType[mainType] || 0) + 1;
  });

  return stats;
}