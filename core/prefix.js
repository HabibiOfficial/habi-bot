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


import { settings } from '../config/settings.js'
import { getDb } from './sqlite.js'

export async function getActivePrefix(chatId) {
  const db = getDb()
  const row = db.prepare('SELECT prefix FROM prefixes WHERE chatId = ?').get(chatId)
  return row?.prefix || settings.defaultPrefix
}

export async function setPrefix(chatId, newPrefix) {
  const db = getDb()
  db.prepare(
    'INSERT INTO prefixes (chatId, prefix) VALUES (?, ?) ON CONFLICT(chatId) DO UPDATE SET prefix = excluded.prefix'
  ).run(chatId, newPrefix)
  return newPrefix
}

export async function resetPrefix(chatId) {
  const db = getDb()
  db.prepare('DELETE FROM prefixes WHERE chatId = ?').run(chatId)
  return settings.defaultPrefix
}

export default { getActivePrefix, setPrefix, resetPrefix }
