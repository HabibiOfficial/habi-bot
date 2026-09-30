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
 * * Spotify ke link YouTube
 */

import { apiJson } from '../../lib/habi-api.js'
import { fail, needText, needUrl, react, sendText } from '../../lib/api-helpers.js'

const handler = async (m, { conn }) => {
  try {
  const url = needUrl(m, '.spotify https://open.spotify.com/track/ID')
  const d = await apiJson('/api/spotify', { url })
  await sendText(conn, m, [
    d.title, '',
    'Artis : ' + d.artist,
    'Yakin : ' + d.matched.confidence,
    '', d.matched.url,
    '', 'Unduh: .ytmp3 ' + d.matched.url,
  ].join('\n'))
    await react(conn, m, '✅')
  } catch (error) {
    await fail(conn, m, error)
  }
}

handler.command = /^(?:spotify|spot)$/i
handler.help = ["spotify"]
handler.tags = ["api","downloader","music"]
handler.category = 'api'
handler.description = "Spotify ke link YouTube"

export default handler
