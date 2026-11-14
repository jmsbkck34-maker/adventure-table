import shortid from "shortid";

import {
  AbilityKey,
  Character,
  CharacterClass,
  CharacterSource,
  ProficiencyLevel,
  SkillKey,
} from "../types/Character";

export const abilities: { key: AbilityKey; name: string; short: string }[] = [
  { key: "str", name: "Strength", short: "STR" },
  { key: "dex", name: "Dexterity", short: "DEX" },
  { key: "con", name: "Constitution", short: "CON" },
  { key: "int", name: "Intelligence", short: "INT" },
  { key: "wis", name: "Wisdom", short: "WIS" },
  { key: "cha", name: "Charisma", short: "CHA" },
];

export const skills: { key: SkillKey; name: string; ability: AbilityKey }[] = [
  { key: "acrobatics", name: "Acrobatics", ability: "dex" },
  { key: "animal-handling", name: "Animal Handling", ability: "wis" },
  { key: "arcana", name: "Arcana", ability: "int" },
  { key: "athletics", name: "Athletics", ability: "str" },
  { key: "deception", name: "Deception", ability: "cha" },
  { key: "history", name: "History", ability: "int" },
  { key: "insight", name: "Insight", ability: "wis" },
  { key: "intimidation", name: "Intimidation", ability: "cha" },
  { key: "investigation", name: "Investigation", ability: "int" },
  { key: "medicine", name: "Medicine", ability: "wis" },
  { key: "nature", name: "Nature", ability: "int" },
  { key: "perception", name: "Perception", ability: "wis" },
  { key: "performance", name: "Performance", ability: "cha" },
  { key: "persuasion", name: "Persuasion", ability: "cha" },
  { key: "religion", name: "Religion", ability: "int" },
  { key: "sleight-of-hand", name: "Sleight of Hand", ability: "dex" },
  { key: "stealth", name: "Stealth", ability: "dex" },
  { key: "survival", name: "Survival", ability: "wis" },
];

const abilityKeys = abilities.map((a) => a.key);
const skillKeys = skills.map((s) => s.key);

export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatModifier(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}

export function totalLevel(character: Character): number {
  return character.classes.reduce((sum, c) => sum + c.level, 0);
}

export function proficiencyBonus(character: Character): number {
  const level = Math.max(1, totalLevel(character));
  return 2 + Math.floor((level - 1) / 4);
}

export function initiative(character: Character): number {
  return abilityModifier(character.abilities.dex) + character.initiativeBonus;
}

export function savingThrow(character: Character, ability: AbilityKey): number {
  const mod = abilityModifier(character.abilities[ability]);
  return character.savingThrows.includes(ability)
    ? mod + proficiencyBonus(character)
    : mod;
}

export function skillBonus(character: Character, skill: SkillKey): number {
  const info = skills.find((s) => s.key === skill);
  const mod = info ? abilityModifier(character.abilities[info.ability]) : 0;
  const level = character.skills[skill] || 0;
  return mod + level * proficiencyBonus(character);
}

export function passivePerception(character: Character): number {
  return 10 + skillBonus(character, "perception");
}

export function classSummary(character: Character): string {
  if (character.classes.length === 0) {
    return "";
  }
  return character.classes
    .map((c) => `${c.name}${c.subclass ? ` (${c.subclass})` : ""} ${c.level}`)
    .join(" / ");
}

export function createBlankCharacter(): Character {
  return {
    id: shortid.generate(),
    name: "",
    species: "",
    background: "",
    classes: [{ name: "", subclass: "", level: 1 }],
    abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    savingThrows: [],
    skills: {},
    maxHp: 10,
    currentHp: 10,
    tempHp: 0,
    armorClass: 10,
    speed: 30,
    initiativeBonus: 0,
    notes: "",
    avatarUrl: "",
    source: { kind: "manual" },
    lastModified: Date.now(),
  };
}

function text(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function int(value: unknown, min: number, max: number, fallback: number) {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Math.round(number)));
}

/** Avatars are shown to every player, so only allow D&D Beyond's own image host */
export function safeAvatarUrl(value: unknown): string {
  if (typeof value !== "string" || !value) {
    return "";
  }
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (
      url.protocol === "https:" &&
      (host === "dndbeyond.com" || host.endsWith(".dndbeyond.com"))
    ) {
      return url.toString().slice(0, 500);
    }
  } catch {}
  return "";
}

/**
 * Clean up a character from an untrusted place (local storage, another player
 * or pasted JSON). Returns null if it does not look like a character.
 */
export function normalizeCharacter(input: unknown): Character | null {
  if (!input || typeof input !== "object") {
    return null;
  }
  const raw = input as Record<string, any>;
  const name = text(raw.name, 60);
  if (!name) {
    return null;
  }

  const classes: CharacterClass[] = (Array.isArray(raw.classes)
    ? raw.classes
    : []
  )
    .slice(0, 6)
    .map((c: any) => ({
      name: text(c?.name, 40),
      subclass: text(c?.subclass, 60),
      level: int(c?.level, 1, 20, 1),
    }))
    .filter((c: CharacterClass) => c.name);

  const rawAbilities = raw.abilities && typeof raw.abilities === "object" ? raw.abilities : {};
  const characterAbilities = {} as Record<AbilityKey, number>;
  for (const key of abilityKeys) {
    characterAbilities[key] = int(rawAbilities[key], 1, 30, 10);
  }

  const savingThrows = (Array.isArray(raw.savingThrows) ? raw.savingThrows : [])
    .filter((key: unknown): key is AbilityKey => abilityKeys.includes(key as AbilityKey));

  const characterSkills: Partial<Record<SkillKey, ProficiencyLevel>> = {};
  if (raw.skills && typeof raw.skills === "object") {
    for (const key of skillKeys) {
      const level = int(raw.skills[key], 0, 2, 0) as ProficiencyLevel;
      if (level > 0) {
        characterSkills[key] = level;
      }
    }
  }

  let source: CharacterSource = { kind: "manual" };
  if (raw.source?.kind === "dndbeyond" && /^\d{1,12}$/.test(String(raw.source.id))) {
    source = {
      kind: "dndbeyond",
      id: String(raw.source.id),
      importedAt: int(raw.source.importedAt, 0, Number.MAX_SAFE_INTEGER, 0),
    };
  }

  const maxHp = int(raw.maxHp, 0, 9999, 1);
  return {
    id: /^[\w-]{1,40}$/.test(String(raw.id)) ? String(raw.id) : shortid.generate(),
    name,
    species: text(raw.species, 60),
    background: text(raw.background, 60),
    classes,
    abilities: characterAbilities,
    savingThrows: Array.from(new Set<AbilityKey>(savingThrows)),
    skills: characterSkills,
    maxHp,
    currentHp: int(raw.currentHp, 0, maxHp, maxHp),
    tempHp: int(raw.tempHp, 0, 9999, 0),
    armorClass: int(raw.armorClass, 0, 99, 10),
    speed: int(raw.speed, 0, 999, 30),
    initiativeBonus: int(raw.initiativeBonus, -20, 20, 0),
    notes: text(raw.notes, 4000),
    avatarUrl: safeAvatarUrl(raw.avatarUrl),
    source,
    lastModified: int(raw.lastModified, 0, Number.MAX_SAFE_INTEGER, Date.now()),
  };
}

const LIBRARY_KEY = "adventureTable.characters";
const ACTIVE_KEY = "adventureTable.activeCharacter";

/** Characters are saved in this browser only */
export function loadCharacterLibrary(): Character[] {
  try {
    const stored = JSON.parse(localStorage.getItem(LIBRARY_KEY) || "[]");
    if (!Array.isArray(stored)) {
      return [];
    }
    return stored
      .map(normalizeCharacter)
      .filter((c): c is Character => c !== null);
  } catch {
    return [];
  }
}

export function saveCharacterLibrary(characters: Character[]) {
  try {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(characters));
  } catch {}
}

export function loadActiveCharacterId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

export function saveActiveCharacterId(id: string | null) {
  try {
    if (id) {
      localStorage.setItem(ACTIVE_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_KEY);
    }
  } catch {}
}
