import { parseDndBeyondCharacter, parseDndBeyondId } from "./dndBeyond";
import {
  normalizeCharacter,
  passivePerception,
  proficiencyBonus,
  savingThrow,
  skillBonus,
} from "./character";

// A trimmed, made-up example shaped like D&D Beyond's character-service v5 response
function sampleResponse(overrides: Record<string, any> = {}) {
  return {
    id: 1,
    success: true,
    message: "Character successfully received.",
    data: {
      id: 98765432,
      name: "Wren Ashdown",
      decorations: { avatarUrl: "https://www.dndbeyond.com/avatars/1/2/example.png" },
      race: { fullName: "Wood Elf", weightSpeeds: { normal: { walk: 35 } } },
      background: { definition: { name: "Wayfarer" } },
      classes: [
        { level: 4, definition: { name: "Ranger" }, subclassDefinition: { name: "Hunter" } },
        { level: 1, definition: { name: "Rogue" }, subclassDefinition: null },
      ],
      stats: [
        { id: 1, value: 12 },
        { id: 2, value: 15 },
        { id: 3, value: 13 },
        { id: 4, value: 10 },
        { id: 5, value: 14 },
        { id: 6, value: 8 },
      ],
      bonusStats: [1, 2, 3, 4, 5, 6].map((id) => ({ id, value: null })),
      overrideStats: [1, 2, 3, 4, 5, 6].map((id) => ({ id, value: null })),
      modifiers: {
        race: [{ type: "bonus", subType: "dexterity-score", value: 2 }],
        class: [
          { type: "proficiency", subType: "strength-saving-throws" },
          { type: "proficiency", subType: "dexterity-saving-throws" },
          { type: "proficiency", subType: "perception" },
          { type: "proficiency", subType: "stealth" },
          { type: "expertise", subType: "stealth" },
        ],
        background: [{ type: "proficiency", subType: "survival" }],
        feat: [{ type: "bonus", subType: "initiative", value: 2 }],
        item: [
          // Equipped and attuned: counts
          { type: "bonus", subType: "armor-class", value: 1, componentId: 500 },
          // Not equipped: ignored
          { type: "bonus", subType: "armor-class", value: 5, componentId: 501 },
        ],
      },
      baseHitPoints: 34,
      bonusHitPoints: null,
      overrideHitPoints: null,
      removedHitPoints: 6,
      temporaryHitPoints: 3,
      inventory: [
        { equipped: true, definition: { id: 400, armorClass: 12, armorTypeId: 1 } },
        { equipped: true, definition: { id: 401, armorClass: 2, armorTypeId: 4 } },
        { equipped: true, isAttuned: true, definition: { id: 500, canAttune: true } },
        { equipped: false, definition: { id: 501 } },
      ],
      ...overrides,
    },
  };
}

describe("parseDndBeyondId", () => {
  it("reads IDs from the link formats D&D Beyond uses", () => {
    expect(parseDndBeyondId("https://www.dndbeyond.com/characters/98765432")).toBe("98765432");
    expect(parseDndBeyondId("https://www.dndbeyond.com/characters/98765432/AbCdEf")).toBe("98765432");
    expect(parseDndBeyondId("https://www.dndbeyond.com/profile/someone/characters/98765432")).toBe("98765432");
    expect(parseDndBeyondId("https://ddb.ac/characters/98765432/AbCdEf")).toBe("98765432");
    expect(parseDndBeyondId(" 98765432 ")).toBe("98765432");
  });

  it("rejects other sites and malformed input", () => {
    expect(parseDndBeyondId("https://evil.example/characters/98765432")).toBeNull();
    expect(parseDndBeyondId("https://dndbeyond.com.evil.example/characters/1")).toBeNull();
    expect(parseDndBeyondId("https://www.dndbeyond.com/monsters/12345")).toBeNull();
    expect(parseDndBeyondId("not a link")).toBeNull();
  });
});

describe("parseDndBeyondCharacter", () => {
  it("converts a D&D Beyond character", () => {
    const c = parseDndBeyondCharacter(sampleResponse());
    expect(c.name).toBe("Wren Ashdown");
    expect(c.species).toBe("Wood Elf");
    expect(c.background).toBe("Wayfarer");
    expect(c.classes).toEqual([
      { name: "Ranger", subclass: "Hunter", level: 4 },
      { name: "Rogue", subclass: "", level: 1 },
    ]);
    expect(c.abilities).toEqual({ str: 12, dex: 17, con: 13, int: 10, wis: 14, cha: 8 });
    // 34 base + (Con +1 x level 5)
    expect(c.maxHp).toBe(39);
    expect(c.currentHp).toBe(33);
    expect(c.tempHp).toBe(3);
    // Light armor 12 + Dex 3 + shield 2 + equipped item 1
    expect(c.armorClass).toBe(18);
    expect(c.speed).toBe(35);
    expect(c.initiativeBonus).toBe(2);
    expect(c.savingThrows).toEqual(["str", "dex"]);
    expect(c.skills).toEqual({ perception: 1, stealth: 2, survival: 1 });
    expect(c.avatarUrl).toBe("https://www.dndbeyond.com/avatars/1/2/example.png");
    expect(c.source).toMatchObject({ kind: "dndbeyond", id: "98765432" });

    expect(proficiencyBonus(c)).toBe(3);
    expect(savingThrow(c, "dex")).toBe(6);
    expect(savingThrow(c, "wis")).toBe(2);
    expect(skillBonus(c, "stealth")).toBe(9);
    expect(passivePerception(c)).toBe(15);
  });

  it("accepts just the data object", () => {
    expect(parseDndBeyondCharacter(sampleResponse().data).name).toBe("Wren Ashdown");
  });

  it("uses Unarmored Defense when no armor is worn", () => {
    const c = parseDndBeyondCharacter(
      sampleResponse({
        inventory: [],
        modifiers: {
          class: [{ type: "set", subType: "unarmored-armor-class", value: null, statId: 3 }],
        },
      })
    );
    // 10 + Dex 2 (15, no racial bonus here) + Con 1
    expect(c.armorClass).toBe(13);
  });

  it("honors overrides", () => {
    const c = parseDndBeyondCharacter(
      sampleResponse({
        overrideHitPoints: 50,
        overrideStats: [{ id: 1, value: 19 }],
      })
    );
    expect(c.maxHp).toBe(50);
    expect(c.abilities.str).toBe(19);
  });

  it("drops avatars hosted outside D&D Beyond", () => {
    const c = parseDndBeyondCharacter(
      sampleResponse({ decorations: { avatarUrl: "https://tracker.example/pixel.png" } })
    );
    expect(c.avatarUrl).toBe("");
  });

  it("rejects data that isn't a character", () => {
    expect(() => parseDndBeyondCharacter({ hello: "world" })).toThrow();
  });
});

describe("normalizeCharacter", () => {
  it("clamps and cleans untrusted values", () => {
    const c = normalizeCharacter({
      name: "  Brask  ",
      maxHp: 20,
      currentHp: 999,
      abilities: { str: 99, dex: "14" },
      savingThrows: ["str", "nope", "str"],
      skills: { stealth: 7, flying: 1 },
      avatarUrl: "javascript:alert(1)",
    })!;
    expect(c.name).toBe("Brask");
    expect(c.currentHp).toBe(20);
    expect(c.abilities.str).toBe(30);
    expect(c.abilities.dex).toBe(14);
    expect(c.abilities.con).toBe(10);
    expect(c.savingThrows).toEqual(["str"]);
    expect(c.skills).toEqual({ stealth: 2 });
    expect(c.avatarUrl).toBe("");
  });

  it("rejects things without a name", () => {
    expect(normalizeCharacter({ name: "   " })).toBeNull();
    expect(normalizeCharacter(null)).toBeNull();
    expect(normalizeCharacter("Brask")).toBeNull();
  });
});
