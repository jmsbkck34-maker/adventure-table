import React, { useState, useEffect } from 'react';
import { searchMonsters, searchSpells, getMonsterManual } from '../generators/dndBeyond';
import type { DDBMonster, DDBSpell } from '../generators/dndBeyond';

export const DnDBeyond: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'monsters' | 'spells' | 'manual'>('monsters');
  const [searchQuery, setSearchQuery] = useState('');
  const [monsters, setMonsters] = useState<DDBMonster[]>([]);
  const [spells, setSpells] = useState<DDBSpell[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonster, setSelectedMonster] = useState<DDBMonster | null>(null);
  const [selectedSpell, setSelectedSpell] = useState<DDBSpell | null>(null);

  const handleSearchMonsters = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    const results = await searchMonsters(searchQuery);
    setMonsters(results);
    setLoading(false);
  };

  const handleSearchSpells = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    const results = await searchSpells(searchQuery);
    setSpells(results);
    setLoading(false);
  };

  const handleLoadMonsterManual = async () => {
    setLoading(true);
    const results = await getMonsterManual();
    setMonsters(results);
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>📚 D&D Beyond Reference</h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #ddd' }}>
        <button
          onClick={() => setActiveTab('monsters')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'monsters' ? '#2196F3' : '#f0f0f0',
            color: activeTab === 'monsters' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer',
          }}
        >
          🐉 Monsters
        </button>
        <button
          onClick={() => setActiveTab('spells')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'spells' ? '#2196F3' : '#f0f0f0',
            color: activeTab === 'spells' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer',
          }}
        >
          ✨ Spells
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'manual' ? '#2196F3' : '#f0f0f0',
            color: activeTab === 'manual' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer',
          }}
        >
          📖 Manual
        </button>
      </div>

      {/* Monsters Tab */}
      {activeTab === 'monsters' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          <div>
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="Search for monsters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchMonsters()}
                style={{
                  padding: '10px',
                  width: '100%',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  marginBottom: '10px',
                }}
              />
              <button
                onClick={handleSearchMonsters}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  width: '100%',
                }}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
              {monsters.map((monster) => (
                <div
                  key={monster.index}
                  onClick={() => setSelectedMonster(monster)}
                  style={{
                    padding: '15px',
                    border: selectedMonster?.index === monster.index ? '2px solid #2196F3' : '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    backgroundColor: selectedMonster?.index === monster.index ? '#e3f2fd' : '#fff',
                  }}
                >
                  <strong>{monster.name}</strong>
                  <div style={{ fontSize: '0.9em', color: '#666' }}>
                    {monster.type} • AC {monster.ac}
                  </div>
                  <div style={{ fontSize: '0.85em', color: '#999' }}>
                    HP: {monster.hp}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monster Details */}
          {selectedMonster && (
            <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
              <h3>{selectedMonster.name}</h3>
              <table style={{ width: '100%', marginBottom: '15px', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '5px', fontWeight: 'bold' }}>Type:</td>
                    <td style={{ padding: '5px' }}>{selectedMonster.type}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '5px', fontWeight: 'bold' }}>AC:</td>
                    <td style={{ padding: '5px' }}>{selectedMonster.ac}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '5px', fontWeight: 'bold' }}>HP:</td>
                    <td style={{ padding: '5px' }}>{selectedMonster.hp}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '5px', fontWeight: 'bold' }}>Alignment:</td>
                    <td style={{ padding: '5px' }}>{selectedMonster.alignment}</td>
                  </tr>
                </tbody>
              </table>

              <h4>Ability Scores</h4>
              <table style={{ width: '100%', marginBottom: '15px', fontSize: '0.9em', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '3px' }}><strong>STR:</strong> {selectedMonster.stats.str}</td>
                    <td style={{ padding: '3px' }}><strong>DEX:</strong> {selectedMonster.stats.dex}</td>
                    <td style={{ padding: '3px' }}><strong>CON:</strong> {selectedMonster.stats.con}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '3px' }}><strong>INT:</strong> {selectedMonster.stats.int}</td>
                    <td style={{ padding: '3px' }}><strong>WIS:</strong> {selectedMonster.stats.wis}</td>
                    <td style={{ padding: '3px' }}><strong>CHA:</strong> {selectedMonster.stats.cha}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Spells Tab */}
      {activeTab === 'spells' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Search for spells..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchSpells()}
              style={{
                padding: '10px',
                width: '100%',
                borderRadius: '4px',
                border: '1px solid #ccc',
                marginBottom: '10px',
              }}
            />
            <button
              onClick={handleSearchSpells}
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                width: '100%',
              }}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {spells.map((spell) => (
                <div
                  key={spell.index}
                  onClick={() => setSelectedSpell(spell)}
                  style={{
                    padding: '10px',
                    marginBottom: '10px',
                    border: selectedSpell?.index === spell.index ? '2px solid #2196F3' : '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    backgroundColor: selectedSpell?.index === spell.index ? '#e3f2fd' : '#fff',
                  }}
                >
                  <strong>{spell.name}</strong>
                  <div style={{ fontSize: '0.85em', color: '#666' }}>
                    Level {spell.level} {spell.school}
                  </div>
                </div>
              ))}
            </div>

            {selectedSpell && (
              <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', backgroundColor: '#f9f9f9', maxHeight: '500px', overflowY: 'auto' }}>
                <h3>{selectedSpell.name}</h3>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Level:</strong> {selectedSpell.level}<br />
                  <strong>School:</strong> {selectedSpell.school}<br />
                  <strong>Casting Time:</strong> {selectedSpell.castingTime}<br />
                  <strong>Range:</strong> {selectedSpell.range}<br />
                  <strong>Duration:</strong> {selectedSpell.duration}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Components:</strong> {selectedSpell.components.join(', ')}
                </div>
                <div>
                  <strong>Description:</strong>
                  {selectedSpell.description.map((desc, idx) => (
                    <p key={idx} style={{ fontSize: '0.9em', marginTop: '5px' }}>
                      {desc}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Tab */}
      {activeTab === 'manual' && (
        <div>
          <button
            onClick={handleLoadMonsterManual}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '20px',
            }}
          >
            {loading ? 'Loading...' : 'Load Monster Manual'}
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
            {monsters.map((monster) => (
              <div
                key={monster.index}
                onClick={() => setSelectedMonster(monster)}
                style={{
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: '#fff',
                }}
              >
                <strong>{monster.name}</strong>
                <div style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
                  {monster.type} • AC {monster.ac} • {monster.hp} HP
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DnDBeyond;
