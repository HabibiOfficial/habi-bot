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
 * * Kirim video dari link langsung ke chat
 */

import { apiJson } from '../../lib/habi-api.js'
import { fail, needText, needUrl, react } from '../../lib/api-helpers.js'

const handler = async (m, { conn }) => {
  try {
  const url = needUrl(m, '.apikirim https://www.tiktok.com/@user/video/ID')
  const d = await apiJson('/api/resolve', { url })
  const v = d.media && d.media.video
  if (!v || !v.url) throw new Error('Tidak ada video yang bisa diambil dari link itu.')
  await conn.sendMessage(m.chat, {
    video: { url: v.url }, mimetype: 'video/mp4',
    caption: String(d.title || 'Media').slice(0, 60),
  }, { quoted: m.raw })
    await react(conn, m, '✅')
  } catch (error) {
    await fail(conn, m, error)
  }
}

handler.command = /^(?:apikirim|kirimedia)$/i
handler.help = ["apikirim"]
handler.tags = ["api","downloader"]
handler.category = 'api'
handler.description = "Kirim video dari link langsung ke chat"

export default handler
