import {Injectable, signal} from '@angular/core';
import {DEFAULT_PREFERENCES, Preferences, SessionSnapshot, SessionSummary, StoredData} from './session.models';

const KEY = 'unloop:data:v1';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function validPreferences(value: unknown): value is Preferences {
  if (!isRecord(value)) return false;
  return (value['durationMinutes'] === 5 || value['durationMinutes'] === 10)
    && typeof value['gentleOnly'] === 'boolean'
    && typeof value['reduceMotion'] === 'boolean'
    && typeof value['sound'] === 'boolean'
    && typeof value['haptics'] === 'boolean'
    && Array.isArray(value['seenTutorials']);
}

function validSession(value: unknown): value is SessionSnapshot {
  if (!isRecord(value)) return false;
  return value['version'] === 1
    && typeof value['id'] === 'string'
    && typeof value['activeMs'] === 'number'
    && typeof value['puzzleCount'] === 'number'
    && Array.isArray(value['queue'])
    && typeof value['currentGame'] === 'string';
}

@Injectable({providedIn: 'root'})
export class StorageService {
  readonly notice = signal<string | null>(null);
  readonly preferences = signal<Preferences>(DEFAULT_PREFERENCES);
  readonly active = signal<SessionSnapshot | null>(null);
  readonly history = signal<readonly SessionSummary[]>([]);
  private memory: StoredData = {version: 1, preferences: DEFAULT_PREFERENCES, active: null, history: []};

  constructor() {
    this.read();
  }

  updatePreferences(patch: Partial<Preferences>): void {
    this.preferences.update((value) => ({...value, ...patch}));
    this.persist();
  }

  saveActive(snapshot: SessionSnapshot | null): void {
    this.active.set(snapshot);
    this.persist();
  }

  addSummary(summary: SessionSummary): void {
    this.history.update((items) => [summary, ...items].slice(0, 100));
    this.active.set(null);
    this.persist();
  }

  markTutorialSeen(game: Preferences['seenTutorials'][number]): void {
    if (this.preferences().seenTutorials.includes(game)) return;
    this.updatePreferences({seenTutorials: [...this.preferences().seenTutorials, game]});
  }

  clear(): void {
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
      if (!isRecord(parsed) || parsed['version'] !== 1 || !validPreferences(parsed['preferences'])) {
        throw new Error('Unsupported saved data');
      }
      const active = parsed['active'];
      this.preferences.set(parsed['preferences']);
      this.active.set(active === null || validSession(active) ? active : null);
      this.history.set(Array.isArray(parsed['history']) ? parsed['history'].filter(isRecord) as unknown as SessionSummary[] : []);
    } catch {
      this.notice.set('Some saved data could not be read, so Unloop started fresh.');
    }
  }

  private persist(): void {
    this.memory = {version: 1, preferences: this.preferences(), active: this.active(), history: this.history()};
    try {
      localStorage.setItem(KEY, JSON.stringify(this.memory));
    } catch {
      this.notice.set('Browser storage is unavailable. This session will continue in memory.');
    }
  }
}
