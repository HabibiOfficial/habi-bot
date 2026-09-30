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
 * * Beri watermark ke foto
 */

import { apiFile } from '../../lib/habi-api.js'
import { fail, needText, needUrl, react, resolveImageSource, sendImage } from '../../lib/api-helpers.js'

const handler = async (m, { conn }) => {
  try {
  const parts = m.args || []
  let image = ''
  const rest = []
  for (const p of parts) { if (p.includes('://')) image = p; else rest.push(p) }
  if (!image) image = await resolveImageSource(m)
  const file = await apiFile('/api/watermark', { image, text: rest.join(' ') || 'HABI API', position: 'br', opacity: '0.75' })
  await sendImage(conn, m, file, 'Watermark: ' + (rest.join(' ') || 'HABI API'))
    await react(conn, m, '✅')
  } catch (error) {
    await fail(conn, m, error)
  }
}

handler.command = /^(?:watermark|wm)$/i
handler.help = ["watermark"]
handler.tags = ["api","image","watermark"]
handler.category = 'api'
handler.description = "Beri watermark ke foto"

export default handler
