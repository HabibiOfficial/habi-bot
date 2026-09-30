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
 * * Cek platform dari sebuah URL
 */

import { apiJson } from '../../lib/habi-api.js'
import { fail, needText, needUrl, react, sendText } from '../../lib/api-helpers.js'

const handler = async (m, { conn }) => {
  try {
  const url = needUrl(m, '.detect https://vm.tiktok.com/XXXX/')
  const d = await apiJson('/api/detect', { url })
  await sendText(conn, m, 'Link itu platformnya: ' + d.platform + '\n\n' + url)
    await react(conn, m, '✅')
  } catch (error) {
    await fail(conn, m, error)
  }
}

handler.command = /^(?:detect|ceklink)$/i
handler.help = ["detect"]
handler.tags = ["api","tools"]
handler.category = 'api'
handler.description = "Cek platform dari sebuah URL"

export default handler
