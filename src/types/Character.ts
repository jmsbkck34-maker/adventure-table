export type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";

export type SkillKey =
  | "acrobatics"
  | "animal-handling"
  | "arcana"
  | "athletics"
  | "deception"
  | "history"
  | "insight"
  | "intimidation"
  | "investigation"
  | "medicine"
  | "nature"
  | "perception"
  | "performance"
  | "persuasion"
  | "religion"
  | "sleight-of-hand"
  | "stealth"
  | "survival";

/** 0 = not proficient, 1 = proficient, 2 = expertise */
export type ProficiencyLevel = 0 | 1 | 2;

export type CharacterClass = {
  name: string;
  subclass: string;
  level: number;
};

export type CharacterSource =
  | { kind: "manual" }
  | { kind: "dndbeyond"; id: string; importedAt: number };

export type Character = {
  id: string;
  name: string;
  species: string;
  background: string;
  classes: CharacterClass[];
  abilities: Record<AbilityKey, number>;
  savingThrows: AbilityKey[];
  skills: Partial<Record<SkillKey, ProficiencyLevel>>;
  maxHp: number;
  currentHp: number;
  tempHp: number;
  armorClass: number;
  speed: number;
  /** Extra initiative bonus on top of the Dexterity modifier */
  initiativeBonus: number;
  notes: string;
  /** Only D&D Beyond hosted avatars are kept, see normalizeCharacter */
  avatarUrl: string;
  source: CharacterSource;
  lastModified: number;
};
