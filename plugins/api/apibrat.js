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
 * * Gambar brat dari teks
 */

import { apiFile } from '../../lib/habi-api.js'
import { fail, needText, needUrl, react, sendImage } from '../../lib/api-helpers.js'

const handler = async (m, { conn }) => {
  try {
  const text = needText(m, '.brat halo semua')
  const file = await apiFile('/api/brat', { text })
  await sendImage(conn, m, file, 'Brat: ' + text)
    await react(conn, m, '✅')
  } catch (error) {
    await fail(conn, m, error)
  }
}

handler.command = /^(?:brat)$/i
handler.help = ["brat"]
handler.tags = ["api","image","brat"]
handler.category = 'api'
handler.description = "Gambar brat dari teks"

export default handler
