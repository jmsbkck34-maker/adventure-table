// Example usage of the sprite system in your adventure table

import { createSprite, generateWeaponSprite, generateNPCSprite } from './generators/spriteGenerator';

// Example 1: Create a sword sprite
const swordSprite = createSprite('Iron Sword', 'weapon', 'sword');
console.log('Sword sprite:', swordSprite);
// {
//   id: 'sprite-1704067200000',
//   name: 'Iron Sword',
//   type: 'weapon',
//   imageUrl: 'data:image/svg+xml;base64:...',
//   svgData: '<svg width="64"...></svg>',
//   metadata: {
//     width: 64,
//     height: 64,
//     animated: false,
//     tags: ['weapon', 'sword']
//   }
// }

// Example 2: Create colored armor sprites
const goldArmor = createSprite('Royal Chestplate', 'armor', 'chest');
const silverHelmet = createSprite('Knights Helm', 'armor', 'helmet');

// Example 3: Create NPC sprites for different races
const humanWarrior = createSprite('Human Fighter', 'npc', 'human');
const elfMage = createSprite('Elf Mage', 'npc', 'elf');
const dwarfCleric = createSprite('Dwarf Cleric', 'npc', 'dwarf');

// Example 4: Create magic item collection
const potionVials = [
  createSprite('Health Potion', 'magic', 'potion'),
  createSprite('Mana Potion', 'magic', 'potion'),
  createSprite('Healing Salve', 'magic', 'potion'),
];

// Example 5: Create terrain for map building
const terrainTiles = [
  createSprite('Grassland', 'terrain', 'grass'),
  createSprite('Deep Water', 'terrain', 'water'),
  createSprite('Mountain Peak', 'terrain', 'mountain'),
  createSprite('Dark Forest', 'terrain', 'forest'),
];

// Example 6: Create monster encounters
const encounter = [
  createSprite('Goblin Scout', 'monster', 'goblin'),
  createSprite('Skeleton Warrior', 'monster', 'skeleton'),
  createSprite('Dragon Wyrm', 'monster', 'dragon'),
];

// Example 7: Build a dungeon room with sprites
const dungeonRoomSprites = {
  terrain: [
    { sprite: createSprite('Floor', 'terrain', 'grass'), x: 0, y: 0 },
    { sprite: createSprite('Floor', 'terrain', 'grass'), x: 50, y: 0 },
    { sprite: createSprite('Floor', 'terrain', 'grass'), x: 100, y: 0 },
  ],
  objects: [
    { sprite: createSprite('Treasure', 'object', 'chest'), x: 200, y: 200, scale: 1.5 },
    { sprite: createSprite('Sword', 'weapon', 'sword'), x: 150, y: 150, rotation: 45 },
  ],
  enemies: [
    { sprite: createSprite('Goblin', 'monster', 'goblin'), x: 300, y: 100, scale: 1.0 },
    { sprite: createSprite('Skeleton', 'monster', 'skeleton'), x: 350, y: 100, scale: 1.2 },
  ],
};

// Example 8: Create a tavern scene
const tavernSprites = {
  background: createSprite('Tavern Interior', 'terrain', 'grass'),
  npcs: [
    { sprite: createSprite('Barkeep', 'npc', 'human'), x: 50, y: 50 },
    { sprite: createSprite('Patron 1', 'npc', 'dwarf'), x: 150, y: 100 },
    { sprite: createSprite('Patron 2', 'npc', 'elf'), x: 200, y: 80 },
  ],
  items: [
    { sprite: createSprite('Ale', 'magic', 'potion'), x: 100, y: 120, scale: 0.8 },
    { sprite: createSprite('Ring', 'magic', 'ring'), x: 175, y: 150, scale: 0.6 },
  ],
};

// Example 9: Create a boss encounter setup
const bossRoom = {
  terrain: createSprite('Stone Floor', 'terrain', 'grass'),
  boss: {
    sprite: createSprite('Red Dragon', 'monster', 'dragon'),
    x: 400,
    y: 300,
    scale: 2.0,
    rotation: 0,
  },
  treasures: [
    { sprite: createSprite('Legendary Sword', 'weapon', 'sword'), x: 350, y: 400, scale: 1.5 },
    { sprite: createSprite('Crown', 'magic', 'amulet'), x: 450, y: 400, scale: 1.2 },
    { sprite: createSprite('Ancient Tome', 'magic', 'spellbook'), x: 400, y: 450, rotation: 90 },
  ],
};

// Example 10: Export all sprites
const allSprites = [
  ...potionVials,
  ...terrainTiles,
  ...encounter,
  swordSprite,
  humanWarrior,
  elfMage,
  dwarfCleric,
];

console.log(`Created ${allSprites.length} sprites total`);

// Usage in React component:
// <SpriteLibrary onSpriteSelect={(sprite) => {
//   console.log('Selected:', sprite.name);
//   // Add to canvas
// }} />
