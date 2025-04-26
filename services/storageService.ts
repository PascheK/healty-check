'use client';

import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'healthy-check-db';
const STORE_NAME = 'storage';

let dbPromise: Promise<IDBPDatabase<any>> | null = null;

async function getDB() {
  if (typeof window === 'undefined') {
    throw new Error('IndexedDB n’est pas disponible côté serveur');
  }

  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, undefined, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
          console.log('📦 Object store "storage" créé (ou réparé)');
        }
      },
    });
  } else {
    const db = await dbPromise;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.close();
      const newVersion = db.version + 1;
      dbPromise = openDB(DB_NAME, newVersion, {
        upgrade(upgradeDb) {
          if (!upgradeDb.objectStoreNames.contains(STORE_NAME)) {
            upgradeDb.createObjectStore(STORE_NAME);
            console.log('📦 Object store "storage" recréé après check');
          }
        },
      });
    }
  }

  return dbPromise;
}

export const storageService = {
  async setItem(key: string, value: any) {
    try {
      const db = await getDB();
      await db.put(STORE_NAME, value, key);
    } catch (error) {
      console.warn('⚠️ IndexedDB indisponible, fallback localStorage', error);
      localStorage.setItem(key, JSON.stringify(value));
    }
  },

  async getItem<T = any>(key: string): Promise<T | null> {
    try {
      const db = await getDB();
      const result = await db.get(STORE_NAME, key);
      return result ?? null;
    } catch (error) {
      console.warn('⚠️ IndexedDB indisponible, fallback localStorage', error);
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
  },

  async removeItem(key: string) {
    try {
      const db = await getDB();
      await db.delete(STORE_NAME, key);
    } catch (error) {
      console.warn('⚠️ IndexedDB indisponible, fallback localStorage', error);
      localStorage.removeItem(key);
    }
  },
};
