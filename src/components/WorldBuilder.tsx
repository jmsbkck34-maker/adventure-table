import React, { useState, useEffect } from 'react';
import { 
  Campaign, 
  MapData,
  getAllCampaigns, 
  loadCampaign, 
  createCampaign, 
  deleteCampaign,
  addMapToCampaign,
  exportCampaign,
} from '../generators/campaignManager';
import { generateBSPDungeon, generateCavern, generateWorldMap } from '../generators/mapGenerator';
import SpriteLibrary from './SpriteLibrary';
import SpritePainter, { PlacedSprite } from './SpritePainter';
import { Sprite } from '../generators/spriteGenerator';

export const WorldBuilder: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignDesc, setNewCampaignDesc] = useState('');
  const [canvasRef, setCanvasRef] = React.useState<HTMLCanvasElement | null>(null);
  const [selectedSprite, setSelectedSprite] = useState<Sprite | undefined>();
  const [placedSprites, setPlacedSprites] = useState<PlacedSprite[]>([]);
  const [showSpriteLibrary, setShowSpriteLibrary] = useState(false);
  const [editMode, setEditMode] = useState<'map' | 'sprites'>('map');

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = () => {
    const allCampaigns = getAllCampaigns();
    setCampaigns(allCampaigns);
  };

  const handleCreateCampaign = () => {
    if (!newCampaignName.trim()) return;
    const campaign = createCampaign(newCampaignName, newCampaignDesc);
    setCampaigns([...campaigns, campaign]);
    setNewCampaignName('');
    setNewCampaignDesc('');
  };

  const handleDeleteCampaign = (id: string) => {
    if (confirm('Delete this campaign? This cannot be undone.')) {
      deleteCampaign(id);
      setCampaigns(campaigns.filter(c => c.id !== id));
      if (selectedCampaign?.id === id) setSelectedCampaign(null);
    }
  };

  const handleGenerateMap = (type: 'dungeon' | 'cavern' | 'world') => {
    if (!selectedCampaign) return;

    let mapData: any;
    let name = '';

    switch (type) {
      case 'dungeon':
        mapData = generateBSPDungeon();
        name = `Dungeon - ${new Date().toLocaleDateString()}`;
        break;
      case 'cavern':
        mapData = generateCavern();
        name = `Cavern - ${new Date().toLocaleDateString()}`;
        break;
      case 'world':
        mapData = generateWorldMap();
        name = `World - ${new Date().toLocaleDateString()}`;
        break;
    }

    const newMap: MapData = {
      id: `map-${Date.now()}`,
      campaignId: selectedCampaign.id,
      name,
      description: `Generated ${type}`,
      type,
      width: mapData.width,
      height: mapData.height,
      tiles: mapData.tiles,
      locations: [],
      encounters: [],
      createdAt: new Date(),
    };

    addMapToCampaign(selectedCampaign.id, newMap);
    const updated = loadCampaign(selectedCampaign.id);
    if (updated) setSelectedCampaign(updated);
    renderMap(newMap);
    setPlacedSprites([]);
  };

  const renderMap = (map: MapData) => {
    if (!canvasRef) return;

    const canvas = canvasRef;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = Math.floor(canvas.width / map.width);
    canvas.height = map.height * cellSize;

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const tile = map.tiles[y][x];
        
        let color = '#222'; // default wall
        if (tile === 0) color = '#444'; // floor
        else if (tile === 1) color = '#999'; // wall

        ctx.fillStyle = color;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  };

  const handleExportCampaign = (campaign: Campaign) => {
    const json = exportCampaign(campaign);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${campaign.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', height: '100vh', gap: 0 }}>
      {/* Sidebar: Campaign Manager */}
      <div style={{ backgroundColor: '#1a1a1a', color: '#fff', padding: '20px', overflowY: 'auto', borderRight: '1px solid #333' }}>
        <h2>🌍 World Builder</h2>

        {/* Create Campaign */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '0.95em', marginBottom: '10px' }}>New Campaign</h3>
          <input
            type="text"
            placeholder="Campaign name"
            value={newCampaignName}
            onChange={(e) => setNewCampaignName(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              marginBottom: '8px',
              borderRadius: '4px',
              border: '1px solid #444',
              backgroundColor: '#222',
              color: '#fff',
              boxSizing: 'border-box',
            }}
          />
          <textarea
            placeholder="Description"
            value={newCampaignDesc}
            onChange={(e) => setNewCampaignDesc(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              marginBottom: '8px',
              borderRadius: '4px',
              border: '1px solid #444',
              backgroundColor: '#222',
              color: '#fff',
              minHeight: '60px',
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={handleCreateCampaign}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Create Campaign
          </button>
        </div>

        {/* Campaigns List */}
        <h3 style={{ fontSize: '0.95em', marginBottom: '10px' }}>Your Campaigns</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              onClick={() => setSelectedCampaign(campaign)}
              style={{
                padding: '12px',
                backgroundColor: selectedCampaign?.id === campaign.id ? '#333' : '#222',
                borderRadius: '4px',
                cursor: 'pointer',
                borderLeft: selectedCampaign?.id === campaign.id ? '3px solid #4CAF50' : '3px solid #333',
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '0.95em' }}>{campaign.name}</div>
              <div style={{ fontSize: '0.85em', color: '#999', marginTop: '4px' }}>
                {campaign.maps.length} maps • {campaign.npcs.length} NPCs
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCampaign(campaign.id);
                }}
                style={{
                  width: '100%',
                  padding: '6px',
                  marginTop: '8px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.85em',
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Area: World Building */}
      <div style={{ display: 'grid', gridTemplateColumns: showSpriteLibrary ? '1fr 280px' : '1fr', height: '100vh', backgroundColor: '#0a0a0a' }}>
        <div style={{ padding: '30px', overflowY: 'auto' }}>
          {selectedCampaign ? (
            <div>
              <h1>{selectedCampaign.name}</h1>
              <p style={{ color: '#999', marginBottom: '20px' }}>{selectedCampaign.description}</p>

              {/* Edit Mode Tabs */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <button
                  onClick={() => setEditMode('map')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: editMode === 'map' ? '#0078d4' : '#3e3e42',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  🗺️ Map Editor
                </button>
                <button
                  onClick={() => setEditMode('sprites')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: editMode === 'sprites' ? '#0078d4' : '#3e3e42',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  🎨 Sprite Painter
                </button>
              </div>

              {editMode === 'map' ? (
                <>
                  {/* Map Generation */}
                  <div style={{ marginBottom: '30px' }}>
                    <h2 style={{ marginBottom: '15px' }}>Generate Maps</h2>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleGenerateMap('dungeon')}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#2196F3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        🏰 Dungeon
                      </button>
                      <button
                        onClick={() => handleGenerateMap('cavern')}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#FF9800',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        🕳️ Cavern
                      </button>
                      <button
                        onClick={() => handleGenerateMap('world')}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        🌍 World
                      </button>
                    </div>

                    {/* Map Preview */}
                    {selectedCampaign.maps.length > 0 && (
                      <div>
                        <h3>Recent Maps</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                          {selectedCampaign.maps.map((map) => (
                            <div
                              key={map.id}
                              style={{
                                padding: '15px',
                                backgroundColor: '#1a1a1a',
                                borderRadius: '8px',
                                border: '1px solid #333',
                              }}
                            >
                              <strong>{map.name}</strong>
                              <div style={{ fontSize: '0.9em', color: '#999', marginTop: '5px' }}>
                                {map.width} × {map.height} • {map.type}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Canvas for current map */}
                        <div style={{ border: '1px solid #333', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#222' }}>
                          <canvas
                            ref={setCanvasRef}
                            width={800}
                            height={600}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: 'auto',
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Sprite Painter Mode */}
                  <div style={{ marginBottom: '20px' }}>
                    <h2 style={{ marginBottom: '15px' }}>Place Objects on Map</h2>
                    <button
                      onClick={() => setShowSpriteLibrary(!showSpriteLibrary)}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#9C27B0',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      {showSpriteLibrary ? '✕ Hide Library' : '🎨 Open Library'}
                    </button>
                    {selectedSprite && (
                      <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#2d2d30', borderRadius: '4px' }}>
                        Selected: <strong>{selectedSprite.name}</strong> - Click canvas to place
                      </div>
                    )}
                  </div>

                  {selectedCampaign.maps.length > 0 && (
                    <div style={{ border: '1px solid #333', borderRadius: '8px', overflow: 'hidden' }}>
                      <SpritePainter
                        width={800}
                        height={600}
                        selectedSprite={selectedSprite}
                        placedSprites={placedSprites}
                        onSpritePlaced={(sprite) => setPlacedSprites([...placedSprites, sprite])}
                        onSpritesUpdate={setPlacedSprites}
                      />
                    </div>
                  )}
                </>
              )}

              {/* Export */}
              <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
                <h3>📥 Export Campaign</h3>
                <p style={{ color: '#999', marginBottom: '10px' }}>Save your campaign as JSON</p>
                <button
                  onClick={() => handleExportCampaign(selectedCampaign)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#9C27B0',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Download Campaign
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#999', marginTop: '100px' }}>
              <h2>Select or create a campaign to get started</h2>
            </div>
          )}
        </div>

        {/* Sprite Library Sidebar */}
        {showSpriteLibrary && editMode === 'sprites' && (
          <div style={{ borderLeft: '1px solid #333', overflowY: 'auto' }}>
            <SpriteLibrary
              onSpriteSelect={(sprite) => setSelectedSprite(sprite)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default WorldBuilder;
