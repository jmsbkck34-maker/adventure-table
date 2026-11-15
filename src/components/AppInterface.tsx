import React, { useState } from 'react';
import WorldBuilder from './WorldBuilder';
import CampaignTools from './CampaignTools';
import DnDBeyondPanel from './DnDBeyondPanel';

type Tab = 'vtt' | 'builder' | 'tools' | 'reference';

export const AppInterface: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('vtt');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#0a0a0a', color: '#fff' }}>
      {/* Header Navigation */}
      <header style={{
        backgroundColor: '#1a1a1a',
        borderBottom: '2px solid #333',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <h1 style={{ margin: 0, fontSize: '1.5em' }}>🎲 Adventure Table</h1>
          
          {/* Tab Navigation */}
          <nav style={{ display: 'flex', gap: '10px' }}>
            <NavButton
              label="🎮 VTT"
              active={activeTab === 'vtt'}
              onClick={() => setActiveTab('vtt')}
            />
            <NavButton
              label="🌍 World Builder"
              active={activeTab === 'builder'}
              onClick={() => setActiveTab('builder')}
            />
            <NavButton
              label="🛠️ Campaign Tools"
              active={activeTab === 'tools'}
              onClick={() => setActiveTab('tools')}
            />
            <NavButton
              label="📚 D&D Beyond"
              active={activeTab === 'reference'}
              onClick={() => setActiveTab('reference')}
            />
          </nav>
        </div>

        {/* Header Info */}
        <div style={{ fontSize: '0.9em', color: '#999' }}>
          <span>Players: 4/5</span> | <span>Active: Campaign Name</span>
        </div>
      </header>

      {/* Content Area */}
      <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {activeTab === 'vtt' && <VTTView />}
        {activeTab === 'builder' && <WorldBuilder />}
        {activeTab === 'tools' && <CampaignTools />}
        {activeTab === 'reference' && <DnDBeyondPanel />}
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#1a1a1a',
        borderTop: '1px solid #333',
        padding: '10px 20px',
        fontSize: '0.85em',
        color: '#666',
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <div>Adventure Table v1.0 • Vercel Deployed</div>
        <div>
          <a href="https://github.com/jmsbkck34-maker/adventure-table" style={{ color: '#4CAF50', textDecoration: 'none' }}>
            GitHub
          </a>
          {' • '}
          <a href="/docs" style={{ color: '#4CAF50', textDecoration: 'none' }}>
            Docs
          </a>
        </div>
      </footer>
    </div>
  );
};

// Navigation Button Component
const NavButton: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: '8px 16px',
      backgroundColor: active ? '#4CAF50' : '#333',
      color: active ? '#fff' : '#999',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.95em',
      fontWeight: active ? 'bold' : 'normal',
      transition: 'all 0.2s ease',
    }}
    onMouseOver={(e) => !active && (e.currentTarget.style.backgroundColor = '#444')}
    onMouseOut={(e) => !active && (e.currentTarget.style.backgroundColor = '#333')}
  >
    {label}
  </button>
);

// VTT Main View Component
const VTTView: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<'pointer' | 'draw' | 'measure' | 'fog'>('pointer');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 250px', gap: '10px', padding: '10px', height: '100%' }}>
      {/* Left Sidebar: Tools */}
      <div style={{ backgroundColor: '#1a1a1a', borderRadius: '8px', padding: '15px', overflowY: 'auto' }}>
        <h3 style={{ fontSize: '0.95em', marginTop: 0 }}>🛠️ Tools</h3>
        
        <ToolButton
          icon="👆"
          label="Pointer"
          active={selectedTool === 'pointer'}
          onClick={() => setSelectedTool('pointer')}
        />
        <ToolButton
          icon="✏️"
          label="Draw"
          active={selectedTool === 'draw'}
          onClick={() => setSelectedTool('draw')}
        />
        <ToolButton
          icon="📏"
          label="Measure"
          active={selectedTool === 'measure'}
          onClick={() => setSelectedTool('measure')}
        />
        <ToolButton
          icon="👁️"
          label="Fog of War"
          active={selectedTool === 'fog'}
          onClick={() => setSelectedTool('fog')}
        />

        <hr style={{ borderColor: '#333', margin: '15px 0' }} />

        <h4 style={{ fontSize: '0.9em', color: '#999' }}>DICE ROLLER</h4>
        <DiceRoller />

        <hr style={{ borderColor: '#333', margin: '15px 0' }} />

        <h4 style={{ fontSize: '0.9em', color: '#999' }}>INITIATIVE</h4>
        <InitiativeTracker />
      </div>

      {/* Center: Main Map Canvas */}
      <div style={{
        backgroundColor: '#222',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        position: 'relative',
      }}>
        <div style={{
          textAlign: 'center',
          color: '#666',
        }}>
          <div style={{ fontSize: '3em', marginBottom: '10px' }}>🗺️</div>
          <div style={{ fontSize: '1.1em' }}>Load or generate a map to start playing</div>
          <div style={{ fontSize: '0.9em', color: '#555', marginTop: '10px' }}>
            Go to "World Builder" to create a campaign and generate maps
          </div>
        </div>
      </div>

      {/* Right Sidebar: Info Panels */}
      <div style={{ backgroundColor: '#1a1a1a', borderRadius: '8px', padding: '15px', overflowY: 'auto' }}>
        <h3 style={{ fontSize: '0.95em', marginTop: 0 }}>📊 Session Info</h3>
        
        <InfoPanel title="Current Map" content="None loaded" />
        <InfoPanel title="Active Players" content="4 online" />
        <InfoPanel title="Session Time" content="2h 45m" />
        
        <hr style={{ borderColor: '#333', margin: '15px 0' }} />

        <h4 style={{ fontSize: '0.9em', color: '#999' }}>QUICK ACTIONS</h4>
        <button style={{
          width: '100%',
          padding: '10px',
          marginBottom: '8px',
          backgroundColor: '#2196F3',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}>
          📥 Load Map
        </button>
        <button style={{
          width: '100%',
          padding: '10px',
          marginBottom: '8px',
          backgroundColor: '#4CAF50',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}>
          🎲 Roll Initiative
        </button>
        <button style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#FF9800',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}>
          ⚔️ Start Combat
        </button>
      </div>
    </div>
  );
};

// Tool Button Component
const ToolButton: React.FC<{ icon: string; label: string; active: boolean; onClick: () => void }> = ({
  icon,
  label,
  active,
  onClick,
}) => (
  <button
    onClick={onClick}
    style={{
      width: '100%',
      padding: '10px',
      marginBottom: '8px',
      backgroundColor: active ? '#4CAF50' : '#333',
      color: active ? '#fff' : '#999',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      textAlign: 'left',
      fontSize: '0.9em',
    }}
  >
    {icon} {label}
  </button>
);

// Dice Roller Component
const DiceRoller: React.FC = () => {
  const [rolls, setRolls] = React.useState<number[]>([]);

  const roll = (sides: number, count: number = 1) => {
    const newRolls = Array(count)
      .fill(0)
      .map(() => Math.floor(Math.random() * sides) + 1);
    setRolls(newRolls);
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginBottom: '10px' }}>
        <button
          onClick={() => roll(20)}
          style={{
            padding: '8px',
            backgroundColor: '#f44336',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.85em',
          }}
        >
          d20
        </button>
        <button
          onClick={() => roll(12)}
          style={{
            padding: '8px',
            backgroundColor: '#f44336',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.85em',
          }}
        >
          d12
        </button>
        <button
          onClick={() => roll(10)}
          style={{
            padding: '8px',
            backgroundColor: '#f44336',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.85em',
          }}
        >
          d10
        </button>
        <button
          onClick={() => roll(8)}
          style={{
            padding: '8px',
            backgroundColor: '#f44336',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.85em',
          }}
        >
          d8
        </button>
      </div>
      {rolls.length > 0 && (
        <div style={{
          backgroundColor: '#333',
          padding: '10px',
          borderRadius: '4px',
          fontSize: '0.9em',
        }}>
          <strong>Result:</strong> {rolls.reduce((a, b) => a + b, 0)}
          <div style={{ fontSize: '0.85em', color: '#999', marginTop: '5px' }}>
            {rolls.join(', ')}
          </div>
        </div>
      )}
    </div>
  );
};

// Initiative Tracker Component
const InitiativeTracker: React.FC = () => {
  const [participants] = React.useState([
    { name: 'Aragorn', init: 18 },
    { name: 'Legolas', init: 16 },
    { name: 'Gimli', init: 10 },
  ]);

  return (
    <div>
      {participants.map((p, i) => (
        <div
          key={i}
          style={{
            padding: '8px',
            backgroundColor: i === 0 ? '#4CAF50' : '#333',
            marginBottom: '5px',
            borderRadius: '4px',
            fontSize: '0.9em',
          }}
        >
          <div style={{ fontWeight: 'bold' }}>{p.name}</div>
          <div style={{ fontSize: '0.85em', color: '#999' }}>Init: {p.init}</div>
        </div>
      ))}
    </div>
  );
};

// Info Panel Component
const InfoPanel: React.FC<{ title: string; content: string }> = ({ title, content }) => (
  <div style={{
    backgroundColor: '#333',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '10px',
    fontSize: '0.9em',
  }}>
    <div style={{ color: '#999', fontSize: '0.85em' }}>{title}</div>
    <div style={{ fontWeight: 'bold', marginTop: '4px' }}>{content}</div>
  </div>
);

export default AppInterface;
