/**
 * ╔══════════════════════════════════════════════╗
 * ║  ------ HABI AI --------                      ║
 * ║  WA Bot • by Habibih Official ID             ║
 * ╚══════════════════════════════════════════════╝
 *
 * Database doa — .doa <topik|id|keyword>
 *
 * @author Habibih Official ID
 * @source Habibih Cloud ID
 */

import { DOA, cariDoa, TOPIK } from '../../lib/doa.js'
import { sendText, sendImage } from '../../lib/api-helpers.js'

const handler = async (m, { conn, usedPrefix }) => {
  const p = usedPrefix || '.'
  const arg = (m.args || []).join(' ').trim()
  const q = arg.toLowerCase()

  // .doa random / tanpa argumen
  if (!q || q === 'random' || q === 'acak') {
    const d = DOA[Math.floor(Math.random() * DOA.length)]
    return sendText(
      conn,
      m,
`🤲 *${d.judul}*

${d.arab}

_${d.latin}_

💬 ${d.arti}
📚 ${d.sumber}`
    )
  }

  const hasil = cariDoa(q)

  if (!hasil.length) {
    return sendText(
      conn,
      m,
`🤲 Doa *"${arg}"* tidak ditemukan.

📂 *Kategori tersedia:*
${TOPIK.map((t) => `• ${t}`).join('\n')}

💡 Contoh: ${p}doa rezeki · ${p}doa sakit · ${p}doa random`
    )
  }

  // .doa rezeki -> tampilkan semua (maks 5)
  const daftar = hasil.slice(0, 5)
  const teks =
`🤲 *DOA — ${arg.toUpperCase()}* (${hasil.length} ditemukan)

` +
daftar
  .map(
    (d, i) =>
`━━━━━━━ *${i + 1}. ${d.judul}*
${d.arab}
_${d.latin}_
💬 ${d.arti}
📚 ${d.sumber}`
  )
  .join('\n\n')

  await sendText(conn, m, teks)
}

handler.command = /^(?:doa|doa2|uzziyah)$/i
handler.help = ['doa']
handler.tags = ['islam', 'doa', 'religious']
handler.category = 'islam'
handler.description = 'Doa harian dengan Arab, latin, dan arti'
handler.example = ['doa rezeki', 'doa sakit', 'doa random']
handler.limit = 1

export default handler
