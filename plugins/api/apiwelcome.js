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
 * * Kartu sambutan member grup
 */

import { apiFile } from '../../lib/habi-api.js'
import { fail, needText, needUrl, react, sendImage } from '../../lib/api-helpers.js'

const handler = async (m, { conn }) => {
  try {
  const [name, group] = m.args || []
  if (!name) throw new Error('Isi namanya dulu. Contoh: .welcomecard Budi Komunitas Hacker ID')
  const file = await apiFile('/api/welcome', { name, group: group || 'Grup WhatsApp', accent: 'green' })
  await sendImage(conn, m, file, 'Selamat datang, ' + name + '!')
    await react(conn, m, '✅')
  } catch (error) {
    await fail(conn, m, error)
  }
}

handler.command = /^(?:welcomecard|kartu|selamat)$/i
handler.help = ["welcomecard"]
handler.tags = ["api","image","welcome"]
handler.category = 'api'
handler.description = "Kartu sambutan member grup"

export default handler
