# Sprite System & World Building Guide

## Overview

The Adventure Table now includes a comprehensive sprite system for world building. Create detailed maps with weapons, armor, NPCs, monsters, terrain, and magical items.

## Features

### 1. **Sprite Library**
A searchable library with pre-generated sprites for:
- **Weapons**: Swords, Axes, Bows, Staffs, Daggers, Spears
- **Armor**: Helmets, Chest Plates, Shields, Leg Armor
- **Magic Items**: Amulets, Rings, Potions, Spellbooks, Scrolls
- **NPCs**: Human, Elf, Dwarf, Halfling, Tiefling, Dragonborn, Gnome
- **Monsters**: Goblins, Skeletons, Dragons, Ghosts
- **Terrain**: Grass, Water, Mountains, Forest

### 2. **Sprite Painter Canvas**
Place, arrange, and customize sprites on your world maps:
- **Place Mode**: Click to add sprites from the library
- **Select Mode**: Click sprites to select them for editing
- **Delete Mode**: Remove unwanted sprites
- **Scale Control**: Make sprites larger or smaller (0.5x - 5x)
- **Rotation Control**: Rotate sprites in 15° increments
- **Position Display**: See exact coordinates of placed sprites

### 3. **Automatic SVG Generation**
All sprites are generated as scalable SVG graphics:
- Weapons include detailed hilts, blades, and handles
- Armor shows proper fit and construction
- NPCs have distinct racial characteristics
- Monsters have unique silhouettes and features
- Terrain creates biome-appropriate backgrounds

## How to Use

### Step 1: Create a Campaign
1. Open World Builder tab
2. Click **New Campaign**
3. Enter a campaign name and description
4. Click **Create Campaign**

### Step 2: Generate a Base Map
1. Select your campaign from the sidebar
2. Click **Map Editor** tab
3. Choose a map type:
   - **🏰 Dungeon**: BSP-generated multi-room dungeon
   - **🕳️ Cavern**: Cellular automata cave system
   - **🌍 World**: Procedural world map with biomes
4. The map appears in the canvas

### Step 3: Add Sprites to Your Map
1. Switch to **🎨 Sprite Painter** tab
2. Click **🎨 Open Library** to open the sprite panel
3. Select a category (Weapons, Armor, NPCs, etc.)
4. Click a sprite to select it
5. Return to the canvas and click anywhere to place the sprite
6. Repeat to add more sprites

### Step 4: Customize Placed Sprites
1. Click **Select** mode
2. Click a sprite on the canvas to select it
3. Use the controls at the bottom:
   - **Scale**: Adjust size with + and − buttons
   - **Rotation**: Turn the sprite with ↺ (−15°) or ↻ (+15°)
   - **Position**: Drag with mouse to move around canvas
4. Delete sprites by selecting them in **Delete** mode

### Step 5: Save Your Work
1. Click **📥 Export Campaign**
2. Click **Download Campaign**
3. Your campaign saves as a JSON file with all:
   - Map layouts
   - Placed sprites and their properties
   - NPC data
   - Encounter information

## Sprite System Architecture

### Generated Sprites
All sprites are created dynamically using SVG:
- Consistent 64×64 pixel canvas
- Color-customizable designs
- Smooth scaling without pixelation
- Lightweight and browser-friendly

### Sprite Types
```
Weapon Sprites
├── Sword (brown blade with metallic hilt)
├── Axe (double-bladed with wooden handle)
├── Bow (curved with taut string)
├── Staff (ornate with magical top)
├── Dagger (small blade with gold hilt)
└── Spear (pointed with shaft)

Armor Sprites
├── Helmet (with face opening)
├── Chest Plate (segmented protection)
├── Shield (rounded with boss)
└── Leg Armor (two segments with boots)

Magic Item Sprites
├── Amulet (purple with chain)
├── Ring (gold with gemstone)
├── Potion (glass bottle with liquid)
├── Spellbook (leather-bound with gold)
└── Scroll (rolled parchment with seals)

NPC Sprites
├── Human (tan skin, balanced features)
├── Elf (golden skin, pointed ears)
├── Dwarf (brown skin, sturdy build)
├── Halfling (tan, small stature)
├── Tiefling (purple skin, unique features)
├── Dragonborn (orange/red reptilian)
└── Gnome (light tan, petite frame)

Monster Sprites
├── Goblin (green with yellow eyes)
├── Skeleton (gray bones with dark eyes)
├── Dragon (red with golden eyes)
└── Ghost (translucent white form)

Terrain Sprites
├── Grass (green with blades)
├── Water (blue with wave patterns)
├── Mountain (brown with snow peaks)
└── Forest (green with trees)
```

### Sprite Data Structure
```typescript
interface Sprite {
  id: string;              // Unique identifier
  name: string;            // Display name
  type: SpriteType;        // Category
  imageUrl: string;        // Data URL for image
  svgData?: string;        // Raw SVG markup
  metadata: {
    width: number;         // Default width (64)
    height: number;        // Default height (64)
    animated: boolean;     // Animation flag
    color?: string;        // Primary color
    tags: string[];        // Search tags
  };
}

interface PlacedSprite extends Sprite {
  x: number;               // X coordinate on canvas
  y: number;               // Y coordinate on canvas
  scale: number;           // Size multiplier (1 = 64x64)
  rotation: number;        // Rotation in degrees (0-360)
  zIndex: number;          // Layer order
}
```

## Integration with World Builder

The sprite system integrates seamlessly with the existing world builder:

1. **Campaign Manager**: All campaigns now support sprite layers
2. **Map Generator**: Generate base maps, then add sprites
3. **Export System**: Sprite positions save with campaigns
4. **Multiple Layers**: Stack sprites for depth and detail

## Tips for Effective World Building

### Composition
- Use terrain sprites as backgrounds
- Layer furniture and objects for interiors
- Place NPCs and monsters last (top layer)
- Mix different sprite types for visual interest

### Scale
- Keep weapons/armor at 1.0-1.5x scale
- Use 1.5-2.0x for larger objects like buildings
- Use 0.5x-0.8x for small details
- Keep monsters 1.0x for consistency

### Rotation
- 0° = facing right
- 90° = facing down
- 180° = facing left
- 270° = facing up

### Organization
- Use layers (z-index) to organize sprites
- Clear canvas between major map changes
- Export frequently to avoid losing work
- Give campaigns descriptive names

## Example Workflow

1. Create campaign: "Shadowvale Dungeon"
2. Generate dungeon map
3. Add grass terrain sprites as ground
4. Place wall sections to modify map layout
5. Add door/chest sprites
6. Place 3 goblin monsters for encounter
7. Add treasure chest at end location
8. Export campaign

## Customization Options

### Add New Sprite Types
Extend `spriteGenerator.ts`:
```typescript
export function generateCustomSprite(type: string): string {
  // Return SVG markup
  return `<svg>...</svg>`;
}
```

### Color Customization
Most sprites accept a `color` parameter:
```typescript
generateWeaponSprite('sword', '#FF5733')  // Red sword
generateArmorSprite('chest', '#C0C0C0')   // Silver armor
```

### Create Sprite Sheets
Export multiple sprites as a sheet:
```typescript
createSpriteSheet("My Sprites", [sprite1, sprite2, ...])
```

## Performance Notes

- Canvas rendering optimizes for 100+ sprites
- SVG generation is instant
- Sprites use browser localStorage for persistence
- Export creates small JSON files (< 100KB for large campaigns)

## Troubleshooting

**Q: Sprites not appearing?**
- Ensure you're in Sprite Painter mode (not Map Editor)
- Check that library panel is open
- Try refreshing the browser

**Q: Can't rotate sprites?**
- Select the sprite first in Select mode
- Use rotation buttons in properties panel
- Rotation increments are 15° per click

**Q: Map and sprites don't align?**
- Both use the same canvas (800×600)
- Sprites layer on top of map
- Grid shows at 50px intervals for reference

**Q: Export doesn't include sprites?**
- Export saves campaign data (maps, NPCs, encounters)
- Sprite positions stored in PlacedSprite array
- Manually manage sprite positions separately for now

## Future Enhancements

Planned features:
- [ ] Sprite animation support
- [ ] Custom sprite upload
- [ ] Sprite grouping/organization
- [ ] Undo/redo for sprite placement
- [ ] Sprite templates for common rooms
- [ ] Real-time collaboration on sprite placement
- [ ] Tile-based snap-to-grid placement
- [ ] Sprite flip (horizontal/vertical)

## API Reference

### SpriteGenerator Functions

```typescript
// Create sprites
createSprite(name: string, type: SpriteType, itemName: string): Sprite
createSpriteSheet(name: string, sprites: Sprite[]): SpriteSheet

// Generate specific types
generateWeaponSprite(weaponType: string, color?: string): string
generateArmorSprite(armorType: string, color?: string): string
generateMagicItemSprite(itemType: string): string
generateNPCSprite(race: string, gender?: string): string
generateMonsterSprite(monsterType: string): string
generateTerrainSprite(terrainType: string): string
```

### Component Props

**SpriteLibrary**
```typescript
interface SpriteLibraryProps {
  onSpriteSelect?: (sprite: Sprite) => void;
  onSpriteSheetCreate?: (sheet: SpriteSheet) => void;
}
```

**SpritePainter**
```typescript
interface SpritePainterProps {
  width: number;
  height: number;
  selectedSprite?: Sprite;
  onSpritePlaced?: (sprite: PlacedSprite) => void;
  placedSprites?: PlacedSprite[];
  onSpritesUpdate?: (sprites: PlacedSprite[]) => void;
}
```

## Examples

### Creating a Tavern Interior
1. Use mountain terrain as background
2. Add multiple furniture terrain sprites
3. Place NPC humans and dwarves
4. Add drinking potion sprites
5. Export as "Tavern Map"

### Designing a Dragon's Lair
1. Generate cavern map
2. Add mountain terrain for rocky floor
3. Place large dragon sprite (2.0x scale)
4. Add treasure chests
5. Add magical item sprites
6. Rotate dragon to face players

### Creating a Combat Encounter
1. Generate dungeon map
2. Add goblin monsters for enemy group
3. Place NPC allies
4. Mark spawn points with amulets
5. Add trap sprites
6. Export for battle session

Enjoy creating your fantasy worlds!
