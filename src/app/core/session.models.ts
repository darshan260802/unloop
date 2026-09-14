import {GameId, SessionChoice} from './game-catalog';

export type Difficulty = 'gentle' | 'standard';
export type SessionPhase = 'playing' | 'paused' | 'between' | 'limit' | 'finished';

export interface Preferences {
  readonly durationMinutes: 5 | 10;
  readonly gentleOnly: boolean;
  readonly reduceMotion: boolean;
  readonly sound: boolean;
  readonly haptics: boolean;
  readonly seenTutorials: readonly GameId[];
}

export interface SessionSnapshot {
  readonly version: 1;
  readonly id: string;
  readonly choice: SessionChoice;
  readonly durationMinutes: 5 | 10;
  readonly queue: readonly GameId[];
  readonly currentGame: GameId;
  readonly phase: SessionPhase;
  readonly activeMs: number;
  readonly puzzleCount: number;
  readonly unassistedStreak: number;
  readonly assistedThisPuzzle: boolean;
  readonly startedAt: string;
  readonly puzzleId: string | null;
}

export interface SessionSummary {
  readonly id: string;
  readonly completedAt: string;
  readonly durationMs: number;
  readonly puzzleCount: number;
  readonly games: readonly GameId[];
}

export interface StoredData {
  readonly version: 1;
  readonly preferences: Preferences;
  readonly active: SessionSnapshot | null;
  readonly history: readonly SessionSummary[];
}

export const DEFAULT_PREFERENCES: Preferences = {
  durationMinutes: 5,
  gentleOnly: false,
  reduceMotion: false,
  sound: false,
  haptics: false,
  seenTutorials: [],
};
