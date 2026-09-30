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
 * * Baca teks dari gambar
 */

import { apiJson } from '../../lib/habi-api.js'
import { fail, needText, needUrl, react, sendText } from '../../lib/api-helpers.js'

const handler = async (m, { conn }) => {
  try {
  const url = needUrl(m, '.ocr https://contoh.com/foto.jpg')
  const d = await apiJson('/api/ocr', { url })
  const t = d.text || d.result || d.ocr || ''
  if (!t) throw new Error('Tidak ada teks yang terbaca di gambar itu.')
  await sendText(conn, m, 'Hasil OCR\n\n' + String(t).slice(0, 3000))
    await react(conn, m, '✅')
  } catch (error) {
    await fail(conn, m, error)
  }
}

handler.command = /^(?:ocr|bacagambar)$/i
handler.help = ["ocr"]
handler.tags = ["api","ocr"]
handler.category = 'api'
handler.description = "Baca teks dari gambar"

export default handler
