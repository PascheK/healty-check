'use client';

import { openDB, IDBPDatabase } from 'idb';

// 🔧 Nom de la base de données et du store
const DB_NAME = 'healthy-check-db';
const STORE_NAME = 'storage';

// 🔵 Promesse partagée (singleton)
let dbPromise: Promise<IDBPDatabase<any>> | null = null;

// 🔵 Fonction d'accès (ou création) à la base IndexedDB
async function getDB(): Promise<IDBPDatabase<any>> {
  if (typeof window === 'undefined') {
    throw new Error('IndexedDB n’est pas disponible côté serveur');
  }

  // Si aucune promesse n’existe encore
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
    // Vérifie si le store existe vraiment (par sécurité)
    const db = await dbPromise;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.close();
      const newVersion = db.version + 1;
      dbPromise = openDB(DB_NAME, newVersion, {
        upgrade(upgradeDb) {
          if (!upgradeDb.objectStoreNames.contains(STORE_NAME)) {
            upgradeDb.createObjectStore(STORE_NAME);
            console.log('📦 Object store "storage" recréé après vérification');
          }
        },
      });
    }
  }

  return dbPromise;
}

// 🔧 Service de stockage générique
export const storageService = {
  // ✅ Écriture d’une valeur
  async setItem(key: string, value: any): Promise<void> {
    try {
      const db = await getDB();
      await db.put(STORE_NAME, value, key);
    } catch (error) {
      console.warn('⚠️ IndexedDB indisponible, fallback localStorage', error);
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error('❌ localStorage également indisponible :', e);
      }
    }
  },

  // ✅ Lecture d’une valeur
  async getItem<T = any>(key: string): Promise<T | null> {
    try {
      const db = await getDB();
      const result = await db.get(STORE_NAME, key);
      return result ?? null;
    } catch (error) {
      console.warn('⚠️ IndexedDB indisponible, fallback localStorage', error);
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (e) {
        console.error('❌ Erreur lecture localStorage :', e);
        return null;
      }
    }
  },

  // ✅ Suppression d’une valeur
  async removeItem(key: string): Promise<void> {
    try {
      const db = await getDB();
      await db.delete(STORE_NAME, key);
    } catch (error) {
      console.warn('⚠️ IndexedDB indisponible, fallback localStorage', error);
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error('❌ Échec suppression localStorage :', e);
      }
    }
  },
};
