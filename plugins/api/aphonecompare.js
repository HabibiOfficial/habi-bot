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
 * * Bandingkan 2 smartphone
 */

import { apiJson } from '../../lib/habi-api.js'
import { fail, needText, needUrl, react, sendText } from '../../lib/api-helpers.js'

const handler = async (m, { conn }) => {
  try {
  const args = m.args || []
  const a = args[0]
  const b = args.slice(1).join(' ')
  if (!a || !b) throw new Error('Sebut dua HP. Contoh: .phonecompare iPhone 15 Pro Samsung S23')
  const d = await apiJson('/api/phonecompare', { a, b })
  await sendText(conn, m, [d.phone1 + '  vs  ' + d.phone2, '', d.url || ''].filter(Boolean).join('\n'))
    await react(conn, m, '✅')
  } catch (error) {
    await fail(conn, m, error)
  }
}

handler.command = /^(?:phonecompare|bandinghp)$/i
handler.help = ["phonecompare"]
handler.tags = ["api","info"]
handler.category = 'api'
handler.description = "Bandingkan 2 smartphone"

export default handler
