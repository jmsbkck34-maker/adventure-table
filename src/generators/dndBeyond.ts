// D&D Beyond API integration

export interface DDBCharacter {
  id: number;
  name: string;
  class: string;
  race: string;
  level: number;
  stats: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  hp: number;
  ac: number;
}

export interface DDBMonster {
  index: string;
  name: string;
  size: string;
  type: string;
  alignment: string;
  ac: number;
  hp: number;
  speed: Record<string, string>;
  stats: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  senses: Record<string, number>;
}

export interface DDBSpell {
  index: string;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string[];
  duration: string;
  description: string[];
  higherLevel?: string[];
}

// Note: D&D Beyond doesn't have a free public API
// This uses D&D 5e API (open5e.com) as an alternative
const OPEN5E_API = 'https://api.open5e.com/v1';

export async function searchMonsters(query: string): Promise<DDBMonster[]> {
  try {
    const response = await fetch(`${OPEN5E_API}/monsters/?search=${encodeURIComponent(query)}`);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching monsters:', error);
    return [];
  }
}

export async function getMonsterDetails(index: string): Promise<DDBMonster | null> {
  try {
    const response = await fetch(`${OPEN5E_API}/monsters/${index}/`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error fetching monster:', error);
  }
  return null;
}

export async function searchSpells(query: string): Promise<DDBSpell[]> {
  try {
    const response = await fetch(`${OPEN5E_API}/spells/?search=${encodeURIComponent(query)}`);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching spells:', error);
    return [];
  }
}

export async function getSpellDetails(index: string): Promise<DDBSpell | null> {
  try {
    const response = await fetch(`${OPEN5E_API}/spells/${index}/`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error fetching spell:', error);
  }
  return null;
}

export async function getMonsterManual(): Promise<DDBMonster[]> {
  try {
    const response = await fetch(`${OPEN5E_API}/monsters/?limit=1000`);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching monster manual:', error);
    return [];
  }
}
