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
 * * URL thumbnail YouTube 3 resolusi
 */

import { apiJson } from '../../lib/habi-api.js'
import { fail, needText, needUrl, react, sendText } from '../../lib/api-helpers.js'

const handler = async (m, { conn }) => {
  try {
  const id = needText(m, '.ytthumb dQw4w9WgXcQ')
  const d = await apiJson('/api/ytthumb', { id })
  await sendText(conn, m, 'Thumbnail\n\nHD : ' + d.urls.maxres + '\nSD : ' + d.urls.sd + '\nHQ : ' + d.urls.hq)
    await react(conn, m, '✅')
  } catch (error) {
    await fail(conn, m, error)
  }
}

handler.command = /^(?:ytthumb)$/i
handler.help = ["ytthumb"]
handler.tags = ["api","downloader"]
handler.category = 'api'
handler.description = "URL thumbnail YouTube 3 resolusi"

export default handler
