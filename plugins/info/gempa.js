/**
 * ╔══════════════════════════════════════════════╗
 * ║  ------ HABI AI --------                      ║
 * ║  WA Bot • by Habibih Official ID             ║
 * ╚══════════════════════════════════════════════╝
 *
 * Gempa bumi dari BMKG.
 *
 * .gempa            -> gempa terbaru
 * .gempa 5          -> 5 gempa M5.0+ terakhir
 * .gempa dirasakan -> gempa yang dirasakan masyarakat
 * .gempa shakemap   -> peta guncangan (MMI) gambar
 * .gempa on [mag]   -> otomatis kirim jika gempa >= magnitudo
 * .gempa off|status
 *
 * @author Habibih Official ID
 * @source Habibih Cloud ID
 */

import {
  gempaTerbaru,
  gempaTerkini,
  gempaDirasakan,
  ambilShakemap,
} from '../../lib/sumber-data.js'
import { sendText, sendImage, fail } from '../../lib/api-helpers.js'

/** Pengaturan auto-alert per chat. */
const pengaturan = new Map()

function ambil(chat) {
  if (!pengaturan.has(chat)) pengaturan.set(chat, { aktif: false, magnitudo: 5 })
  return pengaturan.get(chat)
}

export function semuaPengaturan() {
  return pengaturan
}

const EMOJI_M = ['🟢', '🟡', '🟠', '🔴', '🟣']

function warnaMagnitudo(m) {
  if (m < 4) return EMOJI_M[0]
  if (m < 5) return EMOJI_M[1]
  if (m < 6) return EMOJI_M[2]
  if (m < 7) return EMOJI_M[3]
  return EMOJI_M[4]
}

function barisGempa(g, i) {
  const nomor = i != null ? `${i}. ` : ''
  const tsunami = /tsunami/i.test(g.potensi || '') ? ' ⚠️ *PERHATIAN TSUNAMI*' : ''
  return (
    `${nomor}${warnaMagnitudo(g.magnitudo)} *M${g.magnitudo}* · ${g.tanggalWaktu}\n` +
    `   📍 ${g.wilayah}\n` +
    `   ⬇️ Kedalaman ${g.kedalaman}` +
    (g.dirasakan ? `\n   👥 ${g.dirasakan}` : '') +
    `${tsunami}`
  )
}

const handler = async (m, { conn, usedPrefix }) => {
  const p = usedPrefix || '.'
  const chat = m.chat || m.from
  const arg = (m.args || []).join(' ').trim()
  const q = arg.toLowerCase()
  const setelan = ambil(chat)

  /* ---- pengaturan ---- */
  if (q === 'off' || q === 'matikan') {
    setelan.aktif = false
    return sendText(conn, m, `🔕 Auto-alert gempa *NONAKTIF* di chat ini.`)
  }

  if (q === 'status') {
    return sendText(
      conn,
      m,
      `⚙️ *Auto-alert gempa*

🔔 Status   : ${setelan.aktif ? 'AKTIF' : 'NONAKTIF'}
🔻 Batas   : M${setelan.magnitudo}+

💡 Aktifkan: ${p}gempa on 5
💡 Matikan : ${p}gempa off`
    )
  }

  if (q === 'on' || q === 'aktif' || /^on\s+[\d.]+$/.test(q)) {
    const angka = parseFloat((q.match(/([\d.]+)\s*$/) || [])[1])
    setelan.aktif = true
    if (!Number.isNaN(angka)) setelan.magnitudo = angka
    return sendText(
      conn,
      m,
      `🔔 Auto-alert gempa *AKTIF* di chat ini.

🔻 Dikirim jika magnitudo **M${setelan.magnitudo}+**
⚡ Dicek tiap 60 detik

💡 Ganti batas : ${p}gempa on 6
💡 Matikan     : ${p}gempa off`
    )
  }

  /* ---- shakemap ---- */
  if (q === 'shakemap' || q === 'peta' || q === 'mmi') {
    const g = await gempaTerbaru()
    if (!g.shakemap) {
      return sendText(conn, m, `🗺️ Gempa terakhir belum memiliki peta guncangan.`)
    }
    const buf = await ambilShakemap(g.shakemap)
    if (!buf) {
      return sendText(conn, m, `🗺️ Peta guncangan gagal dimuat dari server BMKG.\nCoba lagi nanti.`)
    }
    return sendImage(
      conn,
      m,
      buf,
      `🗺️ *SHAKEMAP (MMI)*
💥 M${g.magnitudo} · ${g.tanggalWaktu}
📍 ${g.wilayah}
👥 ${g.dirasakan || '-'}
📐 ${g.koordinat}

_Sumber: BMKG_`
    )
  }

  /* ---- gempa dirasakan ---- */
  if (q === 'dirasakan' || q === 'dirasakan') {
    const list = await gempaDirasakan(10)
    if (!list.length) {
      return sendText(conn, m, `✅ Tidak ada gempa dirasakan dalam 15 kejadian terakhir.`)
    }
    return sendText(
      conn,
      m,
      `🌐 *GEMPA DIRASAKAN* (${list.length} kejadian)\n\n` +
        list.map((g, i) => barisGempa(g, i + 1)).join('\n\n') +
        `\n\n_Sumber: BMKG_`
    )
  }

  /* ---- daftar ---- */
  if (/^\d+$/.test(q)) {
    const list = await gempaTerkini(Math.min(parseInt(q, 10), 15))
    if (!list.length) {
      return sendText(conn, m, `✅ Tidak ada gempa M5.0+ tercatat.`)
    }
    return sendText(
      conn,
      m,
      `📋 *GEMPA TERKINI M5.0+* (${list.length} kejadian)\n\n` +
        list.map((g, i) => barisGempa(g, i + 1)).join('\n\n') +
        `\n\n_Sumber: BMKG_`
    )
  }

  /* ---- default: gempa terbaru ---- */
  const g = await gempaTerbaru()
  const tsunami = /tsunami/i.test(g.potensi || '')

  await sendText(
    conn,
    m,
`${warnaMagnitudo(g.magnitudo)} *GEMPA TERKINI*
💥 *Magnitudo M${g.magnitudo}*
🕐 ${g.tanggalWaktu}

📍 *Wilayah*
${g.wilayah}

📐 *Detail*
⬇️ Kedalaman : ${g.kedalaman}
🧭 Koordinat : ${g.koordinat}
🌐 ${g.lintang}, ${g.bujur}

⚠️ *Potensi*
${g.potensi}${tsunami ? '\n\n🚨 *_PERHATIAN: berpotensi tsunami, hindari pantai!_*' : ''}${g.dirasakan ? `\n\n👥 *Dirasakan*\n${g.dirasakan}` : ''}

💡 ${p}gempa 5 · ${p}gempa dirasakan · ${p}gempa shakemap
💡 ${p}gempa on 5 — auto-alert M5+

_Sumber: BMKG_`
  )
}

handler.command = /^(?:gempa|gempaBumi|earthquake|eq)$/i
handler.help = ['gempa']
handler.tags = ['info', 'gempa', 'bencana']
handler.category = 'info'
handler.description = 'Info gempa bumi terbaru dari BMKG'
handler.example = ['gempa', 'gempa 5', 'gempa dirasakan', 'gempa shakemap', 'gempa on 5']
handler.limit = 1
handler.custom = true

export default handler
