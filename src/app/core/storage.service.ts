import {Injectable, signal} from '@angular/core';
import {GameId} from './game-catalog';
import {DEFAULT_PREFERENCES, Preferences, SessionSnapshot, SessionSummary, StoredData} from './session.models';

const KEY = 'unloop:data:v1';
const GAME_IDS: readonly GameId[] = ['pocket-post', 'stencil-studio', 'little-harbour', 'orbit-garden'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
function isGameId(value: unknown): value is GameId {
  return typeof value === 'string' && GAME_IDS.includes(value as GameId);
}
function validPreferences(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value)) return false;
  return (value['durationMinutes'] === 5 || value['durationMinutes'] === 10)
    && typeof value['gentleOnly'] === 'boolean'
    && typeof value['reduceMotion'] === 'boolean'
    && typeof value['sound'] === 'boolean'
    && typeof value['haptics'] === 'boolean'
    && Array.isArray(value['seenTutorials'])
    && (value['theme'] === undefined || value['theme'] === 'light' || value['theme'] === 'dark');
}
function normalizePreferences(value: Record<string, unknown>): Preferences {
  return {
    durationMinutes: value['durationMinutes'] === 10 ? 10 : 5,
    gentleOnly: value['gentleOnly'] === true,
    reduceMotion: value['reduceMotion'] === true,
    sound: value['sound'] === true,
    haptics: value['haptics'] === true,
    theme: value['theme'] === 'dark' ? 'dark' : 'light',
    seenTutorials: Array.isArray(value['seenTutorials']) ? value['seenTutorials'].filter(isGameId) : [],
  };
}
function validSession(value: unknown): value is SessionSnapshot {
  if (!isRecord(value)) return false;
  return value['version'] === 1
    && typeof value['id'] === 'string'
    && typeof value['activeMs'] === 'number'
    && typeof value['puzzleCount'] === 'number'
    && Array.isArray(value['queue'])
    && isGameId(value['currentGame']);
}

@Injectable({providedIn: 'root'})
export class StorageService {
  readonly notice = signal<string | null>(null);
  readonly preferences = signal<Preferences>(DEFAULT_PREFERENCES);
  readonly active = signal<SessionSnapshot | null>(null);
  readonly history = signal<readonly SessionSummary[]>([]);
  private memory: StoredData = {version: 1, preferences: DEFAULT_PREFERENCES, active: null, history: []};

  constructor() { this.read(); }

  updatePreferences(patch: Partial<Preferences>): void {
    this.preferences.update((value) => ({...value, ...patch}));
    this.persist();
  }
  saveActive(snapshot: SessionSnapshot | null): void { this.active.set(snapshot); this.persist(); }
  addSummary(summary: SessionSummary): void {
    this.history.update((items) => [summary, ...items].slice(0, 100));
    this.active.set(null);
    this.persist();
  }
  markTutorialSeen(game: GameId): void {
    if (!this.preferences().seenTutorials.includes(game)) {
      this.updatePreferences({seenTutorials: [...this.preferences().seenTutorials, game]});
    }
  }
  clear(): void {
    try{for(const kind of ['trail','picross','cargo','circuit'])localStorage.removeItem('unloop:recent-boards:v2:'+kind)}catch{/* Storage is optional. */}
    this.preferences.set(DEFAULT_PREFERENCES);
    this.active.set(null);
    this.history.set([]);
    this.persist();
    this.notice.set('Local history and preferences were cleared.');
  }

  private read(): void {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (!isRecord(parsed) || parsed['version'] !== 1 || !validPreferences(parsed['preferences'])) throw new Error();
      const active = parsed['active'];
      this.preferences.set(normalizePreferences(parsed['preferences']));
      this.active.set(active === null || validSession(active) ? active : null);
      this.history.set(Array.isArray(parsed['history']) ? parsed['history'].filter(isRecord) as unknown as SessionSummary[] : []);
    } catch {
      this.notice.set('Some saved data could not be read, so Unloop started fresh.');
    }
  }
  private persist(): void {
    this.memory = {version: 1, preferences: this.preferences(), active: this.active(), history: this.history()};
    try { localStorage.setItem(KEY, JSON.stringify(this.memory)); }
    catch { this.notice.set('Browser storage is unavailable. This session will continue in memory.'); }
  }
}
