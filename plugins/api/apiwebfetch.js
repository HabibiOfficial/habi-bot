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
 * * Ambil isi teks sebuah halaman web
 */

import { apiJson } from '../../lib/habi-api.js'
import { fail, needText, needUrl, react, sendText } from '../../lib/api-helpers.js'

const handler = async (m, { conn }) => {
  try {
  const url = needUrl(m, '.webfetch https://example.com')
  const d = await apiJson('/api/webfetch', { url })
  const t = d.content || d.text || d.result || ''
  if (!t) throw new Error('Halamannya kosong atau tidak bisa dibaca.')
  await sendText(conn, m, url + '\n\n' + String(t).slice(0, 3000))
    await react(conn, m, '✅')
  } catch (error) {
    await fail(conn, m, error)
  }
}

handler.command = /^(?:webfetch|bacaindex|readweb)$/i
handler.help = ["webfetch"]
handler.tags = ["api","web"]
handler.category = 'api'
handler.description = "Ambil isi teks sebuah halaman web"

export default handler
