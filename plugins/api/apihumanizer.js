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
 * * Tulis ulang teks kaku ala AI
 */

import { apiJson } from '../../lib/habi-api.js'
import { fail, needText, needUrl, react, sendText } from '../../lib/api-helpers.js'

const handler = async (m, { conn }) => {
  try {
  const text = needText(m, '.humanizer It is important to note that this')
  const d = await apiJson('/api/humanizer', { text, mode: 'indo' })
  const out = d.text || d.result || d.output || ''
  if (!out) throw new Error('API tidak mengembalikan teks.')
  await sendText(conn, m, 'Humanizer\n\n' + String(out))
    await react(conn, m, '✅')
  } catch (error) {
    await fail(conn, m, error)
  }
}

handler.command = /^(?:humanizer|human|baixasi)$/i
handler.help = ["humanizer"]
handler.tags = ["api","text"]
handler.category = 'api'
handler.description = "Tulis ulang teks kaku ala AI"

export default handler
