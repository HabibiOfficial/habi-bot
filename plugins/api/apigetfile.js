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
 * * Unduh file dari URL
 */

import { apiFile } from '../../lib/habi-api.js'
import { fail, needText, needUrl, react, sendFile } from '../../lib/api-helpers.js'

const handler = async (m, { conn }) => {
  try {
  const url = needUrl(m, '.getfile https://contoh.com/file.pdf')
  const file = await apiFile('/api/file', { url })
  let name = 'habi-file'
  try { name = decodeURIComponent(new URL(url).pathname.split('/').pop() || name) } catch { /* abaikan */ }
  await sendFile(conn, m, file, name.slice(0, 60))
    await react(conn, m, '✅')
  } catch (error) {
    await fail(conn, m, error)
  }
}

handler.command = /^(?:getfile|filedl|unduhfile)$/i
handler.help = ["getfile"]
handler.tags = ["api","tools"]
handler.category = 'api'
handler.description = "Unduh file dari URL"

export default handler
