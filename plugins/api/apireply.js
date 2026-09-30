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
 * * Fake balasan chat WhatsApp
 */

import { apiFile } from '../../lib/habi-api.js'
import { fail, needText, needUrl, react, sendImage } from '../../lib/api-helpers.js'

const handler = async (m, { conn }) => {
  try {
  const parts = m.args || []
  let variant = '1'
  let rest = parts
  if (/^[1-5]$/.test(parts[0] || '')) { variant = parts[0]; rest = parts.slice(1) }
  const text = rest.join(' ') || 'Halo dunia'
  const file = await apiFile('/api/reply', { variant, text, name: 'HABI Official' })
  await sendImage(conn, m, file, 'Balasan (varian ' + variant + '): ' + text)
    await react(conn, m, '✅')
  } catch (error) {
    await fail(conn, m, error)
  }
}

handler.command = /^(?:reply|balasfake|fakereply)$/i
handler.help = ["reply"]
handler.tags = ["api","image","reply"]
handler.category = 'api'
handler.description = "Fake balasan chat WhatsApp"

export default handler
