import { Character } from "./Character";
import { Timer } from "./Timer";
import { DiceState } from "./Dice";

export type PlayerState = {
  nickname: string;
  timer?: Timer;
  dice: DiceState;
  sessionId?: string;
  userId?: string;
  /** The character this player is playing, shared with the party */
  character?: Character;
};
