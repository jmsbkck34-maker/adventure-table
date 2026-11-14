// NPC, encounter, and treasure generators

export interface NPC {
  id: string;
  name: string;
  race: string;
  class: string;
  alignment: string;
  personality: string[];
  goals: string[];
  secrets: string;
  appearance: string;
}

export interface Encounter {
  id: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
  creatures: Array<{ name: string; count: number; cr: number }>;
  environment: string;
}

export interface LootTable {
  items: Array<{ name: string; rarity: string; weight: number }>;
  gold: { min: number; max: number };
}

const races = ['Human', 'Elf', 'Dwarf', 'Halfling', 'Dragonborn', 'Gnome', 'Half-Orc', 'Tiefling'];
const classes = ['Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard'];
const alignments = ['Lawful Good', 'Neutral Good', 'Chaotic Good', 'Lawful Neutral', 'True Neutral', 'Chaotic Neutral', 'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'];
const personalities = ['ambitious', 'cautious', 'curious', 'generous', 'greedy', 'honest', 'lazy', 'paranoid', 'proud', 'stubborn'];
const goals = ['gain power', 'help others', 'find treasure', 'revenge', 'redemption', 'knowledge', 'family', 'justice', 'freedom', 'love'];

export function generateNPC(): NPC {
  const firstNames = ['Aldric', 'Brenna', 'Cedric', 'Delilah', 'Ezekiel', 'Fiona', 'Gideon', 'Heather'];
  const lastNames = ['Blackwood', 'Stormborn', 'Ironforge', 'Swiftwind', 'Nightshade', 'Goldleaf', 'Ravencrest', 'Shadowmere'];

  return {
    id: `npc-${Date.now()}`,
    name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
    race: races[Math.floor(Math.random() * races.length)],
    class: classes[Math.floor(Math.random() * classes.length)],
    alignment: alignments[Math.floor(Math.random() * alignments.length)],
    personality: [
      personalities[Math.floor(Math.random() * personalities.length)],
      personalities[Math.floor(Math.random() * personalities.length)],
    ],
    goals: [
      goals[Math.floor(Math.random() * goals.length)],
      goals[Math.floor(Math.random() * goals.length)],
    ],
    secrets: `Has a secret connection to ${['nobility', 'criminals', 'magic', 'prophecy'][Math.floor(Math.random() * 4)]}`,
    appearance: `${['tall', 'short', 'muscular', 'lanky', 'portly'][Math.floor(Math.random() * 5)]}, with ${['dark', 'fair', 'red', 'grey', 'blonde'][Math.floor(Math.random() * 5)]} hair`,
  };
}

const creatures = [
  { name: 'Goblin', cr: 0.125 },
  { name: 'Skeleton', cr: 0.125 },
  { name: 'Zombie', cr: 0.25 },
  { name: 'Orc', cr: 0.5 },
  { name: 'Ogre', cr: 2 },
  { name: 'Troll', cr: 5 },
  { name: 'Dragon Wyrmling', cr: 2 },
  { name: 'Vampire', cr: 13 },
];

const environments = ['dungeon', 'forest', 'cave', 'castle', 'graveyard', 'city', 'wilderness', 'tower'];

export function generateEncounter(partyLevel: number = 5): Encounter {
  const difficulty: ('easy' | 'medium' | 'hard' | 'deadly')[] = ['easy', 'medium', 'hard', 'deadly'];
  const diff = difficulty[Math.floor(Math.random() * difficulty.length)];
  const budget = { easy: 100, medium: 250, hard: 500, deadly: 1000 }[diff];

  const selectedCreatures: Array<{ name: string; count: number; cr: number }> = [];
  let spent = 0;

  while (spent < budget * 0.7) {
    const creature = creatures[Math.floor(Math.random() * creatures.length)];
    const count = Math.floor(Math.random() * 3) + 1;
    const cost = creature.cr * count * 100;

    if (spent + cost < budget) {
      selectedCreatures.push({ ...creature, count });
      spent += cost;
    } else {
      break;
    }
  }

  return {
    id: `encounter-${Date.now()}`,
    name: `${environments[Math.floor(Math.random() * environments.length)]} encounter`,
    difficulty: diff,
    creatures: selectedCreatures,
    environment: environments[Math.floor(Math.random() * environments.length)],
  };
}

const commonLoot = [
  { name: 'Longsword', rarity: 'common', weight: 3 },
  { name: 'Shortbow', rarity: 'common', weight: 2 },
  { name: 'Healing Potion', rarity: 'common', weight: 0.5 },
  { name: 'Rope (50ft)', rarity: 'common', weight: 10 },
  { name: 'Torch', rarity: 'common', weight: 1 },
  { name: 'Magic Dagger', rarity: 'uncommon', weight: 1 },
  { name: 'Ring of Protection', rarity: 'uncommon', weight: 0.1 },
  { name: 'Cloak of Elvenkind', rarity: 'uncommon', weight: 3 },
  { name: 'Wand of Magic Missiles', rarity: 'uncommon', weight: 1 },
  { name: '+1 Longsword', rarity: 'rare', weight: 3 },
  { name: 'Bag of Holding', rarity: 'rare', weight: 15 },
  { name: 'Scroll of Resurrection', rarity: 'very rare', weight: 0 },
];

export function generateLootTable(): LootTable {
  const loot = commonLoot
    .filter(() => Math.random() > 0.6)
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 5) + 1);

  return {
    items: loot,
    gold: {
      min: Math.floor(Math.random() * 100) + 10,
      max: Math.floor(Math.random() * 1000) + 100,
    },
  };
}
