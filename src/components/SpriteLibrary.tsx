import React, { useState } from 'react';
import {
  Sprite,
  SpriteSheet,
  createSprite,
  generateWeaponSprite,
  generateArmorSprite,
  generateMagicItemSprite,
  generateNPCSprite,
  generateMonsterSprite,
  generateTerrainSprite,
} from '../generators/spriteGenerator';

interface SpriteLibraryProps {
  onSpriteSelect?: (sprite: Sprite) => void;
  onSpriteSheetCreate?: (sheet: SpriteSheet) => void;
}

export const SpriteLibrary: React.FC<SpriteLibraryProps> = ({
  onSpriteSelect,
  onSpriteSheetCreate,
}) => {
  const [sprites, setSprites] = useState<Sprite[]>([]);
  const [selectedTab, setSelectedTab] = useState<
    'weapons' | 'armor' | 'magic' | 'npcs' | 'monsters' | 'terrain'
  >('weapons');
  const [searchQuery, setSearchQuery] = useState('');

  // Weapon types
  const weaponTypes = ['sword', 'axe', 'bow', 'staff', 'dagger', 'spear'];
  const armorTypes = ['helmet', 'chest', 'shield', 'legs'];
  const magicTypes = ['amulet', 'ring', 'potion', 'spellbook', 'scroll'];
  const npcRaces = ['human', 'elf', 'dwarf', 'halfling', 'tiefling', 'dragonborn', 'gnome'];
  const monsterTypes = ['goblin', 'skeleton', 'dragon', 'ghost'];
  const terrainTypes = ['grass', 'water', 'mountain', 'forest'];

  const generateSpritesForCategory = (
    category: 'weapons' | 'armor' | 'magic' | 'npcs' | 'monsters' | 'terrain'
  ) => {
    let items: Array<{ name: string; type: string }> = [];

    switch (category) {
      case 'weapons':
        items = weaponTypes.map((w) => ({ name: w.charAt(0).toUpperCase() + w.slice(1), type: w }));
        break;
      case 'armor':
        items = armorTypes.map((a) => ({ name: a.charAt(0).toUpperCase() + a.slice(1), type: a }));
        break;
      case 'magic':
        items = magicTypes.map((m) => ({ name: m.charAt(0).toUpperCase() + m.slice(1), type: m }));
        break;
      case 'npcs':
        items = npcRaces.map((r) => ({ name: r.charAt(0).toUpperCase() + r.slice(1), type: r }));
        break;
      case 'monsters':
        items = monsterTypes.map((m) => ({ name: m.charAt(0).toUpperCase() + m.slice(1), type: m }));
        break;
      case 'terrain':
        items = terrainTypes.map((t) => ({ name: t.charAt(0).toUpperCase() + t.slice(1), type: t }));
        break;
    }

    const generatedSprites = items.map((item) =>
      createSprite(item.name, category === 'npcs' ? 'npc' : category === 'monsters' ? 'monster' : category as any, item.type)
    );

    setSprites(generatedSprites);
  };

  React.useEffect(() => {
    generateSpritesForCategory(selectedTab);
  }, [selectedTab]);

  const filteredSprites = sprites.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSpriteClick = (sprite: Sprite) => {
    if (onSpriteSelect) {
      onSpriteSelect(sprite);
    }
  };

  const handleExportSheet = () => {
    if (sprites.length > 0) {
      const sheet: SpriteSheet = {
        id: `sheet-${Date.now()}`,
        name: `${selectedTab} Sprite Sheet`,
        sprites,
        gridWidth: Math.ceil(Math.sqrt(sprites.length)),
        gridHeight: Math.ceil(Math.sqrt(sprites.length)),
      };
      if (onSpriteSheetCreate) {
        onSpriteSheetCreate(sheet);
      }
      alert(`Created sprite sheet with ${sprites.length} sprites`);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Sprite Library</h2>
        <p>Select sprites for your world building</p>
      </div>

      <div style={styles.tabs}>
        {(['weapons', 'armor', 'magic', 'npcs', 'monsters', 'terrain'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            style={{
              ...styles.tab,
              ...(selectedTab === tab ? styles.tabActive : {}),
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div style={styles.toolbar}>
        <input
          type="text"
          placeholder="Search sprites..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
        <button onClick={handleExportSheet} style={styles.exportButton}>
          Export Sheet
        </button>
      </div>

      <div style={styles.gridContainer}>
        {filteredSprites.length > 0 ? (
          filteredSprites.map((sprite) => (
            <div
              key={sprite.id}
              style={styles.spriteCard}
              onClick={() => handleSpriteClick(sprite)}
              title={`Click to select: ${sprite.name}`}
            >
              <div style={styles.spritePreview}>
                {sprite.svgData && (
                  <div
                    dangerouslySetInnerHTML={{ __html: sprite.svgData }}
                    style={styles.svgContainer}
                  />
                )}
              </div>
              <div style={styles.spriteName}>{sprite.name}</div>
              <div style={styles.spriteType}>{sprite.type}</div>
            </div>
          ))
        ) : (
          <div style={styles.emptyState}>No sprites found</div>
        )}
      </div>

      <div style={styles.info}>
        <p>{filteredSprites.length} sprites available</p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#1e1e1e',
    color: '#e0e0e0',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  header: {
    padding: '16px',
    borderBottom: '1px solid #333',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#252526',
    borderBottom: '1px solid #333',
    overflowX: 'auto',
  },
  tab: {
    padding: '6px 12px',
    backgroundColor: '#3e3e42',
    border: 'none',
    color: '#b4b4b4',
    cursor: 'pointer',
    borderRadius: '4px',
    fontSize: '12px',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
  },
  tabActive: {
    backgroundColor: '#0078d4',
    color: '#fff',
  },
  toolbar: {
    display: 'flex',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#252526',
  },
  searchInput: {
    flex: 1,
    padding: '6px 12px',
    backgroundColor: '#3e3e42',
    border: '1px solid #555',
    color: '#e0e0e0',
    borderRadius: '4px',
    fontSize: '12px',
  },
  exportButton: {
    padding: '6px 16px',
    backgroundColor: '#0078d4',
    border: 'none',
    color: '#fff',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 600,
  },
  gridContainer: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '12px',
    padding: '16px',
    overflowY: 'auto',
  },
  spriteCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#2d2d30',
    border: '1px solid #3e3e42',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  spriteCardHover: {
    backgroundColor: '#3e3e42',
    borderColor: '#0078d4',
  },
  spritePreview: {
    width: '64px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e1e1e',
    borderRadius: '4px',
    marginBottom: '8px',
  },
  svgContainer: {
    width: '100%',
    height: '100%',
  },
  spriteName: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#e0e0e0',
    textAlign: 'center',
    marginBottom: '4px',
  },
  spriteType: {
    fontSize: '10px',
    color: '#858585',
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '32px',
    color: '#858585',
  },
  info: {
    padding: '8px 16px',
    backgroundColor: '#252526',
    borderTop: '1px solid #333',
    fontSize: '12px',
    color: '#858585',
  },
};

export default SpriteLibrary;
