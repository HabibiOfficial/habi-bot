/**
 * ╔══════════════
 * ║  ------ HABI AI --------
 * ║ WA Bot • by Habibih Official ID   
 * ╚══════════════
 * 
 * @author Habibih Official ID
 * @website habibi-store.pages.dev
 * @wa  wa.me/6285181576338
 * @source Habibih Cloud ID - No Comot, No Ganti Nama
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Database from 'better-sqlite3'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_DIR = path.join(__dirname, '..', 'data', 'database')
const DB_PATH = path.join(DB_DIR, 'qiro.sqlite')

let db = null

function applySchema(instance) {
  instance.exec(`
    CREATE TABLE IF NOT EXISTS users (
      jid TEXT PRIMARY KEY,
      pushName TEXT,
      registeredAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS prefixes (
      chatId TEXT PRIMARY KEY,
      prefix TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS anticall_status (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      enabled INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS group_welcome (
      chatId TEXT PRIMARY KEY,
      enabled INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS group_antilink (
      chatId TEXT PRIMARY KEY,
      gc_enabled INTEGER NOT NULL DEFAULT 0,
      ch_enabled INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS owners (
      number TEXT PRIMARY KEY,
      addedAt INTEGER NOT NULL,
      addedBy TEXT
    );

    CREATE TABLE IF NOT EXISTS antilink_strikes (
      chatId TEXT NOT NULL,
      senderJid TEXT NOT NULL,
      type TEXT NOT NULL,
      strikes INTEGER NOT NULL DEFAULT 0,
      updatedAt INTEGER NOT NULL,
      PRIMARY KEY (chatId, senderJid, type)
    );
  `)
}

function readLegacyJson(filePath) {
  if (!fs.existsSync(filePath)) return null

  try {
    const raw = fs.readFileSync(filePath, 'utf-8').trim()
    return raw ? JSON.parse(raw) : null
  } catch (err) {
    console.log(`  \x1b[33m⚠\x1b[0m  Gagal baca database lama "${path.basename(filePath)}": ${err.message}`)
    return null
  }
}

function markMigrated(filePath) {
  try {
    fs.renameSync(filePath, `${filePath}.migrated`)
  } catch {

  }
}

function migrateLegacyData(instance) {
  const userCount = instance.prepare('SELECT COUNT(*) AS total FROM users').get().total
  const usersJsonPath = path.join(DB_DIR, 'users.json')

  if (userCount === 0) {
    const legacyUsers = readLegacyJson(usersJsonPath)
    if (legacyUsers && Object.keys(legacyUsers).length) {
      const insertUser = instance.prepare(
        'INSERT OR IGNORE INTO users (jid, pushName, registeredAt) VALUES (?, ?, ?)'
      )
      const insertMany = instance.transaction((entries) => {
        for (const [jid, data] of entries) {
          insertUser.run(jid, data?.pushName ?? null, data?.registeredAt ?? Date.now())
        }
      })
      insertMany(Object.entries(legacyUsers))
      console.log(`  \x1b[32m✓\x1b[0m  Migrasi database: ${Object.keys(legacyUsers).length} user dipindah dari users.json ke SQLite`)
    }
  }
  if (fs.existsSync(usersJsonPath)) markMigrated(usersJsonPath)

  const prefixCount = instance.prepare('SELECT COUNT(*) AS total FROM prefixes').get().total
  const prefixJsonPath = path.join(DB_DIR, 'prefix.json')

  if (prefixCount === 0) {
    const legacyPrefixes = readLegacyJson(prefixJsonPath)
    if (legacyPrefixes && Object.keys(legacyPrefixes).length) {
      const insertPrefix = instance.prepare(
        'INSERT OR IGNORE INTO prefixes (chatId, prefix) VALUES (?, ?)'
      )
      const insertMany = instance.transaction((entries) => {
        for (const [chatId, prefix] of entries) {
          insertPrefix.run(chatId, prefix)
        }
      })
      insertMany(Object.entries(legacyPrefixes))
      console.log(`  \x1b[32m✓\x1b[0m  Migrasi database: ${Object.keys(legacyPrefixes).length} prefix custom dipindah dari prefix.json ke SQLite`)
    }
  }
  if (fs.existsSync(prefixJsonPath)) markMigrated(prefixJsonPath)
}

export function getDb() {
  if (db) return db

  fs.mkdirSync(DB_DIR, { recursive: true })

  db = new Database(DB_PATH)
  db.pragma('journal_mode = WAL')
  applySchema(db)
  migrateLegacyData(db)

  return db
}

export default { getDb }
