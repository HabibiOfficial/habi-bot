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
 * * Screenshot chat iPhone dari teks
 */

import { apiFile } from '../../lib/habi-api.js'
import { fail, needText, needUrl, react, sendImage } from '../../lib/api-helpers.js'

const handler = async (m, { conn }) => {
  try {
  const text = needText(m, '.iqc Halo dunia')
  const file = await apiFile('/api/iqc', { text, time: '09.41' })
  await sendImage(conn, m, file, 'Screenshot iPhone dari: ' + text)
    await react(conn, m, '✅')
  } catch (error) {
    await fail(conn, m, error)
  }
}

handler.command = /^(?:iqc|quote|chat)$/i
handler.help = ["iqc","quote"]
handler.tags = ["api","image","quote"]
handler.category = 'api'
handler.description = "Screenshot chat iPhone dari teks"

export default handler
