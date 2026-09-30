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
 * * Metadata lengkap video YouTube
 */

import { apiJson } from '../../lib/habi-api.js'
import { duration, fail, needText, needUrl, react, sendText } from '../../lib/api-helpers.js'

const handler = async (m, { conn }) => {
  try {
  const url = needUrl(m, '.ytinfo https://youtu.be/VIDEO_ID')
  const d = await apiJson('/api/ytinfo', { url })
  await sendText(conn, m, [
    d.title, '',
    'Durasi  : ' + duration(d.duration),
    'Channel : ' + (d.uploader || '-'),
    'Views   : ' + (d.view_count ? d.view_count.toLocaleString('id-ID') : '-'),
    'Format  : ' + (d.ext || '-'),
    '', d.webpage_url,
  ].join('\n'))
    await react(conn, m, '✅')
  } catch (error) {
    await fail(conn, m, error)
  }
}

handler.command = /^(?:ytinfo|infoyt)$/i
handler.help = ["ytinfo"]
handler.tags = ["api","downloader"]
handler.category = 'api'
handler.description = "Metadata lengkap video YouTube"

export default handler
