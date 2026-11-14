import { useEffect, useState, FormEvent } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Input,
  Label,
  Select,
  Text,
  Textarea,
} from "theme-ui";

import Modal from "../components/Modal";
import {
  AbilityKey,
  Character,
  CharacterClass,
  ProficiencyLevel,
} from "../types/Character";
import {
  abilities,
  abilityModifier,
  classSummary,
  createBlankCharacter,
  formatModifier,
  normalizeCharacter,
  skills,
  totalLevel,
} from "../helpers/character";
import {
  DndBeyondImportError,
  fetchDndBeyondCharacter,
  parseDndBeyondCharacter,
  parseDndBeyondId,
} from "../helpers/dndBeyond";

type View = "list" | "edit" | "import";

type CharacterModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  characters: Character[];
  activeId: string | null;
  onSave: (character: Character) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string | null) => void;
};

const sectionHeading = { fontSize: 2, mt: 3, mb: 2 };

function errorMessage(error: unknown): string {
  return error instanceof DndBeyondImportError
    ? error.message
    : "Something went wrong reading that character.";
}

/** Keep the player's own notes when a D&D Beyond character is synced again */
function mergeImport(imported: Character, existing?: Character): Character {
  return existing ? { ...imported, notes: existing.notes } : imported;
}

function CharacterList({
  characters,
  activeId,
  onSelect,
  onEdit,
  onDelete,
  onResync,
  syncingId,
}: {
  characters: Character[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
  onEdit: (character: Character) => void;
  onDelete: (id: string) => void;
  onResync: (character: Character) => void;
  syncingId: string | null;
}) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (characters.length === 0) {
    return (
      <Box sx={{ border: "1px dashed", borderColor: "border", borderRadius: "4px", p: 3, textAlign: "center" }}>
        <Text as="p" variant="body2">You don't have any characters yet.</Text>
        <Text as="p" variant="caption">Build one from scratch or import one from D&D Beyond.</Text>
      </Box>
    );
  }

  return (
    <Flex sx={{ flexDirection: "column", gap: 2 }}>
      {characters.map((c) => {
        const active = c.id === activeId;
        return (
          <Box
            key={c.id}
            sx={{
              border: "1px solid",
              borderColor: active ? "primary" : "border",
              borderRadius: "4px",
              p: 2,
            }}
          >
            <Flex sx={{ justifyContent: "space-between", alignItems: "baseline", gap: 2, flexWrap: "wrap" }}>
              <Box sx={{ minWidth: 0 }}>
                <Text as="p" sx={{ fontSize: 2 }}>
                  {c.name}
                  {active && (
                    <Text as="span" variant="caption" sx={{ color: "primary", ml: 2 }}>Playing</Text>
                  )}
                </Text>
                <Text as="p" variant="caption">
                  {[c.species, classSummary(c) || `Level ${totalLevel(c)}`].filter(Boolean).join(" · ")}
                  {c.source.kind === "dndbeyond" ? " · D&D Beyond" : ""}
                </Text>
              </Box>
              <Text variant="caption" sx={{ color: "text", fontVariantNumeric: "tabular-nums" }}>
                HP {c.currentHp}/{c.maxHp} · AC {c.armorClass}
              </Text>
            </Flex>
            {confirmDeleteId === c.id ? (
              <Flex sx={{ gap: 2, mt: 2, alignItems: "center", flexWrap: "wrap" }}>
                <Text variant="body2">Delete {c.name}? This can't be undone.</Text>
                <Button type="button" onClick={() => { onDelete(c.id); setConfirmDeleteId(null); }}>Delete</Button>
                <Button type="button" variant="secondary" onClick={() => setConfirmDeleteId(null)}>Keep</Button>
              </Flex>
            ) : (
              <Flex sx={{ gap: 2, mt: 2, flexWrap: "wrap" }}>
                {active ? (
                  <Button type="button" variant="secondary" onClick={() => onSelect(null)}>Stop playing</Button>
                ) : (
                  <Button type="button" onClick={() => onSelect(c.id)}>Play this character</Button>
                )}
                <Button type="button" variant="secondary" onClick={() => onEdit(c)}>Edit</Button>
                {c.source.kind === "dndbeyond" && (
                  <Button type="button" variant="secondary" onClick={() => onResync(c)} disabled={syncingId === c.id}>
                    {syncingId === c.id ? "Syncing…" : "Sync from D&D Beyond"}
                  </Button>
                )}
                <Button type="button" variant="secondary" onClick={() => setConfirmDeleteId(c.id)}>Delete</Button>
              </Flex>
            )}
          </Box>
        );
      })}
    </Flex>
  );
}

function CharacterEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial: Character;
  onSave: (character: Character) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<Character>(initial);
  const [error, setError] = useState("");

  function update<K extends keyof Character>(key: K, value: Character[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }
  function updateClass(index: number, changes: Partial<CharacterClass>) {
    setDraft((prev) => ({
      ...prev,
      classes: prev.classes.map((c, i) => (i === index ? { ...c, ...changes } : c)),
    }));
  }
  function setAbility(key: AbilityKey, value: string) {
    setDraft((prev) => ({ ...prev, abilities: { ...prev.abilities, [key]: Number(value) } }));
  }
  function toggleSave(key: AbilityKey) {
    setDraft((prev) => ({
      ...prev,
      savingThrows: prev.savingThrows.includes(key)
        ? prev.savingThrows.filter((k) => k !== key)
        : [...prev.savingThrows, key],
    }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const cleaned = normalizeCharacter({
      ...draft,
      classes: draft.classes.filter((c) => c.name.trim()),
      lastModified: Date.now(),
    });
    if (!cleaned) {
      setError("Give your character a name.");
      return;
    }
    onSave(cleaned);
  }

  const numberInput = (id: string, value: number, onChange: (v: number) => void, min: number, max: number) => (
    <Input
      id={id}
      type="number"
      min={min}
      max={max}
      value={Number.isFinite(value) ? value : ""}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );

  return (
    <Box as="form" onSubmit={submit}>
      {draft.source.kind === "dndbeyond" && (
        <Text as="p" variant="caption" mb={2}>
          Imported from D&D Beyond. Changes you make here are overwritten the next time you sync. Your notes are kept.
        </Text>
      )}
      <Grid columns={[1, 1, 2]} gap={2}>
        <Box>
          <Label htmlFor="charName" variant="body2">Name</Label>
          <Input id="charName" value={draft.name} maxLength={60} onChange={(e) => update("name", e.target.value)} required />
        </Box>
        <Box>
          <Label htmlFor="charSpecies" variant="body2">Species</Label>
          <Input id="charSpecies" value={draft.species} maxLength={60} onChange={(e) => update("species", e.target.value)} />
        </Box>
        <Box>
          <Label htmlFor="charBackground" variant="body2">Background</Label>
          <Input id="charBackground" value={draft.background} maxLength={60} onChange={(e) => update("background", e.target.value)} />
        </Box>
      </Grid>

      <Heading as="h3" sx={sectionHeading}>Classes</Heading>
      <Flex sx={{ flexDirection: "column", gap: 2 }}>
        {draft.classes.map((c, index) => (
          <Grid key={index} columns={["1fr 1fr", "1fr 1fr", "2fr 2fr 1fr auto"]} gap={2} sx={{ alignItems: "end" }}>
            <Box>
              <Label htmlFor={`className${index}`} variant="body2">Class</Label>
              <Input id={`className${index}`} value={c.name} maxLength={40} onChange={(e) => updateClass(index, { name: e.target.value })} />
            </Box>
            <Box>
              <Label htmlFor={`subclass${index}`} variant="body2">Subclass</Label>
              <Input id={`subclass${index}`} value={c.subclass} maxLength={60} onChange={(e) => updateClass(index, { subclass: e.target.value })} />
            </Box>
            <Box>
              <Label htmlFor={`classLevel${index}`} variant="body2">Level</Label>
              {numberInput(`classLevel${index}`, c.level, (v) => updateClass(index, { level: v }), 1, 20)}
            </Box>
            <Button
              type="button"
              variant="secondary"
              aria-label={`Remove class ${c.name || index + 1}`}
              onClick={() => update("classes", draft.classes.filter((_, i) => i !== index))}
              disabled={draft.classes.length === 1}
            >
              Remove
            </Button>
          </Grid>
        ))}
      </Flex>
      <Button
        type="button"
        variant="secondary"
        mt={2}
        onClick={() => update("classes", [...draft.classes, { name: "", subclass: "", level: 1 }])}
        disabled={draft.classes.length >= 6}
      >
        Add a class
      </Button>

      <Heading as="h3" sx={sectionHeading}>Ability scores</Heading>
      <Grid columns={["repeat(3, 1fr)", "repeat(3, 1fr)", "repeat(6, 1fr)"]} gap={2}>
        {abilities.map((a) => (
          <Box key={a.key}>
            <Label htmlFor={`ability-${a.key}`} variant="body2" title={a.name}>
              {a.short} {formatModifier(abilityModifier(draft.abilities[a.key] || 0))}
            </Label>
            <Input
              id={`ability-${a.key}`}
              type="number"
              min={1}
              max={30}
              value={Number.isFinite(draft.abilities[a.key]) ? draft.abilities[a.key] : ""}
              onChange={(e) => setAbility(a.key, e.target.value)}
            />
            <Label variant="body2" sx={{ alignItems: "center", gap: 1, mt: 1, fontSize: 0 }}>
              <input type="checkbox" checked={draft.savingThrows.includes(a.key)} onChange={() => toggleSave(a.key)} />
              Save prof.
            </Label>
          </Box>
        ))}
      </Grid>

      <Heading as="h3" sx={sectionHeading}>Combat</Heading>
      <Grid columns={["repeat(2, 1fr)", "repeat(3, 1fr)", "repeat(6, 1fr)"]} gap={2}>
        <Box>
          <Label htmlFor="charMaxHp" variant="body2">Max HP</Label>
          {numberInput("charMaxHp", draft.maxHp, (v) => update("maxHp", v), 0, 9999)}
        </Box>
        <Box>
          <Label htmlFor="charCurrentHp" variant="body2">Current HP</Label>
          {numberInput("charCurrentHp", draft.currentHp, (v) => update("currentHp", v), 0, 9999)}
        </Box>
        <Box>
          <Label htmlFor="charTempHp" variant="body2">Temp HP</Label>
          {numberInput("charTempHp", draft.tempHp, (v) => update("tempHp", v), 0, 9999)}
        </Box>
        <Box>
          <Label htmlFor="charAc" variant="body2">Armor class</Label>
          {numberInput("charAc", draft.armorClass, (v) => update("armorClass", v), 0, 99)}
        </Box>
        <Box>
          <Label htmlFor="charSpeed" variant="body2">Speed (ft)</Label>
          {numberInput("charSpeed", draft.speed, (v) => update("speed", v), 0, 999)}
        </Box>
        <Box>
          <Label htmlFor="charInit" variant="body2" title="Added to your Dexterity modifier">Init. bonus</Label>
          {numberInput("charInit", draft.initiativeBonus, (v) => update("initiativeBonus", v), -20, 20)}
        </Box>
      </Grid>

      <Heading as="h3" sx={sectionHeading}>Skills</Heading>
      <Grid columns={[1, 2, 3]} gap={2}>
        {skills.map((s) => (
          <Box key={s.key}>
            <Label htmlFor={`skill-${s.key}`} variant="body2" sx={{ fontSize: 0 }}>
              {s.name} ({abilities.find((a) => a.key === s.ability)!.short})
            </Label>
            <Select
              id={`skill-${s.key}`}
              value={draft.skills[s.key] || 0}
              onChange={(e) =>
                update("skills", { ...draft.skills, [s.key]: Number(e.target.value) as ProficiencyLevel })
              }
            >
              <option value={0}>Not proficient</option>
              <option value={1}>Proficient</option>
              <option value={2}>Expertise</option>
            </Select>
          </Box>
        ))}
      </Grid>

      <Heading as="h3" sx={sectionHeading}>Notes</Heading>
      <Textarea
        id="charNotes"
        rows={4}
        maxLength={4000}
        value={draft.notes}
        onChange={(e) => update("notes", e.target.value)}
        placeholder="Features, equipment, personality, anything you want handy at the table"
      />

      {error && <Text as="p" role="alert" variant="body2" sx={{ color: "#e5707e", mt: 2 }}>{error}</Text>}
      <Flex sx={{ gap: 2, mt: 3 }}>
        <Button type="submit" sx={{ flexGrow: 1 }}>Save character</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </Flex>
    </Box>
  );
}

function ImportPanel({
  characters,
  onImported,
  onCancel,
}: {
  characters: Character[];
  onImported: (character: Character) => void;
  onCancel: () => void;
}) {
  const [link, setLink] = useState("");
  const [json, setJson] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [status, setStatus] = useState<{ loading: boolean; error: string }>({ loading: false, error: "" });

  function finish(character: Character) {
    onImported(mergeImport(character, characters.find((c) => c.id === character.id)));
  }

  async function importLink(event: FormEvent) {
    event.preventDefault();
    const id = parseDndBeyondId(link);
    if (!id) {
      setStatus({ loading: false, error: "Paste a D&D Beyond character link, like https://www.dndbeyond.com/characters/12345678" });
      return;
    }
    setStatus({ loading: true, error: "" });
    try {
      finish(parseDndBeyondCharacter(await fetchDndBeyondCharacter(id)));
    } catch (error) {
      setStatus({ loading: false, error: errorMessage(error) });
    }
  }

  function importJson(event: FormEvent) {
    event.preventDefault();
    try {
      finish(parseDndBeyondCharacter(JSON.parse(json)));
    } catch (error) {
      setStatus({
        loading: false,
        error: error instanceof SyntaxError ? "That text isn't valid JSON. Copy the whole page." : errorMessage(error),
      });
    }
  }

  const pasteId = parseDndBeyondId(link);

  return (
    <Box>
      <Box as="form" onSubmit={importLink}>
        <Label htmlFor="ddbLink" variant="body2">D&D Beyond character link</Label>
        <Input
          id="ddbLink"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://www.dndbeyond.com/characters/12345678"
          autoComplete="off"
        />
        <Text as="p" variant="caption" mt={1}>
          In D&D Beyond, open your character, choose Edit, and set Character Privacy to Public. Then copy the link from your browser.
        </Text>
        <Flex sx={{ gap: 2, mt: 2 }}>
          <Button type="submit" sx={{ flexGrow: 1 }} disabled={!link.trim() || status.loading}>
            {status.loading ? "Importing…" : "Import character"}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        </Flex>
      </Box>

      {status.error && (
        <Text as="p" role="alert" variant="body2" sx={{ color: "#e5707e", mt: 2 }}>{status.error}</Text>
      )}

      <Button type="button" variant="secondary" mt={3} onClick={() => setShowPaste(!showPaste)} aria-expanded={showPaste}>
        {showPaste ? "Hide paste option" : "Link not working? Paste the data instead"}
      </Button>
      {showPaste && (
        <Box as="form" onSubmit={importJson} mt={2}>
          <Text as="p" variant="body2" mb={2}>
            With the character set to Public, open{" "}
            <Text as="span" sx={{ fontFamily: "monospace", overflowWrap: "anywhere", userSelect: "all" }}>
              https://character-service.dndbeyond.com/character/v5/character/{pasteId || "YOUR-CHARACTER-ID"}
            </Text>{" "}
            in a new tab, select everything on the page, copy it, and paste it here.
          </Text>
          <Textarea id="ddbJson" rows={5} value={json} onChange={(e) => setJson(e.target.value)} sx={{ fontFamily: "monospace", fontSize: 0 }} />
          <Button type="submit" mt={2} disabled={!json.trim()}>Import pasted data</Button>
        </Box>
      )}

      <Text as="p" variant="caption" mt={3}>
        This reads your character's numbers from D&D Beyond. It is not an official D&D Beyond feature and may stop working if D&D Beyond changes. Check AC and HP after importing.
      </Text>
    </Box>
  );
}

function CharacterModal({
  isOpen,
  onRequestClose,
  characters,
  activeId,
  onSave,
  onDelete,
  onSelect,
}: CharacterModalProps) {
  const [view, setView] = useState<View>("list");
  const [editing, setEditing] = useState<Character | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (isOpen) {
      setView("list");
      setNotice("");
    }
  }, [isOpen]);

  function edit(character: Character) {
    setEditing(character);
    setView("edit");
  }

  async function resync(character: Character) {
    if (character.source.kind !== "dndbeyond") {
      return;
    }
    setSyncingId(character.id);
    setNotice("");
    try {
      const imported = parseDndBeyondCharacter(await fetchDndBeyondCharacter(character.source.id));
      onSave(mergeImport(imported, character));
      setNotice(`Synced ${imported.name} from D&D Beyond.`);
    } catch (error) {
      setNotice(errorMessage(error));
    } finally {
      setSyncingId(null);
    }
  }

  const title = view === "edit" ? (editing && characters.some((c) => c.id === editing.id) ? "Edit character" : "New character") : view === "import" ? "Import from D&D Beyond" : "Your characters";

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{ content: { width: "min(720px, 94vw)", maxHeight: "90vh", overflowY: "auto" } }}
    >
      <Box>
        <Heading as="h2" sx={{ fontSize: 4, mb: 3, pr: 4 }}>{title}</Heading>
        {view === "list" && (
          <>
            <Flex sx={{ gap: 2, mb: 3, flexWrap: "wrap" }}>
              <Button type="button" onClick={() => edit(createBlankCharacter())}>Build a new character</Button>
              <Button type="button" variant="secondary" onClick={() => setView("import")}>Import from D&D Beyond</Button>
            </Flex>
            {notice && <Text as="p" role="status" variant="body2" mb={2}>{notice}</Text>}
            <CharacterList
              characters={characters}
              activeId={activeId}
              onSelect={onSelect}
              onEdit={edit}
              onDelete={onDelete}
              onResync={resync}
              syncingId={syncingId}
            />
            <Text as="p" variant="caption" mt={3}>
              Characters are saved in this browser. The character you play is shown to everyone in the party.
            </Text>
          </>
        )}
        {view === "edit" && editing && (
          <CharacterEditor
            key={editing.id}
            initial={editing}
            onSave={(character) => {
              onSave(character);
              setView("list");
            }}
            onCancel={() => setView("list")}
          />
        )}
        {view === "import" && (
          <ImportPanel
            characters={characters}
            onImported={(character) => {
              onSave(character);
              setNotice(`Imported ${character.name}. Choose "Play this character" to bring it into the game.`);
              setView("list");
            }}
            onCancel={() => setView("list")}
          />
        )}
      </Box>
    </Modal>
  );
}

export default CharacterModal;
