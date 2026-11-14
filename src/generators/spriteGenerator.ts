// Sprite and asset management for world building

export interface Sprite {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'magic' | 'npc' | 'monster' | 'object' | 'terrain';
  imageUrl: string;
  svgData?: string;
  metadata: {
    width: number;
    height: number;
    animated: boolean;
    color?: string;
    tags: string[];
  };
}

export interface SpriteSheet {
  id: string;
  name: string;
  sprites: Sprite[];
  gridWidth: number;
  gridHeight: number;
}

// Simple SVG generator for sprites
export function generateWeaponSprite(weaponType: string, color: string = '#8B4513'): string {
  const weapons: Record<string, string> = {
    sword: `
      <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <rect x="28" y="2" width="8" height="40" fill="${color}" stroke="#333" stroke-width="1"/>
        <polygon points="30,42 34,42 32,50" fill="${color}" stroke="#333" stroke-width="1"/>
        <ellipse cx="32" cy="52" rx="4" ry="6" fill="#D4AF37" stroke="#333" stroke-width="1"/>
        <circle cx="32" cy="15" r="8" fill="#C0C0C0" stroke="#333" stroke-width="1"/>
      </svg>
    `,
    axe: `
      <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <polygon points="28,2 36,2 40,20 24,20" fill="${color}" stroke="#333" stroke-width="1"/>
        <rect x="30" y="20" width="4" height="30" fill="#8B4513" stroke="#333" stroke-width="1"/>
        <circle cx="32" cy="52" r="3" fill="#D4AF37" stroke="#333" stroke-width="1"/>
      </svg>
    `,
    bow: `
      <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <path d="M 32 8 Q 20 32 32 56" stroke="${color}" stroke-width="4" fill="none"/>
        <line x1="28" y1="28" x2="36" y2="28" stroke="#D4AF37" stroke-width="2"/>
        <line x1="30" y1="24" x2="30" y2="32" stroke="#000" stroke-width="1"/>
      </svg>
    `,
    staff: `
      <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <rect x="29" y="4" width="6" height="50" fill="${color}" stroke="#333" stroke-width="1"/>
        <circle cx="32" cy="8" r="6" fill="#9370DB" stroke="#333" stroke-width="1"/>
        <polygon points="28,56 36,56 32,62" fill="#8B4513" stroke="#333" stroke-width="1"/>
      </svg>
    `,
    dagger: `
      <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <polygon points="30,4 32,4 34,35 32,40 30,35" fill="${color}" stroke="#333" stroke-width="1"/>
        <rect x="28" y="40" width="8" height="4" fill="#D4AF37" stroke="#333" stroke-width="1"/>
        <circle cx="32" cy="46" r="2" fill="#D4AF37" stroke="#333" stroke-width="1"/>
      </svg>
    `,
    spear: `
      <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <polygon points="32,2 28,12 36,12" fill="${color}" stroke="#333" stroke-width="1"/>
        <rect x="30" y="12" width="4" height="40" fill="#8B4513" stroke="#333" stroke-width="1"/>
        <circle cx="32" cy="54" r="2" fill="#D4AF37" stroke="#333" stroke-width="1"/>
      </svg>
    `,
  };
  return weapons[weaponType] || weapons.sword;
}

export function generateArmorSprite(armorType: string, color: string = '#C0C0C0'): string {
  const armor: Record<string, string> = {
    helmet: `
      <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <path d="M 20 32 L 22 12 L 32 8 L 42 12 L 44 32 Z" fill="${color}" stroke="#333" stroke-width="1"/>
        <circle cx="28" cy="24" r="2" fill="#000"/>
        <circle cx="36" cy="24" r="2" fill="#000"/>
        <line x1="32" y1="28" x2="32" y2="32" stroke="#000" stroke-width="1"/>
        <path d="M 20 32 Q 32 40 44 32" fill="${color}" stroke="#333" stroke-width="1"/>
      </svg>
    `,
    chest: `
      <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <rect x="16" y="16" width="32" height="36" fill="${color}" stroke="#333" stroke-width="2" rx="4"/>
        <line x1="32" y1="16" x2="32" y2="52" stroke="#666" stroke-width="1"/>
        <circle cx="24" cy="28" r="2" fill="#D4AF37"/>
        <circle cx="40" cy="28" r="2" fill="#D4AF37"/>
      </svg>
    `,
    shield: `
      <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <path d="M 32 8 L 20 16 L 20 36 Q 32 52 32 52 Q 32 52 44 36 L 44 16 Z" fill="${color}" stroke="#333" stroke-width="2"/>
        <circle cx="32" cy="32" r="6" fill="none" stroke="#D4AF37" stroke-width="1"/>
      </svg>
    `,
    legs: `
      <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <rect x="18" y="16" width="12" height="40" fill="${color}" stroke="#333" stroke-width="1" rx="2"/>
        <rect x="34" y="16" width="12" height="40" fill="${color}" stroke="#333" stroke-width="1" rx="2"/>
        <circle cx="24" cy="58" r="2" fill="#000"/>
        <circle cx="40" cy="58" r="2" fill="#000"/>
      </svg>
    `,
  };
  return armor[armorType] || armor.chest;
}

export function generateMagicItemSprite(itemType: string): string {
  const items: Record<string, string> = {
    amulet: `
      <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="24" r="10" fill="#9370DB" stroke="#6A0DAD" stroke-width="2"/>
        <circle cx="32" cy="24" r="6" fill="#E6CCFF" stroke="none"/>
        <polygon points="28,34 32,40 36,34" fill="#9370DB" stroke="#6A0DAD" stroke-width="1"/>
        <line x1="32" y1="40" x2="32" y2="52" stroke="#D4AF37" stroke-width="2"/>
      </svg>
    `,
    ring: `
      <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="14" fill="none" stroke="#FFD700" stroke-width="4"/>
        <circle cx="32" cy="32" r="8" fill="#FF6347" stroke="#FF4500" stroke-width="2"/>
        <circle cx="32" cy="32" r="5" fill="#FFD700"/>
      </svg>
    `,
    potion: `
      <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <path d="M 24 20 L 28 12 L 36 12 L 40 20 Z" fill="#8B4513" stroke="#333" stroke-width="1"/>
        <rect x="20" y="20" width="24" height="28" fill="#FF6347" stroke="#333" stroke-width="2" rx="4"/>
        <rect x="22" y="22" width="20" height="20" fill="#FF4500" stroke="none"/>
        <rect x="28" y="50" width="8" height="6" fill="#8B4513" stroke="#333" stroke-width="1"/>
      </svg>
    `,
    spellbook: `
      <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <path d="M 20 16 L 22 12 L 44 12 L 42 16 Z" fill="#8B4513" stroke="#333" stroke-width="1"/>
        <rect x="20" y="16" width="24" height="32" fill="#D2691E" stroke="#333" stroke-width="2"/>
        <line x1="32" y1="16" x2="32" y2="48" stroke="#333" stroke-width="1"/>
        <line x1="20" y1="24" x2="44" y2="24" stroke="#FFD700" stroke-width="1"/>
        <line x1="20" y1="32" x2="44" y2="32" stroke="#FFD700" stroke-width="1"/>
        <line x1="20" y1="40" x2="44" y2="40" stroke="#FFD700" stroke-width="1"/>
      </svg>
    `,
    scroll: `
      <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <rect x="18" y="16" width="28" height="36" fill="#F5DEB3" stroke="#8B7355" stroke-width="2" rx="2"/>
        <line x1="22" y1="24" x2="42" y2="24" stroke="#8B7355" stroke-width="1"/>
        <line x1="22" y1="32" x2="42" y2="32" stroke="#8B7355" stroke-width="1"/>
        <line x1="22" y1="40" x2="42" y2="40" stroke="#8B7355" stroke-width="1"/>
        <circle cx="12" cy="20" r="4" fill="#8B4513" stroke="#333" stroke-width="1"/>
        <circle cx="52" cy="20" r="4" fill="#8B4513" stroke="#333" stroke-width="1"/>
      </svg>
    `,
  };
  return items[itemType] || items.potion;
}

export function generateNPCSprite(race: string, gender: string = 'neutral'): string {
  const colors: Record<string, string> = {
    human: '#FDBCB4',
    elf: '#F0E68C',
    dwarf: '#D2B48C',
    halfling: '#FDBCB4',
    tiefling: '#9370DB',
    dragonborn: '#FF8C00',
    gnome: '#F5DEB3',
  };
  const skinColor = colors[race] || '#FDBCB4';

  return `
    <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="16" r="8" fill="${skinColor}" stroke="#333" stroke-width="1"/>
      <circle cx="28" cy="14" r="1.5" fill="#000"/>
      <circle cx="36" cy="14" r="1.5" fill="#000"/>
      <line x1="32" y1="16" x2="32" y2="18" stroke="#333" stroke-width="0.5"/>
      <path d="M 24 26 L 24 40 L 40 40 L 40 26 Z" fill="#8B4513" stroke="#333" stroke-width="1"/>
      <rect x="20" y="28" width="5" height="12" fill="${skinColor}" stroke="#333" stroke-width="1" rx="2"/>
      <rect x="39" y="28" width="5" height="12" fill="${skinColor}" stroke="#333" stroke-width="1" rx="2"/>
      <path d="M 24 40 L 28 56 L 28 56" stroke="#333" stroke-width="2" fill="none"/>
      <path d="M 40 40 L 36 56 L 36 56" stroke="#333" stroke-width="2" fill="none"/>
    </svg>
  `;
}

export function generateMonsterSprite(monsterType: string): string {
  const monsters: Record<string, string> = {
    goblin: `
      <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="18" r="8" fill="#6B8E23" stroke="#333" stroke-width="1"/>
        <circle cx="28" cy="16" r="2" fill="#FFD700"/>
        <circle cx="36" cy="16" r="2" fill="#FFD700"/>
        <path d="M 20 28 L 20 44 L 44 44 L 44 28 Z" fill="#556B2F" stroke="#333" stroke-width="1"/>
        <line x1="32" y1="44" x2="28" y2="56" stroke="#333" stroke-width="2"/>
        <line x1="32" y1="44" x2="36" y2="56" stroke="#333" stroke-width="2"/>
      </svg>
    `,
    skeleton: `
      <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="16" r="8" fill="#D3D3D3" stroke="#333" stroke-width="1"/>
        <circle cx="28" cy="14" r="2" fill="#000"/>
        <circle cx="36" cy="14" r="2" fill="#000"/>
        <polygon points="32,18 30,22 34,22" fill="#000"/>
        <rect x="24" y="26" width="16" height="20" fill="#D3D3D3" stroke="#333" stroke-width="1"/>
        <line x1="32" y1="26" x2="32" y2="46" stroke="#333" stroke-width="1"/>
        <line x1="26" y1="34" x2="20" y2="40" stroke="#D3D3D3" stroke-width="2"/>
        <line x1="38" y1="34" x2="44" y2="40" stroke="#D3D3D3" stroke-width="2"/>
      </svg>
    `,
    dragon: `
      <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="32" cy="32" rx="16" ry="12" fill="#FF4500" stroke="#333" stroke-width="1"/>
        <polygon points="20,24 16,16 20,20" fill="#FF4500" stroke="#333" stroke-width="1"/>
        <polygon points="44,24 48,16 44,20" fill="#FF4500" stroke="#333" stroke-width="1"/>
        <circle cx="26" cy="28" r="2" fill="#FFD700"/>
        <circle cx="38" cy="28" r="2" fill="#FFD700"/>
        <polygon points="48,32 54,28 56,36" fill="#FF4500" stroke="#333" stroke-width="1"/>
        <path d="M 20 40 L 16 50 L 24 45" fill="#FF4500" stroke="#333" stroke-width="1"/>
      </svg>
    `,
    ghost: `
      <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <path d="M 20 22 L 20 50 Q 20 56 32 56 Q 44 56 44 50 L 44 22 Q 44 12 32 12 Q 20 12 20 22 Z" fill="#E0FFFF" stroke="#4682B4" stroke-width="2" opacity="0.9"/>
        <circle cx="28" cy="32" r="2" fill="#000"/>
        <circle cx="36" cy="32" r="2" fill="#000"/>
        <path d="M 32 40 L 30 44 L 34 44" fill="#000"/>
        <circle cx="22" cy="50" r="2" fill="#E0FFFF" stroke="#4682B4" stroke-width="1"/>
        <circle cx="32" cy="52" r="2" fill="#E0FFFF" stroke="#4682B4" stroke-width="1"/>
        <circle cx="42" cy="50" r="2" fill="#E0FFFF" stroke="#4682B4" stroke-width="1"/>
      </svg>
    `,
  };
  return monsters[monsterType] || monsters.goblin;
}

export function generateTerrainSprite(terrainType: string): string {
  const terrain: Record<string, string> = {
    grass: `
      <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" fill="#90EE90"/>
        <line x1="10" y1="50" x2="8" y2="62" stroke="#228B22" stroke-width="1"/>
        <line x1="20" y1="48" x2="18" y2="60" stroke="#228B22" stroke-width="1"/>
        <line x1="30" y1="52" x2="28" y2="62" stroke="#228B22" stroke-width="1"/>
        <line x1="40" y1="49" x2="38" y2="61" stroke="#228B22" stroke-width="1"/>
        <line x1="50" y1="51" x2="48" y2="62" stroke="#228B22" stroke-width="1"/>
        <line x1="60" y1="50" x2="58" y2="62" stroke="#228B22" stroke-width="1"/>
      </svg>
    `,
    water: `
      <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" fill="#1E90FF"/>
        <path d="M 0 20 Q 8 16 16 20 T 32 20 T 48 20 T 64 20" stroke="#87CEEB" stroke-width="2" fill="none"/>
        <path d="M 0 35 Q 8 31 16 35 T 32 35 T 48 35 T 64 35" stroke="#87CEEB" stroke-width="2" fill="none"/>
        <path d="M 0 50 Q 8 46 16 50 T 32 50 T 48 50 T 64 50" stroke="#87CEEB" stroke-width="2" fill="none"/>
      </svg>
    `,
    mountain: `
      <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <polygon points="32,8 8,60 56,60" fill="#8B7355" stroke="#333" stroke-width="2"/>
        <polygon points="32,8 20,40 44,40" fill="#A0826D" stroke="#333" stroke-width="1"/>
        <polygon points="20,20 12,35 28,35" fill="#D3D3D3" stroke="none"/>
      </svg>
    `,
    forest: `
      <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" fill="#90EE90"/>
        <circle cx="20" cy="30" r="12" fill="#228B22" stroke="#333" stroke-width="1"/>
        <circle cx="44" cy="24" r="14" fill="#228B22" stroke="#333" stroke-width="1"/>
        <circle cx="32" cy="42" r="10" fill="#228B22" stroke="#333" stroke-width="1"/>
        <rect x="18" y="42" width="4" height="18" fill="#8B4513"/>
        <rect x="42" y="38" width="4" height="22" fill="#8B4513"/>
        <rect x="30" y="52" width="4" height="8" fill="#8B4513"/>
      </svg>
    `,
  };
  return terrain[terrainType] || terrain.grass;
}

// Create sprite with automatic type detection
export function createSprite(name: string, type: 'weapon' | 'armor' | 'magic' | 'npc' | 'monster' | 'object' | 'terrain', itemName: string): Sprite {
  let svgData = '';

  switch (type) {
    case 'weapon':
      svgData = generateWeaponSprite(itemName);
      break;
    case 'armor':
      svgData = generateArmorSprite(itemName);
      break;
    case 'magic':
      svgData = generateMagicItemSprite(itemName);
      break;
    case 'npc':
      svgData = generateNPCSprite(itemName);
      break;
    case 'monster':
      svgData = generateMonsterSprite(itemName);
      break;
    case 'terrain':
      svgData = generateTerrainSprite(itemName);
      break;
  }

  const imageUrl = `data:image/svg+xml;base64,${Buffer.from(svgData).toString('base64')}`;

  return {
    id: `sprite-${Date.now()}`,
    name,
    type,
    imageUrl,
    svgData,
    metadata: {
      width: 64,
      height: 64,
      animated: false,
      tags: [type, itemName],
    },
  };
}

// Sprite collection/library
export function createSpriteSheet(name: string, sprites: Sprite[]): SpriteSheet {
  return {
    id: `sheet-${Date.now()}`,
    name,
    sprites,
    gridWidth: Math.ceil(Math.sqrt(sprites.length)),
    gridHeight: Math.ceil(Math.sqrt(sprites.length)),
  };
}
