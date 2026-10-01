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
 * * Kartu saldo simulasi (watermark SIMULASI, bukan bukti transfer)
 */

import { apiFile } from '../../lib/habi-api.js'
import { fail, needText, needUrl, react, sendImage } from '../../lib/api-helpers.js'

const handler = async (m, { conn }) => {
  try {
  const nominal = needText(m, '.saldo 500000')
  const file = await apiFile('/api/saldo', { nominal })
  await sendImage(conn, m, file, 'Saldo simulasi: Rp ' + nominal + '\n_simulasi — bukan transaksi nyata_')
    await react(conn, m, '✅')
  } catch (error) {
    await fail(conn, m, error)
  }
}

handler.command = /^(?:saldo|desainsaldo)$/i
handler.help = ["saldo"]
handler.tags = ["api","image","simulasi"]
handler.category = 'api'
handler.description = "Kartu saldo simulasi (watermark SIMULASI, bukan bukti transfer)"

export default handler
