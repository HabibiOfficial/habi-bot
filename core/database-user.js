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


import { getDb } from './sqlite.js'

function toUserRecord(row) {
  if (!row) return null
  return { pushName: row.pushName, registeredAt: row.registeredAt }
}

export async function touchUser(jid, pushName) {
  const db = getDb()
  const existing = db.prepare('SELECT pushName, registeredAt FROM users WHERE jid = ?').get(jid)

  if (!existing) {
    const registeredAt = Date.now()
    db.prepare('INSERT INTO users (jid, pushName, registeredAt) VALUES (?, ?, ?)').run(jid, pushName, registeredAt)
    return { pushName, registeredAt }
  }

  if (existing.pushName !== pushName) {
    db.prepare('UPDATE users SET pushName = ? WHERE jid = ?').run(pushName, jid)
    return { pushName, registeredAt: existing.registeredAt }
  }

  return toUserRecord(existing)
}

export async function getUser(jid) {
  const db = getDb()
  const row = db.prepare('SELECT pushName, registeredAt FROM users WHERE jid = ?').get(jid)
  return toUserRecord(row)
}

export default { touchUser, getUser }
