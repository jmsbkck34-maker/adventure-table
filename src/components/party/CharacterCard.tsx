import { Box, Text } from "theme-ui";

import { Character } from "../../types/Character";
import { totalLevel } from "../../helpers/character";

type CharacterCardProps = {
  character: Character;
  onClick: () => void;
};

/** Compact character summary that fits in the narrow party sidebar */
function CharacterCard({ character, onClick }: CharacterCardProps) {
  const hpRatio = character.maxHp > 0 ? character.currentHp / character.maxHp : 0;
  const hpColor =
    character.currentHp === 0 ? "#e5707e" : hpRatio <= 0.5 ? "#e6c06b" : "#7fd1a4";
  return (
    <Box
      as="button"
      onClick={onClick}
      title={`Open ${character.name}'s character sheet`}
      aria-label={`Open ${character.name}'s character sheet`}
      sx={{
        display: "block",
        width: "100%",
        textAlign: "left",
        background: "none",
        color: "text",
        border: "1px solid",
        borderColor: "border",
        borderRadius: "4px",
        padding: "2px 4px",
        marginBottom: 1,
        cursor: "pointer",
        "&:hover, &:focus-visible": { borderColor: "primary", outline: "none" },
      }}
    >
      <Text
        as="p"
        variant="body2"
        sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
      >
        {character.name}
      </Text>
      <Text as="p" variant="caption" sx={{ color: "text", fontVariantNumeric: "tabular-nums" }}>
        Lv {totalLevel(character)} · AC {character.armorClass}
      </Text>
      <Text as="p" variant="caption" sx={{ color: hpColor, fontVariantNumeric: "tabular-nums" }}>
        HP {character.currentHp}/{character.maxHp}
        {character.tempHp > 0 ? ` +${character.tempHp}` : ""}
      </Text>
    </Box>
  );
}

export default CharacterCard;
