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
 * * Terjemahkan teks
 */

import { apiJson } from '../../lib/habi-api.js'
import { fail, needText, needUrl, react, sendText } from '../../lib/api-helpers.js'

const handler = async (m, { conn }) => {
  try {
  const parts = m.args || []
  const codes = ['id', 'en', 'ja', 'ko', 'zh', 'ar', 'ru', 'th', 'ms', 'de', 'fr', 'es', 'pt', 'it', 'nl', 'tr']
  let to = 'id'
  if (codes.indexOf(String(parts[0] || '').toLowerCase()) !== -1) to = String(parts[0]).toLowerCase()
  const text = parts.filter((p) => p.toLowerCase() !== to).join(' ') || needText(m, '.translate en Halo dunia')
  const d = await apiJson('/api/translate', { text, to })
  const out = d.translated || d.result || d.text || '(kosong)'
  await sendText(conn, m, 'Terjemahan (' + to.toUpperCase() + ')\n\n' + String(out))
    await react(conn, m, '✅')
  } catch (error) {
    await fail(conn, m, error)
  }
}

handler.command = /^(?:translate|terjemah|tr)$/i
handler.help = ["translate"]
handler.tags = ["api","text"]
handler.category = 'api'
handler.description = "Terjemahkan teks"

export default handler
