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
 * * Screenshot sebuah website
 */

import { apiFile } from '../../lib/habi-api.js'
import { fail, needText, needUrl, react, sendImage } from '../../lib/api-helpers.js'

const handler = async (m, { conn }) => {
  try {
  const url = needUrl(m, '.ssweb https://example.com')
  const file = await apiFile('/api/ssweb', { url })
  await sendImage(conn, m, file, 'Screenshot ' + url)
    await react(conn, m, '✅')
  } catch (error) {
    await fail(conn, m, error)
  }
}

handler.command = /^(?:ssweb|screenshot)$/i
handler.help = ["ssweb"]
handler.tags = ["api","web"]
handler.category = 'api'
handler.description = "Screenshot sebuah website"

export default handler
