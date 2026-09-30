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
 * * Spesifikasi smartphone
 */

import { apiJson } from '../../lib/habi-api.js'
import { fail, needText, needUrl, react, sendText } from '../../lib/api-helpers.js'

const handler = async (m, { conn }) => {
  try {
  const q = needText(m, '.phonespec iPhone 15 Pro')
  const d = await apiJson('/api/phonespecs', { q })
  const s = d.specs || d.data || d
  let lines
  if (s && typeof s === 'object' && !Array.isArray(s)) {
    lines = Object.keys(s).map((k) => '• ' + k + ' : ' + s[k]).join('\n')
  } else {
    lines = String(s)
  }
  await sendText(conn, m, q + '\n\n' + String(lines).slice(0, 3000))
    await react(conn, m, '✅')
  } catch (error) {
    await fail(conn, m, error)
  }
}

handler.command = /^(?:phonespec|spesifikhp|spek)$/i
handler.help = ["phonespec"]
handler.tags = ["api","info"]
handler.category = 'api'
handler.description = "Spesifikasi smartphone"

export default handler
