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
 * * Jadikan foto jadi stiker (lewat API)
 */

import { apiFile } from '../../lib/habi-api.js'
import { fail, needText, needUrl, react, resolveImageSource } from '../../lib/api-helpers.js'

const handler = async (m, { conn }) => {
  try {
  const image = needUrl(m, '.stikerapi https://contoh.com/foto.jpg')
  const file = await apiFile('/api/sticker', { image, format: 'webp' })
  await conn.sendMessage(m.chat, { sticker: file, mimetype: 'image/webp' }, { quoted: m.raw })
    await react(conn, m, '✅')
  } catch (error) {
    await fail(conn, m, error)
  }
}

handler.command = /^(?:stikerapi|webp)$/i
handler.help = ["stikerapi"]
handler.tags = ["api","sticker"]
handler.category = 'api'
handler.description = "Jadikan foto jadi stiker (lewat API)"

export default handler
