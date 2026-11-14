import React, { useState } from 'react';
import { generateNPC, generateEncounter, generateLootTable } from '../generators/contentGenerator';
import type { NPC, Encounter, LootTable } from '../generators/contentGenerator';

export const CampaignTools: React.FC = () => {
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [loot, setLoot] = useState<LootTable | null>(null);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>🏰 Campaign Tools</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '40px' }}>
        {/* NPC Generator */}
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <h3>🧙 NPC Generator</h3>
          <button
            onClick={() => setNpcs([...npcs, generateNPC()])}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%',
              marginBottom: '10px',
            }}
          >
            Generate NPC
          </button>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {npcs.map((npc) => (
              <div key={npc.id} style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <strong>{npc.name}</strong>
                <div style={{ fontSize: '0.9em', color: '#666' }}>
                  {npc.race} {npc.class} - {npc.alignment}
                </div>
                <div style={{ fontSize: '0.85em', marginTop: '5px' }}>
                  <strong>Traits:</strong> {npc.personality.join(', ')}
                </div>
                <div style={{ fontSize: '0.85em' }}>
                  <strong>Goals:</strong> {npc.goals.join(', ')}
                </div>
                <div style={{ fontSize: '0.85em' }}>
                  <strong>Secret:</strong> {npc.secrets}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Encounter Generator */}
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <h3>⚔️ Encounter Generator</h3>
          <button
            onClick={() => setEncounters([...encounters, generateEncounter()])}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%',
              marginBottom: '10px',
            }}
          >
            Generate Encounter
          </button>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {encounters.map((enc) => (
              <div key={enc.id} style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#ffe0e0', borderRadius: '4px' }}>
                <strong>{enc.name}</strong>
                <div style={{ fontSize: '0.9em', color: '#666' }}>
                  Difficulty: <span style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>{enc.difficulty}</span>
                </div>
                <div style={{ fontSize: '0.85em', marginTop: '5px' }}>
                  {enc.creatures.map((c) => (
                    <div key={c.name}>
                      {c.count}x {c.name} (CR {c.cr})
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Loot Generator */}
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <h3>💰 Loot Generator</h3>
          <button
            onClick={() => setLoot(generateLootTable())}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%',
              marginBottom: '10px',
            }}
          >
            Generate Loot
          </button>
          {loot && (
            <div style={{ padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>Gold:</strong> {loot.gold.min} - {loot.gold.max} gp
              </div>
              <div>
                <strong>Items:</strong>
                {loot.items.map((item) => (
                  <div key={item.name} style={{ fontSize: '0.9em', marginTop: '5px' }}>
                    • {item.name} <span style={{ color: '#666' }}>({item.rarity})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignTools;
