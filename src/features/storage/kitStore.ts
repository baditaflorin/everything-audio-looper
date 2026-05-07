import { openDB, type DBSchema } from 'idb';
import type { AnalyzerMode, DrumKit } from '../audio/types';

type StoredPreference = {
  key: 'analyzer-mode';
  value: AnalyzerMode;
};

interface LooperDb extends DBSchema {
  kits: {
    key: string;
    value: DrumKit;
    indexes: {
      'by-created-at': string;
    };
  };
  preferences: {
    key: StoredPreference['key'];
    value: StoredPreference;
  };
}

const DB_NAME = 'everything-audio-looper';

async function getDb() {
  return openDB<LooperDb>(DB_NAME, 1, {
    upgrade(db) {
      const kits = db.createObjectStore('kits', { keyPath: 'id' });
      kits.createIndex('by-created-at', 'createdAt');
      db.createObjectStore('preferences', { keyPath: 'key' });
    }
  });
}

export async function saveKit(kit: DrumKit) {
  const db = await getDb();
  await db.put('kits', kit);
}

export async function getLatestKit() {
  const db = await getDb();
  const kits = await db.getAllFromIndex('kits', 'by-created-at');
  return kits.at(-1);
}

export async function saveAnalyzerMode(value: AnalyzerMode) {
  const db = await getDb();
  await db.put('preferences', { key: 'analyzer-mode', value });
}

export async function getAnalyzerMode() {
  const db = await getDb();
  return (await db.get('preferences', 'analyzer-mode'))?.value ?? 'fast-js';
}
