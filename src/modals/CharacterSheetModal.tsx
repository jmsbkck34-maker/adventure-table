import { useState, FormEvent } from "react";
import { Box, Button, Flex, Grid, Heading, Image, Input, Label, Text } from "theme-ui";

import Modal from "../components/Modal";
import { Character } from "../types/Character";
import {
  abilities,
  abilityModifier,
  classSummary,
  formatModifier,
  initiative,
  passivePerception,
  proficiencyBonus,
  savingThrow,
  skillBonus,
  skills,
} from "../helpers/character";

type CharacterSheetModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  character: Character | undefined;
  ownerName: string;
  /** Only given for your own character */
  onHpChange?: (currentHp: number, tempHp: number) => void;
};

const statBox = {
  border: "1px solid",
  borderColor: "border",
  borderRadius: "4px",
  padding: 2,
  textAlign: "center" as const,
};

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Box sx={statBox}>
      <Text as="p" variant="caption" sx={{ color: "text", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </Text>
      <Text as="p" sx={{ fontSize: 3, fontVariantNumeric: "tabular-nums" }}>
        {value}
      </Text>
    </Box>
  );
}

function HitPointControls({
  character,
  onHpChange,
}: {
  character: Character;
  onHpChange: (currentHp: number, tempHp: number) => void;
}) {
  const [amount, setAmount] = useState("");
  const value = Math.max(0, Math.floor(Number(amount) || 0));

  function damage() {
    // Temporary hit points are lost first
    const fromTemp = Math.min(character.tempHp, value);
    onHpChange(Math.max(0, character.currentHp - (value - fromTemp)), character.tempHp - fromTemp);
    setAmount("");
  }
  function heal() {
    onHpChange(Math.min(character.maxHp, character.currentHp + value), character.tempHp);
    setAmount("");
  }
  function setTemp() {
    onHpChange(character.currentHp, value);
    setAmount("");
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    damage();
  }

  return (
    <Box as="form" onSubmit={submit} mt={2}>
      <Label htmlFor="hpAmount" variant="body2">
        Change hit points
      </Label>
      <Flex sx={{ gap: 2, flexWrap: "wrap" }}>
        <Input
          id="hpAmount"
          type="number"
          min={0}
          max={9999}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          sx={{ width: "90px" }}
        />
        <Button type="submit" disabled={!value}>Damage</Button>
        <Button type="button" onClick={heal} disabled={!value}>Heal</Button>
        <Button type="button" variant="secondary" onClick={setTemp}>Set temp HP</Button>
      </Flex>
    </Box>
  );
}

function CharacterSheetModal({
  isOpen,
  onRequestClose,
  character,
  ownerName,
  onHpChange,
}: CharacterSheetModalProps) {
  return (
    <Modal
      isOpen={isOpen && !!character}
      onRequestClose={onRequestClose}
      style={{ content: { width: "min(640px, 94vw)", maxHeight: "90vh", overflowY: "auto" } }}
    >
      {character ? (
        <Box>
          <Flex sx={{ gap: 3, alignItems: "center", mb: 3, pr: 4 }}>
            {character.avatarUrl && (
              <Image
                src={character.avatarUrl}
                alt=""
                referrerPolicy="no-referrer"
                sx={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
              />
            )}
            <Box sx={{ minWidth: 0 }}>
              <Heading as="h2" sx={{ fontSize: 4 }}>{character.name}</Heading>
              <Text as="p" variant="body2">
                {[character.species, classSummary(character), character.background]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
              <Text as="p" variant="caption">
                Played by {ownerName}
                {character.source.kind === "dndbeyond" &&
                  ` · Imported from D&D Beyond ${new Date(character.source.importedAt).toLocaleDateString()}`}
              </Text>
            </Box>
          </Flex>

          <Grid columns={["repeat(3, 1fr)", "repeat(3, 1fr)", "repeat(6, 1fr)"]} gap={2} mb={3}>
            <Stat label="HP" value={`${character.currentHp}/${character.maxHp}`} />
            <Stat label="Temp HP" value={character.tempHp} />
            <Stat label="AC" value={character.armorClass} />
            <Stat label="Initiative" value={formatModifier(initiative(character))} />
            <Stat label="Speed" value={`${character.speed} ft`} />
            <Stat label="Prof." value={formatModifier(proficiencyBonus(character))} />
          </Grid>

          {onHpChange && <HitPointControls character={character} onHpChange={onHpChange} />}

          <Heading as="h3" sx={{ fontSize: 2, mt: 3, mb: 2 }}>Abilities</Heading>
          <Grid columns={["repeat(3, 1fr)", "repeat(3, 1fr)", "repeat(6, 1fr)"]} gap={2}>
            {abilities.map((a) => (
              <Box key={a.key} sx={statBox} title={a.name}>
                <Text as="p" variant="caption" sx={{ color: "text", letterSpacing: "0.05em" }}>{a.short}</Text>
                <Text as="p" sx={{ fontSize: 3 }}>{formatModifier(abilityModifier(character.abilities[a.key]))}</Text>
                <Text as="p" variant="caption">{character.abilities[a.key]}</Text>
                <Text as="p" variant="caption" sx={{ color: "text" }}>
                  Save {formatModifier(savingThrow(character, a.key))}
                  {character.savingThrows.includes(a.key) ? " ●" : ""}
                </Text>
              </Box>
            ))}
          </Grid>

          <Heading as="h3" sx={{ fontSize: 2, mt: 3, mb: 2 }}>
            Skills <Text as="span" variant="caption">· Passive Perception {passivePerception(character)}</Text>
          </Heading>
          <Grid columns={[1, 2, 3]} gap={1} sx={{ fontVariantNumeric: "tabular-nums" }}>
            {skills.map((s) => {
              const level = character.skills[s.key] || 0;
              return (
                <Flex key={s.key} sx={{ justifyContent: "space-between", gap: 2 }}>
                  <Text variant="body2" sx={{ fontWeight: level ? "bold" : "normal" }}>
                    {s.name}
                    {level === 2 ? " ●●" : level === 1 ? " ●" : ""}
                  </Text>
                  <Text variant="body2">{formatModifier(skillBonus(character, s.key))}</Text>
                </Flex>
              );
            })}
          </Grid>
          <Text as="p" variant="caption" mt={1}>● proficient · ●● expertise</Text>

          {character.notes && (
            <>
              <Heading as="h3" sx={{ fontSize: 2, mt: 3, mb: 2 }}>Notes</Heading>
              <Text as="p" variant="body2" sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                {character.notes}
              </Text>
            </>
          )}
        </Box>
      ) : (
        <Box />
      )}
    </Modal>
  );
}

export default CharacterSheetModal;
