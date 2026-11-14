# Complete Feature List for Adventure Table

Adventure Table now includes comprehensive tools for D&D campaigns:

## ✨ Features Implemented

### 🗺️ Map Generation
- **BSP Dungeon Generator** - Binary Space Partition algorithm for realistic dungeon layouts
- **Cavern Generator** - Cellular automaton caves for natural-looking caverns
- **World Map Generator** - Procedural world generation with biomes (forest, grassland, water, mountains, desert, swamp)
- Canvas visualization with real-time stats

### 🏰 Campaign Tools
- **NPC Generator** - Creates detailed NPCs with personality traits, goals, secrets, and appearance
- **Encounter Generator** - Balanced combat encounters with CR-based difficulty scaling
- **Loot Table Generator** - Procedurally generated treasure and gold rewards
- **Content Storage** - Save and manage generated content

### 📚 D&D Beyond Integration
- **Monster Search** - Query extensive monster database from Open5e API
- **Spell Browser** - Search and view spell details (level, school, casting time, components, effects)
- **Monster Manual** - Browse complete monster manual with full stat blocks
- **Character Reference** - View ability scores, AC, HP, and other combat stats

## 🚀 Quick Start

### Use Map Generator
```typescript
import { generateBSPDungeon, generateWorldMap } from './generators';

const dungeon = generateBSPDungeon(80, 60);
const world = generateWorldMap(100, 100);
```

### Generate Campaign Content
```typescript
import { generateNPC, generateEncounter, generateLootTable } from './generators';

const npc = generateNPC();
const encounter = generateEncounter(5); // party level 5
const loot = generateLootTable();
```

### Search D&D Beyond
```typescript
import { searchMonsters, searchSpells } from './generators';

const monsters = await searchMonsters('dragon');
const spells = await searchSpells('fireball');
```

## 📁 File Structure

```
src/
  generators/
    mapGenerator.ts       # Map generation algorithms
    contentGenerator.ts   # NPC, encounter, loot generators
    dndBeyond.ts         # D&D Beyond API integration
    index.ts             # Exports
  components/
    MapGenerator.tsx      # Map generation UI
    CampaignTools.tsx     # NPC, encounter, loot UI
    DnDBeyondPanel.tsx    # D&D Beyond search & reference UI
```

## 🔗 API Integration

Uses **Open5e API** (free, no authentication required):
- `https://api.open5e.com/v1/monsters/`
- `https://api.open5e.com/v1/spells/`

**Note:** D&D Beyond doesn't offer a free public API. We use Open5e as a compatible alternative with SRD content.

## 📖 Data Generated

### NPCs
- Name, race, class, alignment
- Personality traits (2-3)
- Goals (2-3)
- Physical appearance
- Hidden secrets

### Encounters
- Difficulty rating (easy/medium/hard/deadly)
- CR-balanced creature groups
- Environment information
- Total XP value

### Loot
- Items with rarity levels
- Common, uncommon, rare, very rare items
- Gold rewards (randomized range)

### Maps
- Room count and dimensions
- Floor coverage percentage
- Biome distribution (world maps)
- Render-ready tile data

## 🎯 Next Steps

1. **Deploy to Vercel** (see DEPLOYMENT.md)
2. **Test all generators** in the UI
3. **Add to Discord bot** for campaign planning
4. **Integrate with D&D Beyond** (when API access available)
5. **Add campaign management** (save/load campaigns)

## 💡 Architecture Notes

- **Generators** are pure functions (deterministic, no side effects)
- **Components** are React-based with local state
- **APIs** are async but fail gracefully
- **Canvas rendering** is performant for large maps (80×60+ grids)
