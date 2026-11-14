import { useEffect, useState } from "react";
import { Flex, Box, Text, IconButton } from "theme-ui";
import SimpleBar from "simplebar-react";

import AddPartyMemberButton from "./AddPartyMemberButton";
import Nickname from "./Nickname";
import ChangeNicknameButton from "./ChangeNicknameButton";
import StartStreamButton from "./StartStreamButton";
import SettingsButton from "../SettingsButton";
import StartTimerButton from "./StartTimerButton";
import Timer from "./Timer";
import DiceTrayButton from "./DiceTrayButton";
import CharacterCard from "./CharacterCard";
import CharacterModal from "../../modals/CharacterModal";
import CharacterSheetModal from "../../modals/CharacterSheetModal";
import CharacterSheetIcon from "../../icons/CharacterSheetIcon";

import useSetting from "../../hooks/useSetting";

import { useParty } from "../../contexts/PartyContext";
import { usePlayerState, usePlayerUpdater } from "../../contexts/PlayerContext";
import { DiceRoll } from "../../types/Dice";
import {
  StreamEndEventHandler,
  StreamStartEventHandler,
} from "../../types/Events";
import { Timer as TimerType } from "../../types/Timer";
import { Character } from "../../types/Character";
import {
  loadActiveCharacterId,
  loadCharacterLibrary,
  normalizeCharacter,
  saveActiveCharacterId,
  saveCharacterLibrary,
} from "../../helpers/character";

type PartyProps = {
  gameId: string;
  stream: MediaStream | null;
  partyStreams: Record<string, MediaStream>;
  onStreamStart: StreamStartEventHandler;
  onStreamEnd: StreamEndEventHandler;
};

function Party({
  gameId,
  stream,
  partyStreams,
  onStreamStart,
  onStreamEnd,
}: PartyProps) {
  const setPlayerState = usePlayerUpdater();
  const playerState = usePlayerState();
  const partyState = useParty();

  const [fullScreen] = useSetting<boolean>("map.fullScreen");
  const [shareDice, setShareDice] = useSetting<boolean>("dice.shareDice");

  function handleTimerStart(newTimer: TimerType) {
    setPlayerState((prevState) => ({ ...prevState, timer: newTimer }));
  }

  function handleTimerStop() {
    setPlayerState((prevState) => ({ ...prevState, timer: undefined }));
  }

  useEffect(() => {
    let prevTime = performance.now();
    let request = requestAnimationFrame(update);
    let counter = 0;
    function update(time: number) {
      request = requestAnimationFrame(update);
      const deltaTime = time - prevTime;
      prevTime = time;

      if (playerState.timer) {
        counter += deltaTime;
        // Update timer every second
        if (counter > 1000) {
          const newTimer: TimerType = {
            ...playerState.timer,
            current: playerState.timer.current - counter,
          };
          if (newTimer.current < 0) {
            setPlayerState((prevState) => ({ ...prevState, timer: undefined }));
          } else {
            setPlayerState((prevState) => ({ ...prevState, timer: newTimer }));
          }
          counter = 0;
        }
      }
    }
    return () => {
      cancelAnimationFrame(request);
    };
  }, [playerState.timer, setPlayerState]);

  const [characters, setCharacters] = useState<Character[]>(loadCharacterLibrary);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  // "self" for your own sheet, otherwise the party member's session id
  const [sheetPlayerId, setSheetPlayerId] = useState<string | null>(null);

  // Bring back the character you were playing last time
  useEffect(() => {
    const activeId = loadActiveCharacterId();
    const character = loadCharacterLibrary().find((c) => c.id === activeId);
    if (character) {
      setPlayerState((prevState) => ({ ...prevState, character }));
    }
  }, [setPlayerState]);

  function saveLibrary(next: Character[]) {
    setCharacters(next);
    saveCharacterLibrary(next);
  }

  function handleCharacterSave(character: Character) {
    saveLibrary(
      characters.some((c) => c.id === character.id)
        ? characters.map((c) => (c.id === character.id ? character : c))
        : [...characters, character]
    );
    if (playerState.character?.id === character.id) {
      setPlayerState((prevState) => ({ ...prevState, character }));
    }
  }

  function handleCharacterSelect(id: string | null) {
    const character = id ? characters.find((c) => c.id === id) : undefined;
    saveActiveCharacterId(character ? character.id : null);
    setPlayerState((prevState) => ({ ...prevState, character }));
  }

  function handleCharacterDelete(id: string) {
    saveLibrary(characters.filter((c) => c.id !== id));
    if (playerState.character?.id === id) {
      handleCharacterSelect(null);
    }
  }

  function handleHpChange(currentHp: number, tempHp: number) {
    if (playerState.character) {
      handleCharacterSave({
        ...playerState.character,
        currentHp,
        tempHp,
        lastModified: Date.now(),
      });
    }
  }

  // Characters from other players come over the network, so clean them up before showing them
  const partyCharacters: Record<string, Character | null> = {};
  for (const [id, player] of Object.entries(partyState)) {
    partyCharacters[id] = normalizeCharacter(player.character);
  }
  const sheetCharacter =
    sheetPlayerId === "self"
      ? playerState.character
      : sheetPlayerId
      ? partyCharacters[sheetPlayerId] || undefined
      : undefined;
  const sheetOwner =
    sheetPlayerId === "self"
      ? `${playerState.nickname} (you)`
      : (sheetPlayerId && partyState[sheetPlayerId]?.nickname) || "";

  function handleNicknameChange(newNickname: string) {
    setPlayerState((prevState) => ({ ...prevState, nickname: newNickname }));
  }

  function handleDiceRollsChange(newDiceRolls: DiceRoll[]) {
    setPlayerState(
      (prevState) => ({
        ...prevState,
        dice: { share: shareDice, rolls: newDiceRolls },
      }),
      shareDice
    );
  }

  function handleShareDiceChange(newShareDice: boolean) {
    setShareDice(newShareDice);
    setPlayerState((prevState) => ({
      ...prevState,
      dice: { ...prevState.dice, share: newShareDice },
    }));
  }

  return (
    <Box
      bg="background"
      sx={{
        position: "relative",
      }}
    >
      <Box
        sx={{
          flexDirection: "column",
          overflow: "visible",
          alignItems: "center",
          height: "100%",
          display: fullScreen ? "none" : "flex",
          width: "112px",
          minWidth: "112px",
        }}
        p={3}
      >
        <Box
          sx={{
            width: "100%",
          }}
        >
          <Text mb={1} variant="heading" as="h1">
            Party
          </Text>
        </Box>
        <SimpleBar
          style={{
            flexGrow: 1,
            width: "100%",
            minWidth: "112px",
            padding: "0 16px",
            height: "calc(100% - 272px)",
          }}
        >
          <Nickname
            nickname={`${playerState.nickname} (you)`}
            diceRolls={shareDice ? playerState.dice.rolls : undefined}
          />
          {playerState.character && (
            <CharacterCard
              character={playerState.character}
              onClick={() => setSheetPlayerId("self")}
            />
          )}
          {Object.entries(partyState).map(([id, { nickname, dice }]) => {
            const character = partyCharacters[id];
            return (
              <Box key={id}>
                <Nickname
                  nickname={nickname}
                  stream={partyStreams[id]}
                  diceRolls={dice.share ? dice.rolls : undefined}
                />
                {character && (
                  <CharacterCard
                    character={character}
                    onClick={() => setSheetPlayerId(id)}
                  />
                )}
              </Box>
            );
          })}
          {playerState.timer && <Timer timer={playerState.timer} index={0} />}
          {Object.entries(partyState)
            .filter(([_, { timer }]) => timer)
            .map(([id, { timer }], index) => (
              <Timer
                timer={timer}
                key={id}
                // Put party timers above your timer if there is one
                index={playerState.timer ? index + 1 : index}
              />
            ))}
        </SimpleBar>
        <Flex sx={{ flexDirection: "column" }}>
          <IconButton
            m={1}
            aria-label="Characters"
            title="Characters"
            onClick={() => setIsCharacterModalOpen(true)}
          >
            <CharacterSheetIcon />
          </IconButton>
          <ChangeNicknameButton
            nickname={playerState.nickname}
            onChange={handleNicknameChange}
          />
          <AddPartyMemberButton gameId={gameId} />
          <StartStreamButton
            onStreamStart={onStreamStart}
            onStreamEnd={onStreamEnd}
            stream={stream}
          />
          <StartTimerButton
            onTimerStart={handleTimerStart}
            onTimerStop={handleTimerStop}
            timer={playerState.timer}
          />
          <SettingsButton />
        </Flex>
      </Box>
      <CharacterModal
        isOpen={isCharacterModalOpen}
        onRequestClose={() => setIsCharacterModalOpen(false)}
        characters={characters}
        activeId={playerState.character?.id || null}
        onSave={handleCharacterSave}
        onDelete={handleCharacterDelete}
        onSelect={handleCharacterSelect}
      />
      <CharacterSheetModal
        isOpen={sheetPlayerId !== null}
        onRequestClose={() => setSheetPlayerId(null)}
        character={sheetCharacter}
        ownerName={sheetOwner}
        onHpChange={sheetPlayerId === "self" ? handleHpChange : undefined}
      />
      <DiceTrayButton
        shareDice={shareDice}
        onShareDiceChange={handleShareDiceChange}
        diceRolls={(playerState.dice && playerState.dice.rolls) || []}
        onDiceRollsChange={handleDiceRollsChange}
      />
    </Box>
  );
}

export default Party;
