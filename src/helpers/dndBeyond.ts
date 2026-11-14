/**
 * D&D Beyond character import.
 *
 * D&D Beyond has no official public API. This reads the JSON that its own
 * character sheet uses (character-service v5), which only works for
 * characters whose privacy is set to Public. The format is undocumented and
 * may change without notice, so every field is read defensively and derived
 * numbers (AC, HP, speed) are a best effort the player can correct.
 */
import { AbilityKey, Character, ProficiencyLevel, SkillKey } from "../types/Character";
import {
  abilities,
  abilityModifier,
  normalizeCharacter,
  safeAvatarUrl,
  skills,
} from "./character";

/** Accepts a character link (any dndbeyond.com/.../characters/123 form) or a bare ID */
export function parseDndBeyondId(input: string): string | null {
  const value = input.trim();
  if (/^\d{1,12}$/.test(value)) {
    return value;
  }
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (
      host !== "dndbeyond.com" &&
      !host.endsWith(".dndbeyond.com") &&
      host !== "ddb.ac"
    ) {
      return null;
    }
    const match = url.pathname.match(/\/characters\/(\d{1,12})(?:\/|$)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export class DndBeyondImportError extends Error {}

/** Fetch through our own server, since D&D Beyond does not allow browser requests from other sites */
export async function fetchDndBeyondCharacter(id: string): Promise<unknown> {
  const broker = process.env.REACT_APP_BROKER_URL;
  if (!broker) {
    throw new DndBeyondImportError(
      "Importing by link needs the game server. Paste the character JSON instead."
    );
  }
  let response: Response;
  try {
    response = await fetch(`${broker}/dndbeyond/character/${encodeURIComponent(id)}`);
  } catch {
    throw new DndBeyondImportError(
      "Couldn't reach the game server. Check your connection and try again."
    );
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new DndBeyondImportError(
      typeof body?.error === "string"
        ? body.error
        : `Import failed (error ${response.status}).`
    );
  }
  return body;
}

const abilityIds: Record<number, AbilityKey> = {
  1: "str",
  2: "dex",
  3: "con",
  4: "int",
  5: "wis",
  6: "cha",
};

type Modifier = {
  type?: string;
  subType?: string;
  value?: number | null;
  fixedValue?: number | null;
  statId?: number | null;
  componentId?: number;
};

function num(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function list(value: unknown): any[] {
  return Array.isArray(value) ? value : [];
}

/** Item modifiers only count while the item is equipped (and attuned, if it needs it) */
function activeModifiers(data: any): Modifier[] {
  const groups = data?.modifiers && typeof data.modifiers === "object" ? data.modifiers : {};
  const activeItemIds = new Set(
    list(data?.inventory)
      .filter(
        (item) =>
          item?.equipped &&
          (!item?.definition?.canAttune || item?.isAttuned)
      )
      .map((item) => item?.definition?.id)
  );
  const result: Modifier[] = [];
  for (const [group, modifiers] of Object.entries(groups)) {
    for (const modifier of list(modifiers)) {
      if (group === "item" && !activeItemIds.has(modifier?.componentId)) {
        continue;
      }
      result.push(modifier);
    }
  }
  return result;
}

function modifierValue(m: Modifier): number {
  return num(m.fixedValue ?? m.value);
}

function sumBonus(modifiers: Modifier[], subType: string): number {
  return modifiers
    .filter((m) => m.type === "bonus" && m.subType === subType)
    .reduce((sum, m) => sum + modifierValue(m), 0);
}

function statValue(stats: unknown, id: number): number | null {
  const stat = list(stats).find((s) => s?.id === id);
  return typeof stat?.value === "number" ? stat.value : null;
}

/** Convert D&D Beyond's character JSON (the whole response or its `data`) into our character */
export function parseDndBeyondCharacter(json: unknown): Character {
  const root = json as any;
  const data = root?.data && typeof root.data === "object" ? root.data : root;
  if (!data || typeof data !== "object" || typeof data.name !== "string") {
    throw new DndBeyondImportError(
      "That doesn't look like D&D Beyond character data."
    );
  }

  const modifiers = activeModifiers(data);

  // Ability scores: base + bonus + modifiers, unless overridden; "set" items like
  // Gauntlets of Ogre Power raise a score to a fixed value
  const characterAbilities = {} as Record<AbilityKey, number>;
  for (const [idText, key] of Object.entries(abilityIds)) {
    const id = Number(idText);
    const name = abilities.find((a) => a.key === key)!.name.toLowerCase();
    const override = statValue(data.overrideStats, id);
    let score =
      (statValue(data.stats, id) ?? 10) +
      (statValue(data.bonusStats, id) ?? 0) +
      sumBonus(modifiers, `${name}-score`);
    for (const m of modifiers) {
      if (m.type === "set" && m.subType === `${name}-score`) {
        score = Math.max(score, modifierValue(m));
      }
    }
    characterAbilities[key] = override ?? score;
  }
  const mod = (key: AbilityKey) => abilityModifier(characterAbilities[key]);

  const classes = list(data.classes).map((c) => ({
    name: String(c?.definition?.name || ""),
    subclass: String(c?.subclassDefinition?.name || ""),
    level: num(c?.level) || 1,
  }));
  const level = Math.max(1, classes.reduce((sum, c) => sum + c.level, 0));

  const hasProficiency = (subType: string) =>
    modifiers.some((m) => m.type === "proficiency" && m.subType === subType);
  const hasExpertise = (subType: string) =>
    modifiers.some((m) => m.type === "expertise" && m.subType === subType);

  const savingThrows = abilities
    .filter((a) => hasProficiency(`${a.name.toLowerCase()}-saving-throws`))
    .map((a) => a.key);

  const characterSkills: Partial<Record<SkillKey, ProficiencyLevel>> = {};
  for (const skill of skills) {
    if (hasExpertise(skill.key)) {
      characterSkills[skill.key] = 2;
    } else if (hasProficiency(skill.key)) {
      characterSkills[skill.key] = 1;
    }
  }

  // Hit points
  const maxHp =
    typeof data.overrideHitPoints === "number"
      ? data.overrideHitPoints
      : num(data.baseHitPoints) +
        num(data.bonusHitPoints) +
        (mod("con") + sumBonus(modifiers, "hit-points-per-level")) * level;
  const currentHp = Math.max(0, maxHp - num(data.removedHitPoints));

  // Armor class from equipped armor and shield
  const equipped = list(data.inventory).filter(
    (item) => item?.equipped && item?.definition?.armorClass
  );
  const armor = equipped.find((item) =>
    [1, 2, 3].includes(item.definition.armorTypeId)
  );
  const shield = equipped.find((item) => item.definition.armorTypeId === 4);
  let armorClass: number;
  if (armor) {
    const base = num(armor.definition.armorClass);
    const type = armor.definition.armorTypeId;
    armorClass =
      type === 1 ? base + mod("dex") : type === 2 ? base + Math.min(2, mod("dex")) : base;
    armorClass += sumBonus(modifiers, "armored-armor-class");
  } else {
    // Unarmored: 10 + Dex, plus features like Unarmored Defense that add another ability
    armorClass = 10 + mod("dex");
    const extraAbilities = new Set<AbilityKey>();
    for (const m of modifiers) {
      if (m.subType === "unarmored-armor-class") {
        const ability = m.statId ? abilityIds[m.statId] : undefined;
        if (ability) {
          extraAbilities.add(ability);
        } else {
          armorClass += modifierValue(m);
        }
      }
    }
    extraAbilities.forEach((ability) => {
      armorClass += mod(ability);
    });
  }
  if (shield) {
    armorClass += num(shield.definition.armorClass);
  }
  armorClass += sumBonus(modifiers, "armor-class");

  const speed =
    num(data.race?.weightSpeeds?.normal?.walk) +
    sumBonus(modifiers, "speed") +
    sumBonus(modifiers, "speed-walking");

  const character = normalizeCharacter({
    id: `ddb-${data.id}`,
    name: data.name,
    species: data.race?.fullName || data.race?.baseName || "",
    background: data.background?.definition?.name || "",
    classes,
    abilities: characterAbilities,
    savingThrows,
    skills: characterSkills,
    maxHp,
    currentHp,
    tempHp: num(data.temporaryHitPoints),
    armorClass,
    speed: speed || 30,
    initiativeBonus: sumBonus(modifiers, "initiative"),
    notes: "",
    avatarUrl: safeAvatarUrl(data.decorations?.avatarUrl || data.avatarUrl),
    source: { kind: "dndbeyond", id: String(data.id), importedAt: Date.now() },
    lastModified: Date.now(),
  });
  if (!character) {
    throw new DndBeyondImportError("This character has no name to import.");
  }
  return character;
}
