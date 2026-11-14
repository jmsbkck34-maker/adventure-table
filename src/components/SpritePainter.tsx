import React, { useRef, useEffect, useState } from 'react';
import { Sprite } from '../generators/spriteGenerator';

export interface PlacedSprite extends Sprite {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
}

interface SpritePainterProps {
  width: number;
  height: number;
  selectedSprite?: Sprite;
  onSpritePlaced?: (sprite: PlacedSprite) => void;
  placedSprites?: PlacedSprite[];
  onSpritesUpdate?: (sprites: PlacedSprite[]) => void;
}

export const SpritePainter: React.FC<SpritePainterProps> = ({
  width,
  height,
  selectedSprite,
  onSpritePlaced,
  placedSprites = [],
  onSpritesUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sprites, setSprites] = useState<PlacedSprite[]>(placedSprites);
  const [selectedSpriteIndex, setSelectedSpriteIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [mode, setMode] = useState<'place' | 'select' | 'delete'>('place');

  // Draw sprites on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i <= height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Draw sprites
    sprites.forEach((sprite, index) => {
      if (sprite.svgData) {
        drawSpriteOnCanvas(ctx, sprite, index === selectedSpriteIndex);
      }
    });
  }, [sprites, selectedSpriteIndex, width, height]);

  const drawSpriteOnCanvas = (
    ctx: CanvasRenderingContext2D,
    sprite: PlacedSprite,
    isSelected: boolean
  ) => {
    const img = new Image();
    img.onload = () => {
      ctx.save();
      ctx.translate(sprite.x, sprite.y);
      ctx.rotate((sprite.rotation * Math.PI) / 180);
      ctx.scale(sprite.scale, sprite.scale);
      ctx.drawImage(img, -32, -32, 64, 64);

      // Draw selection box
      if (isSelected) {
        ctx.strokeStyle = '#0078d4';
        ctx.lineWidth = 2;
        ctx.strokeRect(-32, -32, 64, 64);
      }

      ctx.restore();
    };
    img.src = sprite.imageUrl;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mode === 'place' && selectedSprite) {
      const newSprite: PlacedSprite = {
        ...selectedSprite,
        x,
        y,
        scale: 1,
        rotation: 0,
        zIndex: sprites.length,
      };
      const updatedSprites = [...sprites, newSprite];
      setSprites(updatedSprites);
      if (onSpritePlaced) {
        onSpritePlaced(newSprite);
      }
      if (onSpritesUpdate) {
        onSpritesUpdate(updatedSprites);
      }
    } else if (mode === 'select') {
      // Check if clicked on a sprite
      let clickedIndex = -1;
      for (let i = sprites.length - 1; i >= 0; i--) {
        const sprite = sprites[i];
        const dx = x - sprite.x;
        const dy = y - sprite.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 32 * sprite.scale) {
          clickedIndex = i;
          break;
        }
      }
      setSelectedSpriteIndex(clickedIndex >= 0 ? clickedIndex : null);
    } else if (mode === 'delete' && selectedSpriteIndex !== null) {
      const updatedSprites = sprites.filter((_, i) => i !== selectedSpriteIndex);
      setSprites(updatedSprites);
      setSelectedSpriteIndex(null);
      if (onSpritesUpdate) {
        onSpritesUpdate(updatedSprites);
      }
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode === 'select' && selectedSpriteIndex !== null) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const sprite = sprites[selectedSpriteIndex];

      const dx = x - sprite.x;
      const dy = y - sprite.y;
      setDragOffset({ x: dx, y: dy });
      setIsDragging(true);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging && selectedSpriteIndex !== null) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const updatedSprites = [...sprites];
      updatedSprites[selectedSpriteIndex].x = x - dragOffset.x;
      updatedSprites[selectedSpriteIndex].y = y - dragOffset.y;
      setSprites(updatedSprites);

      if (onSpritesUpdate) {
        onSpritesUpdate(updatedSprites);
      }
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const handleScaleChange = (delta: number) => {
    if (selectedSpriteIndex !== null) {
      const updatedSprites = [...sprites];
      updatedSprites[selectedSpriteIndex].scale = Math.max(
        0.5,
        updatedSprites[selectedSpriteIndex].scale + delta
      );
      setSprites(updatedSprites);
      if (onSpritesUpdate) {
        onSpritesUpdate(updatedSprites);
      }
    }
  };

  const handleRotationChange = (delta: number) => {
    if (selectedSpriteIndex !== null) {
      const updatedSprites = [...sprites];
      updatedSprites[selectedSpriteIndex].rotation = (updatedSprites[selectedSpriteIndex].rotation + delta) % 360;
      setSprites(updatedSprites);
      if (onSpritesUpdate) {
        onSpritesUpdate(updatedSprites);
      }
    }
  };

  const handleClear = () => {
    if (confirm('Clear all sprites from the canvas?')) {
      setSprites([]);
      setSelectedSpriteIndex(null);
      if (onSpritesUpdate) {
        onSpritesUpdate([]);
      }
    }
  };

  const selectedInfo = selectedSpriteIndex !== null ? sprites[selectedSpriteIndex] : null;

  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
        <div style={styles.modeSelector}>
          <button
            onClick={() => setMode('place')}
            style={{
              ...styles.modeButton,
              ...(mode === 'place' ? styles.modeButtonActive : {}),
            }}
          >
            Place
          </button>
          <button
            onClick={() => setMode('select')}
            style={{
              ...styles.modeButton,
              ...(mode === 'select' ? styles.modeButtonActive : {}),
            }}
          >
            Select
          </button>
          <button
            onClick={() => setMode('delete')}
            style={{
              ...styles.modeButton,
              ...(mode === 'delete' ? styles.modeButtonActive : {}),
            }}
          >
            Delete
          </button>
        </div>

        <div style={styles.statusBar}>
          {selectedSprite && mode === 'place' && (
            <span>{selectedSprite.name} - Click canvas to place</span>
          )}
          {selectedInfo && mode === 'select' && (
            <span>{selectedInfo.name} selected</span>
          )}
          {sprites.length > 0 && (
            <span style={{ marginLeft: 'auto' }}>
              {sprites.length} sprite{sprites.length !== 1 ? 's' : ''} placed
            </span>
          )}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onClick={handleCanvasClick}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        style={styles.canvas}
      />

      {selectedInfo && (
        <div style={styles.properties}>
          <div style={styles.propertyGroup}>
            <label>Scale</label>
            <div style={styles.controls}>
              <button onClick={() => handleScaleChange(-0.1)}>−</button>
              <span>{selectedInfo.scale.toFixed(2)}x</span>
              <button onClick={() => handleScaleChange(0.1)}>+</button>
            </div>
          </div>
          <div style={styles.propertyGroup}>
            <label>Rotation</label>
            <div style={styles.controls}>
              <button onClick={() => handleRotationChange(-15)}>↺</button>
              <span>{selectedInfo.rotation}°</span>
              <button onClick={() => handleRotationChange(15)}>↻</button>
            </div>
          </div>
          <div style={styles.propertyGroup}>
            <label>Position</label>
            <div style={styles.positionInfo}>
              X: {Math.round(selectedInfo.x)} | Y: {Math.round(selectedInfo.y)}
            </div>
          </div>
          <button onClick={handleClear} style={styles.clearButton}>
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#1e1e1e',
  },
  toolbar: {
    display: 'flex',
    gap: '16px',
    padding: '12px',
    backgroundColor: '#252526',
    borderBottom: '1px solid #333',
    alignItems: 'center',
  },
  modeSelector: {
    display: 'flex',
    gap: '4px',
  },
  modeButton: {
    padding: '6px 12px',
    backgroundColor: '#3e3e42',
    border: '1px solid #555',
    color: '#b4b4b4',
    cursor: 'pointer',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
    transition: 'all 0.2s',
  },
  modeButtonActive: {
    backgroundColor: '#0078d4',
    borderColor: '#0078d4',
    color: '#fff',
  },
  statusBar: {
    flex: 1,
    display: 'flex',
    fontSize: '12px',
    color: '#858585',
    gap: '12px',
  },
  canvas: {
    flex: 1,
    cursor: 'crosshair',
    border: '1px solid #333',
    backgroundColor: '#f0f0f0',
  },
  properties: {
    display: 'flex',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#252526',
    borderTop: '1px solid #333',
    alignItems: 'center',
  },
  propertyGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#3e3e42',
    borderRadius: '4px',
    padding: '4px',
  },
  positionInfo: {
    fontSize: '12px',
    color: '#e0e0e0',
  },
  clearButton: {
    marginLeft: 'auto',
    padding: '6px 12px',
    backgroundColor: '#d32f2f',
    border: 'none',
    color: '#fff',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
};

export default SpritePainter;
