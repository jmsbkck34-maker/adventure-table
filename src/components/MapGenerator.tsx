import React, { useState } from 'react';
import { generateBSPDungeon, generateCavern, generateWorldMap } from '../generators/mapGenerator';
import type { DungeonMap, WorldMap } from '../generators/mapGenerator';

export const MapGenerator: React.FC = () => {
  const [mapType, setMapType] = useState<'dungeon' | 'cavern' | 'world'>('dungeon');
  const [dungeonMap, setDungeonMap] = useState<DungeonMap | null>(null);
  const [worldMap, setWorldMap] = useState<WorldMap | null>(null);
  const [canvasRef, setCanvasRef] = React.useState<HTMLCanvasElement | null>(null);

  const generateDungeon = () => {
    const map = generateBSPDungeon();
    setDungeonMap(map);
    renderDungeonMap(map);
  };

  const generateCaverns = () => {
    const map = generateCavern();
    setDungeonMap(map);
    renderDungeonMap(map);
  };

  const generateWorld = () => {
    const map = generateWorldMap();
    setWorldMap(map);
    renderWorldMap(map);
  };

  const renderDungeonMap = (map: DungeonMap) => {
    if (!canvasRef) return;

    const canvas = canvasRef;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = Math.floor(canvas.width / map.width);
    canvas.height = map.height * cellSize;

    // Draw tiles
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const tile = map.tiles[y][x];
        ctx.fillStyle = tile === 0 ? '#222' : '#999';
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        ctx.strokeStyle = '#555';
        ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }

    // Draw rooms
    ctx.fillStyle = '#4CAF50';
    map.rooms.forEach((room) => {
      ctx.fillRect(room.x * cellSize + 1, room.y * cellSize + 1, room.width * cellSize - 2, room.height * cellSize - 2);
    });
  };

  const renderWorldMap = (map: WorldMap) => {
    if (!canvasRef) return;

    const canvas = canvasRef;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = Math.floor(canvas.width / map.width);
    canvas.height = map.height * cellSize;

    const biomeColors: Record<string, string> = {
      water: '#0077be',
      forest: '#2d5016',
      grassland: '#90ee90',
      mountain: '#8b7355',
      desert: '#edcc81',
      swamp: '#6b8e23',
    };

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const tile = map.tiles[y][x];
        ctx.fillStyle = biomeColors[tile.type] || '#999';
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>🗺️ Map Generator</h2>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={generateDungeon}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            🏰 Generate Dungeon
          </button>
          <button
            onClick={generateCaverns}
            style={{
              padding: '10px 20px',
              backgroundColor: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            🕳️ Generate Cavern
          </button>
          <button
            onClick={generateWorld}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            🌍 Generate World
          </button>
        </div>

        <div style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#333',
        }}>
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

        {dungeonMap && (
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
            <h3>Dungeon Stats</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
              <div>
                <strong>Rooms:</strong> {dungeonMap.rooms.length}
              </div>
              <div>
                <strong>Dimensions:</strong> {dungeonMap.width} × {dungeonMap.height}
              </div>
              <div>
                <strong>Floor Coverage:</strong> {Math.round((dungeonMap.tiles.flat().filter(t => t === 0).length / (dungeonMap.width * dungeonMap.height)) * 100)}%
              </div>
            </div>
          </div>
        )}

        {worldMap && (
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
            <h3>World Stats</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', gap: '10px' }}>
              <div><strong>Water:</strong> {worldMap.tiles.flat().filter(t => t.type === 'water').length}</div>
              <div><strong>Forest:</strong> {worldMap.tiles.flat().filter(t => t.type === 'forest').length}</div>
              <div><strong>Grassland:</strong> {worldMap.tiles.flat().filter(t => t.type === 'grassland').length}</div>
              <div><strong>Mountain:</strong> {worldMap.tiles.flat().filter(t => t.type === 'mountain').length}</div>
              <div><strong>Desert:</strong> {worldMap.tiles.flat().filter(t => t.type === 'desert').length}</div>
              <div><strong>Swamp:</strong> {worldMap.tiles.flat().filter(t => t.type === 'swamp').length}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapGenerator;
