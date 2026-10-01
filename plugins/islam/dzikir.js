/**
 * ╔══════════════════════════════════════════════╗
 * ║  ------ HABI AI --------                      ║
 * ║  WA Bot • by Habibih Official ID             ║
 * ╚══════════════════════════════════════════════╝
 *
 * Dzikir — hitungan dan waktu target.
 * .dzikir [nama|tARGET] [jumlah]
 *
 * @author Habibih Official ID
 * @source Habibih Cloud ID
 */

import { sendText } from '../../lib/api-helpers.js'

const ISTIGHFAR = {
  arab: '\u0623\u064e\u0633\u0674\u064e\u063a\u0652\u0641\u0650\u0631\u064f \u0627\u0644\u0644\u064e\u0651\u064e\u0647\u064e',
  latin: 'Astaghfirullah',
}

const SAYYIDUL = {
  arab: '\u0627\u0644\u0644\u064e\u0651\u064e\u0647\u064f\u0645\u064e \u0623\u064e\u0646\u0652\u062a\u064e \u0631\u064e\u0628\u0652\u0650\u064a\u064e \u0644\u064e\u0627 \u0625\u064e\u0644\u064e\u0647\u064e\u0627 \u0625\u064e\u0644\u0651\u064e\u0627 \u0623\u064e\u0646\u0652\u062a\u064e\u060c \u062e\u064e\u0644\u064e\u0642\u0652\u062a\u064e\u0646\u064e\u064a\u064e \u0648\u064e\u0623\u064e\u0646\u064e\u0627 \u0639\u064e\u0628\u0652\u062f\u064f\u0643\u064e',
  latin: 'Allahumma Anta Rabbi, la ilaha illa Anta, khalaqtani wa ana abduk',
}

const ALHAMDULILLAH = {
  arab: '\u0627\u0644\u0652\u0644\u064e\u0651\u064e\u062d\u064e\u0645\u0652\u062f\u064f \u0644\u0650\u0644\u0651\u064e\u0647\u0650',
  latin: 'Alhamdulillah',
}

const SUBHANALLAH = {
  arab: '\u0633\u064f\u0628\u0652\u062d\u064e\u0627\u0646\u064e \u0627\u0644\u0644\u064e\u0651\u064e\u0647\u0650',
  latin: 'Subhanallah',
}

const ALLAHUAKBAR = {
  arab: '\u0627\u0644\u0644\u064e\u0651\u064e\u0647\u064f \u0623\u064e\u0643\u0652\u0628\u064e\u0631\u064f',
  latin: 'Allahu Akbar',
}

/**
 * Target dzikir. Kunci ditulis tanpa tanda baca; pencarian dilakukan
 * lewat normalisasi di bawah sehingga ".dzikir setelah maghrib" tetap kena.
 */
const TARGET = {
  subuh: { label: 'Istighfar Subuh', emoji: '\uD83C\uDF15', waktu: 'setelah Sholat Subuh', target: 100, dzikir: ISTIGHFAR },
  dzuhur: { label: 'Istighfar Dzuhur', emoji: '\uD83C\uDF24', waktu: 'setelah Sholat Dzuhur', target: 100, dzikir: ISTIGHFAR },
  ashar: { label: 'Istighfar Ashar', emoji: '\uD83C\uDF07', waktu: 'setelah Sholat Ashar', target: 100, dzikir: ISTIGHFAR },
  maghrib: { label: 'Istighfar Maghrib', emoji: '\uD83C\uDF06', waktu: 'setelah Sholat Maghrib', target: 100, dzikir: ISTIGHFAR },
  isya: { label: 'Istighfar Isya', emoji: '\uD83C\uDF03', waktu: 'setelah Sholat Isya', target: 100, dzikir: ISTIGHFAR },
  tahmid: { label: 'Tahmid', emoji: '\uD83D\uDCFF', waktu: 'setiap selesai sholat', target: 33, dzikir: ALHAMDULILLAH },
  alhamdulillah: { label: 'Alhamdulillah', emoji: '\uD83D\uDCFF', waktu: 'setiap selesai sholat', target: 33, dzikir: ALHAMDULILLAH },
  subhanallah: { label: 'Subhanallah', emoji: '\uD83D\uDCFF', waktu: 'sepanjang waktu', target: 33, dzikir: SUBHANALLAH },
  allaahuakbar: { label: 'Allahu Akbar', emoji: '\uD83D\uDCFF', waktu: 'sepanjang waktu', target: 33, dzikir: ALLAHUAKBAR },
  sayyidul: { label: 'Sayyidul Istighfar', emoji: '\uD83E\uDDD2', waktu: 'setiap hari,(sebelum tidur)', target: 1, dzikir: SAYYIDUL },
}

/** Buang kata pengantar agar "setelah maghrib" == "maghrib". */
const KATA_PENGANTAR = ['setelah', 'sesudah', 'saat', 'sholat', 'salat', 'doa']

function normalisasi(q) {
  let s = String(q).toLowerCase().trim().replace(/[^a-z0-9\s]/g, ' ')
  const kata = s.split(/\s+/).filter(Boolean)
  const sisa = kata.filter((k) => !KATA_PENGANTAR.includes(k))
  return (sisa.length ? sisa : kata).join(' ')
}

const handler = async (m, { conn, usedPrefix }) => {
  const p = usedPrefix || '.'
  const mentah = (m.args || []).join(' ').trim()
  const q = normalisasi(mentah)

  if (!q) {
    return sendText(
      conn,
      m,
`\uD83D\uDCFF *DZIKIR \u2014 HABI*

Pilih target:
${Object.values(TARGET).map((v) => `\u2022 ${v.emoji} ${v.label} \u2014 ${v.target}x`).join('\n')}

\uD83D\uDCA1 Contoh:
${p}dzikir subuh
${p}dzikir setelah maghrib
${p}dzikir subhanallah`
    )
  }

  const t = TARGET[q]
  const jumlah = parseInt((mentah.match(/(\d+)\s*$/) || [])[1], 10)

  if (!t) {
    return sendText(
      conn,
      m,
`\uD83D\uDCFF Target *"${mentah}"* tidak dikenal.

\uD83D\uDCA1 Contoh: ${p}dzikir subuh \u00b7 ${p}dzikir setelah maghrib \u00b7 ${p}dzikir subhanallah 33`
    )
  }

  const n = jumlah && jumlah > 0 ? jumlah : t.target
  const z = t.dzikir
  const teks = Array.from({ length: Math.min(n, 33) }, () => `${z.arab}\n_${z.latin}_`).join('\n\n')

  await sendText(
    conn,
    m,
`${t.emoji} *DZIKIR \u2014 ${t.label}*
\u23F0 ${t.waktu}
\uD83D\uDD22 Target: ${n}x

${teks}${n > 33 ? `\n\n_(menampilkan 33 dari ${n} pengulangan)_` : ''}`
  )
}

handler.command = /^(?:dzikir|zikir|dzikr)$/i
handler.help = ['dzikir']
handler.tags = ['islam', 'dzikir', 'religious']
handler.category = 'islam'
handler.description = 'Dzikir dengan hitungan dan waktu target'
handler.example = ['dzikir subuh', 'dzikir setelah maghrib', 'dzikir subhanallah 33']
handler.limit = 1

export default handler
