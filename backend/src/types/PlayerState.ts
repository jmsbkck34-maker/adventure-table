import { Timer } from "./Timer";
import { Dice } from "./Dice";

export type PlayerState = {
  nickname: string;
  timer?: Timer;
  dice: Dice;
  sessionId?: string;
  userId?: string;
  /** The character this player is playing, shared with the party */
  character?: unknown;
};
