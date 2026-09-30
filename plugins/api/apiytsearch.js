/**
 * ╔══════════════════════════════════════════════╗
 * ║  ------ HABI AI --------                      ║
 * ║  WA Bot • by Habibih Official ID             ║
 * ╚══════════════════════════════════════════════╝
 *
 * @author Habibih Official ID
 * @website habibi-store.pages.dev
 * @wa  wa.me/6285181576338
 * @source Habibih Cloud ID - No Comot, No Ganti Nama
 * * Cari video di YouTube
 */

import { apiJson } from '../../lib/habi-api.js'
import { duration, fail, needText, needUrl, react, sendText } from '../../lib/api-helpers.js'

const handler = async (m, { conn }) => {
  try {
  const q = needText(m, '.ytsearch rizky janaka')
  const data = await apiJson('/api/ytsearch', { q, limit: '8' })
  if (!data.results || !data.results.length) throw new Error('Tidak ada hasil untuk ' + q)
  const list = data.results.map((r, i) =>
    (i + 1) + '. ' + String(r.title).slice(0, 40) + '\n   ' + (r.duration ? duration(r.duration) : '?') +
    ' | ' + (r.uploader || '?') + '\n   ' + r.url
  ).join('\n')
  await sendText(conn, m, 'Hasil untuk ' + q + '\n\n' + list + '\n\nUnduh dengan .ytmp3 atau .ytmp4')
    await react(conn, m, '✅')
  } catch (error) {
    await fail(conn, m, error)
  }
}

handler.command = /^(?:ytsearch|cariyt)$/i
handler.help = ["ytsearch"]
handler.tags = ["api","downloader"]
handler.category = 'api'
handler.description = "Cari video di YouTube"

export default handler
