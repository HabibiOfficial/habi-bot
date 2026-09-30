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
 * * Ambil video dari link TikTok/FB/IG/X
 */

import { apiJson } from '../../lib/habi-api.js'
import { bytes, fail, needText, needUrl, react, sendText } from '../../lib/api-helpers.js'

const handler = async (m, { conn }) => {
  try {
  const url = needUrl(m, '.apiget https://www.tiktok.com/@user/video/ID')
  let platform = '-'
  try {
    const det = await apiJson('/api/detect', { url })
    platform = det.platform || '-'
  } catch { /* abaikan */ }
  const d = await apiJson('/api/resolve', { url })
  const v = d.media && d.media.video
  if (!v || !v.url) throw new Error('Tidak ada video yang bisa diambil dari link itu.')
  await sendText(conn, m, [
    String(d.title || '-').slice(0, 45), '',
    'Platform : ' + d.platform,
    'Sumber   : ' + d.source,
    'Ukuran   : ' + bytes(v.size),
    'Resolusi : ' + (v.width || '?') + 'x' + (v.height || '?'),
    '', v.url,
    '', 'Kirim video ini ke chat dengan .apikirim',
  ].join('\n'))
    await react(conn, m, '✅')
  } catch (error) {
    await fail(conn, m, error)
  }
}

handler.command = /^(?:apiget|mediahub)$/i
handler.help = ["apiget"]
handler.tags = ["api","downloader"]
handler.category = 'api'
handler.description = "Ambil video dari link TikTok/FB/IG/X"

export default handler
