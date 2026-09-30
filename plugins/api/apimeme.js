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
 * * Buat meme dari URL gambar
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
  const file = await apiFile('/api/meme', { image, top: rest[0] || '', bottom: rest[1] || '' })
  await sendImage(conn, m, file, 'Meme: ' + (rest.join(' ') || 'tanpa teks'))
    await react(conn, m, '✅')
  } catch (error) {
    await fail(conn, m, error)
  }
}

handler.command = /^(?:meme|memin)$/i
handler.help = ["meme"]
handler.tags = ["api","image","meme"]
handler.category = 'api'
handler.description = "Buat meme dari URL gambar"

export default handler
