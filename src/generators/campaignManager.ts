// Campaign and world management

export interface Campaign {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  settings: CampaignSettings;
  maps: MapData[];
  npcs: NPCData[];
  encounters: EncounterData[];
  notes: CampaignNote[];
}

export interface CampaignSettings {
  system: 'dnd5e' | 'pathfinder' | 'custom';
  difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
  partyLevel: number;
  partySize: number;
  timeZone: string;
  isPublic: boolean;
}

export interface MapData {
  id: string;
  campaignId: string;
  name: string;
  description: string;
  type: 'dungeon' | 'cavern' | 'world' | 'town' | 'custom';
  width: number;
  height: number;
  tiles: number[][];
  locations: MapLocation[];
  encounters: string[]; // encounter IDs
  createdAt: Date;
  thumbnail?: string;
}

export interface MapLocation {
  id: string;
  name: string;
  x: number;
  y: number;
  description: string;
  type: 'city' | 'dungeon' | 'landmark' | 'npc-location' | 'quest-location';
  encounters: string[];
  npcs: string[];
}

export interface NPCData {
  id: string;
  campaignId: string;
  name: string;
  race: string;
  class: string;
  alignment: string;
  personality: string[];
  goals: string[];
  secrets: string;
  appearance: string;
  locations: string[]; // map location IDs
  connections: string[]; // other NPC IDs
  notes: string;
  createdAt: Date;
}

export interface EncounterData {
  id: string;
  campaignId: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
  creatures: Array<{ name: string; count: number; cr: number }>;
  environment: string;
  rewards: {
    xp: number;
    gold: { min: number; max: number };
    loot: Array<{ name: string; rarity: string }>;
  };
  mapId?: string;
  createdAt: Date;
}

export interface CampaignNote {
  id: string;
  campaignId: string;
  title: string;
  content: string;
  tags: string[];
  linkedItems: Array<{ type: 'npc' | 'encounter' | 'map'; id: string }>;
  createdAt: Date;
  updatedAt: Date;
}

// Campaign storage (localStorage for now, easily swappable with DB)
const STORAGE_KEY = 'adventure-table-campaigns';

export function loadCampaign(id: string): Campaign | null {
  try {
    const campaigns = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return campaigns[id] || null;
  } catch (e) {
    console.error('Error loading campaign:', e);
    return null;
  }
}

export function saveCampaign(campaign: Campaign): void {
  try {
    const campaigns = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    campaigns[campaign.id] = campaign;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
  } catch (e) {
    console.error('Error saving campaign:', e);
  }
}

export function getAllCampaigns(): Campaign[] {
  try {
    const campaigns = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return Object.values(campaigns) as Campaign[];
  } catch (e) {
    console.error('Error loading campaigns:', e);
    return [];
  }
}

export function createCampaign(name: string, description: string): Campaign {
  const campaign: Campaign = {
    id: `campaign-${Date.now()}`,
    name,
    description,
    createdAt: new Date(),
    updatedAt: new Date(),
    settings: {
      system: 'dnd5e',
      difficulty: 'medium',
      partyLevel: 5,
      partySize: 4,
      timeZone: 'UTC',
      isPublic: false,
    },
    maps: [],
    npcs: [],
    encounters: [],
    notes: [],
  };
  saveCampaign(campaign);
  return campaign;
}

export function deleteCampaign(id: string): void {
  try {
    const campaigns = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    delete campaigns[id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
  } catch (e) {
    console.error('Error deleting campaign:', e);
  }
}

export function addMapToCampaign(campaignId: string, map: MapData): void {
  const campaign = loadCampaign(campaignId);
  if (campaign) {
    campaign.maps.push(map);
    saveCampaign(campaign);
  }
}

export function addNPCToCampaign(campaignId: string, npc: NPCData): void {
  const campaign = loadCampaign(campaignId);
  if (campaign) {
    campaign.npcs.push(npc);
    saveCampaign(campaign);
  }
}

export function addEncounterToCampaign(campaignId: string, encounter: EncounterData): void {
  const campaign = loadCampaign(campaignId);
  if (campaign) {
    campaign.encounters.push(encounter);
    saveCampaign(campaign);
  }
}

export function exportCampaign(campaign: Campaign): string {
  return JSON.stringify(campaign, null, 2);
}

export function importCampaign(json: string): Campaign | null {
  try {
    const campaign = JSON.parse(json) as Campaign;
    campaign.id = `campaign-${Date.now()}-imported`;
    saveCampaign(campaign);
    return campaign;
  } catch (e) {
    console.error('Error importing campaign:', e);
    return null;
  }
}
