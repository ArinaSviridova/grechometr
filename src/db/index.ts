import type { AppSettings, SinDefinition, SinEntry } from '../types'

const DB_NAME = 'grekhometr-db'
const DB_VERSION = 1

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('sins')) {
        const store = db.createObjectStore('sins', { keyPath: 'id' })
        store.createIndex('title', 'title', { unique: false })
        store.createIndex('category', 'category', { unique: false })
      }
      if (!db.objectStoreNames.contains('entries')) {
        const store = db.createObjectStore('entries', { keyPath: 'id' })
        store.createIndex('createdAt', 'createdAt', { unique: false })
        store.createIndex('category', 'category', { unique: false })
        store.createIndex('sinId', 'sinId', { unique: false })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
  return dbPromise
}

function transactionDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function getSettings(): Promise<AppSettings | undefined> {
  const db = await openDb()
  const tx = db.transaction('settings', 'readonly')
  return requestResult(tx.objectStore('settings').get('settings')) as Promise<AppSettings | undefined>
}

export async function putSettings(settings: AppSettings): Promise<void> {
  const db = await openDb()
  const tx = db.transaction('settings', 'readwrite')
  tx.objectStore('settings').put(settings)
  await transactionDone(tx)
}

export async function getAllSins(): Promise<SinDefinition[]> {
  const db = await openDb()
  const tx = db.transaction('sins', 'readonly')
  return requestResult(tx.objectStore('sins').getAll()) as Promise<SinDefinition[]>
}

export async function putSin(sin: SinDefinition): Promise<void> {
  const db = await openDb()
  const tx = db.transaction('sins', 'readwrite')
  tx.objectStore('sins').put(sin)
  await transactionDone(tx)
}

export async function putSins(sins: SinDefinition[]): Promise<void> {
  const db = await openDb()
  const tx = db.transaction('sins', 'readwrite')
  const store = tx.objectStore('sins')
  sins.forEach((sin) => store.put(sin))
  await transactionDone(tx)
}

export async function deleteSin(id: string): Promise<void> {
  const db = await openDb()
  const tx = db.transaction('sins', 'readwrite')
  tx.objectStore('sins').delete(id)
  await transactionDone(tx)
}

export async function getAllEntries(): Promise<SinEntry[]> {
  const db = await openDb()
  const tx = db.transaction('entries', 'readonly')
  return requestResult(tx.objectStore('entries').getAll()) as Promise<SinEntry[]>
}

export async function putEntry(entry: SinEntry): Promise<void> {
  const db = await openDb()
  const tx = db.transaction('entries', 'readwrite')
  tx.objectStore('entries').put(entry)
  await transactionDone(tx)
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await openDb()
  const tx = db.transaction('entries', 'readwrite')
  tx.objectStore('entries').delete(id)
  await transactionDone(tx)
}

export async function replaceAll(settings: AppSettings, sins: SinDefinition[], entries: SinEntry[]): Promise<void> {
  const db = await openDb()
  const tx = db.transaction(['settings', 'sins', 'entries'], 'readwrite')
  const settingsStore = tx.objectStore('settings')
  const sinsStore = tx.objectStore('sins')
  const entriesStore = tx.objectStore('entries')
  settingsStore.clear()
  sinsStore.clear()
  entriesStore.clear()
  settingsStore.put(settings)
  sins.forEach((sin) => sinsStore.put(sin))
  entries.forEach((entry) => entriesStore.put(entry))
  await transactionDone(tx)
}

export async function resetDb(): Promise<void> {
  const db = await openDb()
  const tx = db.transaction(['settings', 'sins', 'entries'], 'readwrite')
  tx.objectStore('settings').clear()
  tx.objectStore('sins').clear()
  tx.objectStore('entries').clear()
  await transactionDone(tx)
}

export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator.storage?.persist) return false
  try {
    return await navigator.storage.persist()
  } catch {
    return false
  }
}
