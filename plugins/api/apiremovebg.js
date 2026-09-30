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
 * * Hapus background foto
 */

import { apiFile } from '../../lib/habi-api.js'
import { fail, needText, needUrl, react, sendImage } from '../../lib/api-helpers.js'

const handler = async (m, { conn }) => {
  try {
  const url = needUrl(m, '.removebg https://contoh.com/foto.jpg')
  const file = await apiFile('/api/removebg', { url })
  await sendImage(conn, m, file, 'Background sudah dihapus')
    await react(conn, m, '✅')
  } catch (error) {
    await fail(conn, m, error)
  }
}

handler.command = /^(?:removebg|hpsbg)$/i
handler.help = ["removebg"]
handler.tags = ["api","image"]
handler.category = 'api'
handler.description = "Hapus background foto"

export default handler
