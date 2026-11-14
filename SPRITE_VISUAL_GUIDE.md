# 🎨 Sprite System Visual Guide

## Quick Start - 5 Minute Setup

### Step 1: Launch World Builder
Click the **World Builder** tab in Adventure Table

### Step 2: Create Your First Campaign
```
┌─────────────────────────┐
│ Campaign Name: "Intro"  │
│ Description: "Simple"   │
│ [Create Campaign]       │
└─────────────────────────┘
```

### Step 3: Generate a Map
```
[🏰 Dungeon] [🕳️ Cavern] [🌍 World]
```
Click one to create your base map

### Step 4: Open Sprite Mode
```
[Map Editor] [🎨 Sprite Painter]
```
Click **Sprite Painter** tab

### Step 5: Open Sprite Library
```
[🎨 Open Library] (appears on right side)
```

### Step 6: Place Your First Sprite
1. Click **Weapons** tab in library
2. Click "Sword" sprite
3. Click anywhere on canvas
4. Sprite appears!

---

## Sprite Placement Interface

```
╔══════════════════════════════════════════════════════════════╗
║ ADVENTURE TABLE - SPRITE PAINTER                            ║
╠══════════════════════════════════════════════════════════════╣
║  [🗺️ Map Editor]  [🎨 Sprite Painter]                      ║
║  ──────────────────────────────────────                      ║
║                                                              ║
║  [Place]  [Select]  [Delete]                                ║
║  Status: Sword selected - Click canvas to place             ║
║                                                              ║
║  ┌────────────────────────────────────┐  ┌─────────────┐   ║
║  │                                    │  │  WEAPONS    │   ║
║  │  [Grid showing 800x600 canvas]    │  │  ─────────  │   ║
║  │                                    │  │ [⚔️Sword]   │   ║
║  │     [Placed Sword Sprite]          │  │ [🪓 Axe]    │   ║
║  │           (64x64 px)              │  │ [🏹 Bow]    │   ║
║  │                                    │  │ [⚡ Staff]   │   ║
║  │                                    │  │ [🗡️ Dagger] │   ║
║  │                                    │  │ [🗻 Spear]   │   ║
║  │                                    │  │             │   ║
║  │    Search: [____________]          │  │ 6 sprites   │   ║
║  │                                    │  │ available   │   ║
║  └────────────────────────────────────┘  └─────────────┘   ║
║                                                              ║
║  Scale: [−] 1.00x [+]  | Rotation: [↺] 0° [↻]            ║
║  Position: X: 400 | Y: 300                                 ║
║                              [Clear All]                   ║
╚══════════════════════════════════════════════════════════════╝
```

---

## Sprite Categories & Examples

### 🗡️ WEAPONS
```
┌─────┬─────┬─────┬─────┬─────┬─────┐
│ ⚔️  │ 🪓  │ 🏹  │ ⚡  │ 🗡️  │ 🗻  │
│ Swrd│ Axe │ Bow │ Staff│Dgger│Spear│
└─────┴─────┴─────┴─────┴─────┴─────┘
```

### 🛡️ ARMOR
```
┌─────┬─────┬─────┬─────┐
│ 🪖  │ 💪  │ 🛡️  │ 👢  │
│Helm │Chest│Shld │Legs │
└─────┴─────┴─────┴─────┘
```

### ✨ MAGIC ITEMS
```
┌─────┬─────┬─────┬─────┬─────┐
│ 🔮  │ 💍  │ 🧪  │ 📖  │ 📜  │
│Amul │Ring │Potn │Book │Scrl │
└─────┴─────┴─────┴─────┴─────┘
```

### 👥 NPCs
```
┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐
│👨   │🧝   │🧔   │🧚   │😈   │🐉   │🤖   │
│Hmn  │Elf  │Dwrf │Half │Tiefl│Drgn │Gnme │
└─────┴─────┴─────┴─────┴─────┴─────┴─────┘
```

### 👹 MONSTERS
```
┌─────┬─────┬─────┬─────┐
│ 👺  │ 💀  │ 🐉  │ 👻  │
│Gob  │Skel │Drg  │Ghst │
└─────┴─────┴─────┴─────┘
```

### 🌍 TERRAIN
```
┌─────┬─────┬─────┬─────┐
│ 🌿  │ 🌊  │ ⛰️  │ 🌲  │
│Grss │Watr │Mtn  │Frst │
└─────┴─────┴─────┴─────┘
```

---

## Canvas Drawing & Placement

### Grid System
```
Canvas: 800px × 600px
Grid: 50px intervals
Sprite: 64px × 64px default

    0   50  100 150 200 250 300 350 400 450 500 550 600 650 700 750 800
  ┌──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┐
0 │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │
50│  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │
100│  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │
  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │
  └──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┘
```

### Sprite Placement Example
```
Place a sword at position (400, 300):

    350    400    450
    ├──────┼──────┤
250 │      │      │
    │      │      │
300 │      │ ⚔️   │  <- Sword at 400,300
    │      │      │
350 │      │      │
    ├──────┼──────┤
```

---

## Transform Controls

### SCALE (Size)
```
0.5x   1.0x   1.5x   2.0x   3.0x   5.0x
┌──┐   ┌────┐  ┌──────┐  ┌────────┐  ┌────────────────┐
│⚔│   │ ⚔️ │  │  ⚔️  │  │   ⚔️   │  │      ⚔️       │
└──┘   └────┘  └──────┘  └────────┘  └────────────────┘

Scale [−] 1.50x [+]   <- Current scale: 1.50x
```

### ROTATION (Angle)
```
0°        90°       180°      270°
⚔️   →   ⬇️   →   ⬅️   →   ⬆️
Facing   Facing   Facing   Facing
Right    Down     Left     Up

Rotation [↺] 45° [↻]   <- Current: 45° (facing down-right)
```

### POSITION (X, Y)
```
Canvas:  (0,0)                    (800,0)
         ┌────────────────────────┐
         │                        │
(0,300)  │      Position          │ (800,300)
         │      X: 400            │
         │      Y: 300            │
         │                        │
         │         ⚔️              │
         │                        │
         └────────────────────────┘
(0,600)                      (800,600)

Position: X: 400 | Y: 300
```

---

## Complete Scene Example: Tavern Room

```
┌────────────────────────────────────┐
│ TAVERN INTERIOR                    │
├────────────────────────────────────┤
│                                    │
│  🌿 🌿 🌿 🌿 🌿 🌿 🌿 🌿 🌿 🌿  │
│  🌿                        🌿     │
│  🌿    👨  👨      🧔      🌿    │
│  🌿             🧚              │
│  🌿    🧪  🧪  🧪 💍 🧪  🧪 🌿   │
│  🌿                        🌿     │
│  🌿 🌿 🌿 🌿 🌿 🌿 🌿 🌿 🌿 🌿  │
│                                    │
│ 3 NPCs, 6 items, 1 terrain        │
└────────────────────────────────────┘
```

### Tavern Sprites & Properties
```
Item          Type     X    Y   Scale  Rotation
───────────────────────────────────────────────
Terrain       Grass    400  300  1.0    0°
Human 1       NPC      200  150  1.0    0°
Human 2       NPC      350  150  1.0    0°
Dwarf         NPC      500  150  1.0    0°
Potion 1      Magic    200  250  0.8    0°
Potion 2      Magic    300  250  0.8    0°
Potion 3      Magic    400  250  0.8    0°
Ring          Magic    500  250  0.6    0°
Potion 4      Magic    600  250  0.8    0°
Potion 5      Magic    700  250  0.8    0°
```

---

## Scene Builder Workflow

### STEP 1: Terrain
```
1. Select: Grass from Terrain tab
2. Place at: (400, 300)
3. Scale: 1.0x
4. Done: Base floor ready
```

### STEP 2: NPCs
```
1. Select: Human from NPC tab
2. Place at: (200, 150)
3. Repeat at: (350, 150), (500, 150)
4. Done: 3 NPCs placed
```

### STEP 3: Decorations
```
1. Select: Potion from Magic Items
2. Place at: (200, 250)
3. Repeat: Every 100px (300, 400, 500, 600, 700)
4. Scale: 0.8x for smaller bottles
5. Done: Potion display created
```

### STEP 4: Special Items
```
1. Select: Ring from Magic Items
2. Place at: (500, 250)
3. Scale: 0.6x (extra small)
4. Done: Treasure accent added
```

---

## Keyboard Shortcuts (Future)
```
P - Place mode
S - Select mode
D - Delete mode
Ctrl+Z - Undo
Ctrl+Y - Redo
Delete - Remove selected sprite
Arrow Keys - Fine position adjust
+/- - Scale adjust
```

---

## Color Customization (Advanced)

Most sprites support color parameters:

```typescript
// Generate red sword
generateWeaponSprite('sword', '#FF0000')

// Generate gold armor
generateArmorSprite('chest', '#FFD700')

// Generate silver shield
generateArmorSprite('shield', '#C0C0C0')

// Generate dark elf skin
generateNPCSprite('elf', '#8B4513')
```

---

## Export & Share

### Export Campaign
```
[📥 Export Campaign]
        ↓
Download: campaign_name.json (15-50 KB)
        ↓
Share with players
        ↓
They can import and continue your world
```

### Campaign File Contents
```json
{
  "id": "campaign-123",
  "name": "Shadowvale",
  "description": "Dark forest campaign",
  "maps": [
    {
      "id": "map-1",
      "name": "Tavern",
      "width": 800,
      "height": 600,
      "tiles": [[...]]
    }
  ],
  "sprites": [
    {
      "id": "sprite-1",
      "name": "Human Barkeep",
      "x": 400,
      "y": 300,
      "scale": 1.0,
      "rotation": 0
    }
    // ... more sprites
  ],
  "npcs": [...],
  "encounters": [...]
}
```

---

## Tips & Tricks

### ✨ Quick Placement
- Sprites don't snap to grid (free placement)
- Use canvas grid lines for rough alignment
- Position display shows exact coordinates

### 🎯 Layering
- First placed = bottom layer
- Last placed = top layer
- Can't reorder yet (planned feature)

### 📐 Perfect Alignment
```
50px grid = 0.78 sprites wide
100px = 1.56 sprites
150px = 2.34 sprites
200px = 3.13 sprites (recommended spacing)
```

### 🎨 Visual Balance
- Don't overcrowd (max 15-20 sprites per scene)
- Mix scales for depth (1.0x center, 0.5-0.8x periphery)
- Use terrain to frame scene

### 🚀 Performance
- Renders smoothly with 100+ sprites
- Grid overlay auto-hides if slow
- Export remains fast even with many sprites

---

## Troubleshooting Visual Guide

### Problem: Sprite Not Appearing
```
NOT WORKING:
├─ In Map Editor mode? ✗
└─ Solution: Switch to Sprite Painter tab

WORKING:
├─ In Sprite Painter mode? ✓
├─ Library panel open? ✓
├─ Sprite selected? ✓
└─ Canvas has focus? ✓
```

### Problem: Can't Rotate
```
NOT WORKING:
├─ In Place mode? ✗
└─ Solution: Use Select mode first

WORKING:
├─ Select mode active? ✓
├─ Sprite highlighted? ✓
├─ Rotation buttons visible? ✓
└─ Click rotation buttons
```

---

## Next: Start Building!

```
YOU ARE READY! 🎉

1. Open World Builder
2. Create a Campaign
3. Generate a Map
4. Switch to Sprite Painter
5. Click 🎨 Open Library
6. Select sprites and place them
7. Transform and arrange
8. Export when complete
9. Share with players!

Your first world is just 5 clicks away!
```

**Happy World Building! 🗺️✨**
