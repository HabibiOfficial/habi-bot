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
 * * Brat jadi video MP4
 */

import { apiFile } from '../../lib/habi-api.js'
import { fail, needText, needUrl, react, sendVideoSticker } from '../../lib/api-helpers.js'

const handler = async (m, { conn }) => {
  try {
  const text = needText(m, '.bratvid halo semua')
  const file = await apiFile('/api/bratvid', { text, duration: '2' })
  await sendVideoSticker(conn, m, file, { seconds: 3, packname: 'HABI', author: 'Habibih Cloud ID' })
    await react(conn, m, '✅')
  } catch (error) {
    await fail(conn, m, error)
  }
}

handler.command = /^(?:bratvid|bratvideo)$/i
handler.help = ["bratvid"]
handler.tags = ["api","video","brat"]
handler.category = 'api'
handler.description = "Brat jadi video MP4"

export default handler
