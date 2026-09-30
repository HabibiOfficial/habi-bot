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

export async function isAnticallActive() {
  const db = getDb()
  const row = db.prepare('SELECT enabled FROM anticall_status WHERE id = 1').get()
  return !!row?.enabled
}

export async function setAnticallStatus(enabled) {
  const db = getDb()
  db.prepare(
    'INSERT INTO anticall_status (id, enabled) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET enabled = excluded.enabled'
  ).run(enabled ? 1 : 0)
  return enabled
}

export default { isAnticallActive, setAnticallStatus }
