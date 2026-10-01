/**
 * ╔══════════════════════════════════════════════╗
 * ║  ------ HABI AI --------                      ║
 * ║  WA Bot • by Habibih Official ID             ║
 * ╚══════════════════════════════════════════════╝
 *
 * Berita ringkas dari RSS publik.
 *
 * .berita               -> berita Indonesia terbaru
 * .berita ekonomi       -> kategori tertentu
 * .berita cari <kata>  -> cari judul berita
 * .berita kategori      -> daftar kategori
 *
 * @author Habibih Official ID
 * @source Habibih Cloud ID
 */

import { berita, FEED, KATEGORI_BERITA } from '../../lib/sumber-data.js'
import { sendText } from '../../lib/api-helpers.js'

const handler = async (m, { conn, usedPrefix }) => {
  const p = usedPrefix || '.'
  const arg = (m.args || []).join(' ').trim()
  const q = arg.toLowerCase()

  if (!q) {
    const list = await berita('indonesia', 8)
    return sendText(
      conn,
      m,
`📰 *BERITA TERBARU*
📡 ${FEED.indonesia.sumber}

${list.map((b, i) => `${i + 1}. *${b.judul}*`).join('\n')}

💡 ${p}berita <kategori> — kategori: ${KATEGORI_BERITA.slice(0, 6).join(', ')}...
💡 ${p}berita cari <kata>`
    )
  }

  if (q === 'kategori' || q === 'list') {
    return sendText(
      conn,
      m,
      `📂 *Kategori berita*

${KATEGORI_BERITA.map((k) => `• *${k}* — ${FEED[k].sumber}`).join('\n')}

💡 Contoh: ${p}berita ekonomi`
    )
  }

  /* ---- cari berita ---- */
  if (q.startsWith('cari') || q.startsWith('search')) {
    const kunci = arg.replace(/^(cari|search)\s*/i, '').trim()
    if (!kunci) {
      return sendText(conn, m, `🔍 Kata kunci apa?\n\n💡 Contoh: ${p}berita cari bmkg`)
    }

    const semua = await berita('indonesia', 20)
    const hasil = semua.filter((b) => b.judul.toLowerCase().includes(kunci.toLowerCase()))

    if (!hasil.length) {
      return sendText(
        conn,
        m,
        `🔍 Tidak ada berita dengan kata *"${kunci}"* di feed terbaru.

💡 Coba kata yang lebih umum, atau ${p}berita tanpa kategori.`
      )
    }

    return sendText(
      conn,
      m,
      `🔍 *"${kunci}"* — ${hasil.length} hasil

${hasil.map((b, i) => `${i + 1}. *${b.judul}*`).join('\n')}

📡 ${FEED.indonesia.sumber}`
    )
  }

  /* ---- kategori ---- */
  const kategori = FEED[q] ? q : q.replace(/^rss\s*/, '')
  if (!FEED[kategori]) {
    const list = await berita('indonesia', 8)
    return sendText(
      conn,
      m,
`📰 *BERITA TERBARU*
📡 ${FEED.indonesia.sumber}

${list.map((b, i) => `${i + 1}. *${b.judul}*`).join('\n')}

⚠️ Kategori *"${arg}"* tidak dikenal.
💡 Kategori: ${KATEGORI_BERITA.join(', ')}`
    )
  }

  const list = await berita(kategori, 8)
  if (!list.length) {
    return sendText(
      conn,
      m,
      `📭 Feed *${FEED[kategori].nama}* sedang kosong atau tidak dapat diakses.\n\n💡 Coba: ${p}berita indonesia`
    )
  }

  return sendText(
    conn,
    m,
`📰 *BERITA ${FEED[kategori].nama.toUpperCase()}*
📡 ${FEED[kategori].sumber}

${list.map((b, i) => `${i + 1}. *${b.judul}*`).join('\n')}

💡 ${p}berita cari <kata>`
  )
}

handler.command = /^(?:berita|rss|news2|beritateks)$/i
handler.help = ['berita']
handler.tags = ['info', 'berita', 'news']
handler.category = 'info'
handler.description = 'Berita terbaru format ringkas'
handler.example = ['berita', 'berita ekonomi', 'berita bola', 'berita cari bmkg']
handler.limit = 1
handler.custom = true

export default handler
