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
 * * Kompres ukuran file PDF
 */

import { apiFile } from '../../lib/habi-api.js'
import { fail, needText, needUrl, react, sendFile } from '../../lib/api-helpers.js'

const handler = async (m, { conn }) => {
  try {
  const url = needUrl(m, '.pdfcompress https://contoh.com/file.pdf')
  const file = await apiFile('/api/pdfcompress', { url })
  await sendFile(conn, m, file, 'kecil.pdf', 'application/pdf')
    await react(conn, m, '✅')
  } catch (error) {
    await fail(conn, m, error)
  }
}

handler.command = /^(?:pdfcompress|kecilpdf)$/i
handler.help = ["pdfcompress"]
handler.tags = ["api","tools"]
handler.category = 'api'
handler.description = "Kompres ukuran file PDF"

export default handler
