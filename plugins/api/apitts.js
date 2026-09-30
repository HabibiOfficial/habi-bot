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
 * * Ubah teks jadi suara MP3 (lewat API)
 */

import { apiFile } from '../../lib/habi-api.js'
import { fail, needText, needUrl, react, sendAudio } from '../../lib/api-helpers.js'

const handler = async (m, { conn }) => {
  try {
  const text = needText(m, '.ttsapi Halo dunia')
  const file = await apiFile('/api/tts', { text })
  await sendAudio(conn, m, file, text.slice(0, 60))
    await react(conn, m, '✅')
  } catch (error) {
    await fail(conn, m, error)
  }
}

handler.command = /^(?:ttsapi|suarakan)$/i
handler.help = ["ttsapi"]
handler.tags = ["api","audio"]
handler.category = 'api'
handler.description = "Ubah teks jadi suara MP3 (lewat API)"

export default handler
