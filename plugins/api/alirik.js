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
 * * Cari lirik lagu
 */

import { apiJson } from '../../lib/habi-api.js'
import { fail, needText, needUrl, react, sendText } from '../../lib/api-helpers.js'

const handler = async (m, { conn }) => {
  try {
  const q = needText(m, '.lirik Indonesia Raya')
  const d = await apiJson('/api/lirik', { q })
  const lyric = d.lyrics || d.lirik || d.text || ''
  if (!lyric) throw new Error('Lirik ' + q + ' tidak ketemu. Coba judul yang lebih umum.')
  await sendText(conn, m, (d.title || q) + (d.artist ? ' - ' + d.artist : '') + '\n\n' + String(lyric).slice(0, 3000))
    await react(conn, m, '✅')
  } catch (error) {
    await fail(conn, m, error)
  }
}

handler.command = /^(?:lirik|carilirik)$/i
handler.help = ["lirik"]
handler.tags = ["api","music","text"]
handler.category = 'api'
handler.description = "Cari lirik lagu"

export default handler
