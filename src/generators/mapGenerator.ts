// Map generation utilities for various dungeon/world types

export interface Room {
  x: number;
  y: number;
  width: number;
  height: number;
  id: string;
}

export interface Corridor {
  rooms: string[];
  path: Array<{ x: number; y: number }>;
}

export interface DungeonMap {
  rooms: Room[];
  corridors: Corridor[];
  width: number;
  height: number;
  tiles: number[][];
}

// BSP (Binary Space Partition) dungeon generator
export function generateBSPDungeon(width: number = 80, height: number = 60): DungeonMap {
  const tiles = Array(height).fill(null).map(() => Array(width).fill(1)); // 1 = wall
  const rooms: Room[] = [];
  
  interface Node {
    x: number;
    y: number;
    width: number;
    height: number;
    left?: Node;
    right?: Node;
  }

  function splitNode(node: Node, depth: number = 0): void {
    const MIN_SIZE = 10;
    const MAX_DEPTH = 6;

    if (depth > MAX_DEPTH) return;

    if (node.width > node.height) {
      const splitX = node.x + Math.floor(Math.random() * (node.width - MIN_SIZE * 2) + MIN_SIZE);
      node.left = { x: node.x, y: node.y, width: splitX - node.x, height: node.height };
      node.right = { x: splitX, y: node.y, width: node.x + node.width - splitX, height: node.height };
    } else {
      const splitY = node.y + Math.floor(Math.random() * (node.height - MIN_SIZE * 2) + MIN_SIZE);
      node.left = { x: node.x, y: node.y, width: node.width, height: splitY - node.y };
      node.right = { x: node.x, y: splitY, width: node.width, height: node.y + node.height - splitY };
    }

    splitNode(node.left, depth + 1);
    splitNode(node.right, depth + 1);
  }

  function createRoom(node: Node): void {
    if (node.left && node.right) {
      createRoom(node.left);
      createRoom(node.right);
    } else {
      const roomWidth = Math.random() * (node.width - 4) + 4;
      const roomHeight = Math.random() * (node.height - 4) + 4;
      const roomX = node.x + Math.floor((node.width - roomWidth) / 2);
      const roomY = node.y + Math.floor((node.height - roomHeight) / 2);

      const room: Room = {
        x: roomX,
        y: roomY,
        width: Math.floor(roomWidth),
        height: Math.floor(roomHeight),
        id: `room-${rooms.length}`,
      };

      // Carve out room
      for (let y = room.y; y < room.y + room.height; y++) {
        for (let x = room.x; x < room.x + room.width; x++) {
          if (x >= 0 && x < width && y >= 0 && y < height) {
            tiles[y][x] = 0; // 0 = floor
          }
        }
      }

      rooms.push(room);
    }
  }

  const root: Node = { x: 0, y: 0, width, height };
  splitNode(root);
  createRoom(root);

  return { rooms, corridors: [], width, height, tiles };
}

// Simple cellular automaton cave generator
export function generateCavern(width: number = 80, height: number = 60): DungeonMap {
  const tiles = Array(height).fill(null).map(() =>
    Array(width).fill(null).map(() => (Math.random() > 0.45 ? 1 : 0))
  );

  // Smooth the caves
  for (let iteration = 0; iteration < 5; iteration++) {
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let neighbors = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (tiles[y + dy][x + dx] === 1) neighbors++;
          }
        }
        tiles[y][x] = neighbors > 4 ? 1 : 0;
      }
    }
  }

  return { rooms: [], corridors: [], width, height, tiles };
}

// World map with biomes
export interface WorldTile {
  type: 'water' | 'forest' | 'grassland' | 'mountain' | 'desert' | 'swamp';
  elevation: number;
}

export interface WorldMap {
  tiles: WorldTile[][];
  width: number;
  height: number;
}

export function generateWorldMap(width: number = 100, height: number = 100): WorldMap {
  const tiles: WorldTile[][] = Array(height).fill(null).map(() =>
    Array(width).fill(null).map(() => ({
      type: 'grassland' as const,
      elevation: Math.random() * 100,
    }))
  );

  // Simple Perlin-like noise (simplified)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const elevation = Math.sin(x / 20) * Math.cos(y / 20) * 50 + 50;

      if (elevation < 30) {
        tiles[y][x].type = 'water';
      } else if (elevation < 40) {
        tiles[y][x].type = 'swamp';
      } else if (elevation < 60) {
        tiles[y][x].type = Math.random() > 0.5 ? 'grassland' : 'forest';
      } else if (elevation < 80) {
        tiles[y][x].type = 'forest';
      } else {
        tiles[y][x].type = 'mountain';
      }

      tiles[y][x].elevation = elevation;
    }
  }

  return { tiles, width, height };
}
