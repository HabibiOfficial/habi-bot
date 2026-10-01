/**
 * ╔══════════════════════════════════════════════╗
 * ║  ------ HABI AI --------                      ║
 * ║  WA Bot • by Habibih Official ID             ║
 * ╚══════════════════════════════════════════════╝
 *
 * Cuaca dari BMKG.
 *
 * .cuaca                 ->_default: Jakarta
 * .cuaca serang          -> cuaca Serang
 * .cuaca sekarang        -> hanya kondisi saat ini
 * .cuaca on [kota]       -> kirim ringkasan tiap pagi
 * .cuaca off|status
 *
 * @author Habibih Official ID
 * @source Habibih Cloud ID
 */

import { cuacaADM4 } from '../../lib/sumber-data.js'
import { cariKodeKota, DAFTAR_KOTA_CUACA, KODE_KOTA } from '../../lib/kode-wilayah.js'
import { sendText } from '../../lib/api-helpers.js'

/** Pengaturan harian per chat. */
const pengaturan = new Map()

function ambil(chat) {
  if (!pengaturan.has(chat)) pengaturan.set(chat, { aktif: false, kota: 'jakarta' })
  return pengaturan.get(chat)
}

export function semuaPengaturan() {
  return pengaturan
}

const ICON = {
  'Cerah': '☀️',
  'Cerah Berawan': '⛅',
  'Berawan': '☁️',
  'Berawan Tebal': '☁️',
  'Hujan Ringan': '🌦️',
  'Hujan Sedang': '🌧️',
  'Hujan Lebat': '🌧️',
  'Hujan Local': '🌦️',
  'Hujan Petir': '⛈️',
  'Kabut': '🌫️',
  'Asap': '🌫️',
  'Debu': '🌫️',
  'Salju': '❄️',
  'Badai': '⛈️',
}

function ikon(cuaca) {
  const k = String(cuaca || '')
  for (const [nama, e] of Object.entries(ICON)) {
    if (k.includes(nama)) return e
  }
  return '🌡️'
}

/** Ambil periode yang paling dekat dengan sekarang. */
function periodeSekarang(harian) {
  const now = new Date()
  const jamNow = now.getHours() * 60 + now.getMinutes()
  let terbaik = null
  let selisihTerbaik = Infinity

  for (const hari of harian) {
    for (const p of hari.periode) {
      const [j, m] = p.jam.split(':').map(Number)
      const menit = (Number.isNaN(j) ? 0 : j) * 60 + (Number.isNaN(m) ? 0 : m)
      const selisih = Math.abs(menit - jamNow)
      if (selisih < selisihTerbaik) {
        selisihTerbaik = selisih
        terbaik = { ...p, tanggal: hari.tanggal }
      }
    }
  }
  return terbaik
}

function ringkasHarian(hari) {
  const baris = hari.periode.map((p) => `${ikon(p.cuaca)} ${p.jam} ${p.suhu}°C ${p.cuaca}`)
  return `${hari.tanggal}  ${hari.suhuMin}–${hari.suhuMax}°C\n${baris.join('\n')}`
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
    return sendText(conn, m, `🔕 Pengingat cuaca *NONAKTIF* di chat ini.`)
  }

  if (q === 'status') {
    const k = cariKodeKota(setelan.kota)
    return sendText(
      conn,
      m,
      `⚙️ *Pengingat cuaca*

🔔 Status : ${setelan.aktif ? 'AKTIF' : 'NONAKTIF'}
📍 Kota   : ${k ? k.nama : setelan.kota}
🕐 Dikirim: tiap pagi 05.30 WIB

💡 Ganti  : ${p}cuaca on makassar
💡 Matikan: ${p}cuaca off`
    )
  }

  if (q === 'on' || q === 'aktif' || /^on\s+/.test(q)) {
    const kota = q.replace(/^on\s*/, '').trim()
    if (kota) {
      const k = cariKodeKota(kota)
      if (!k) {
        return sendText(
          conn,
          m,
          `📍 Kota *"${kota}"* tidak dikenal untuk cuaca.

💡 Contoh: ${p}cuaca on serang · ${p}cuaca on makassar`
        )
      }
      const kunci = Object.keys(KODE_KOTA).find((kk) => KODE_KOTA[kk]?.adm4 === k.adm4)
      setelan.kota = kunci || k.nama.toLowerCase()
    }
    setelan.aktif = true
    const k = cariKodeKota(setelan.kota) || cariKodeKota('jakarta')
    return sendText(
      conn,
      m,
      `🔔 Pengingat cuaca *AKTIF* di chat ini.

📍 Kota: *${k.nama}*
🕐 Dikirim tiap pagi 05.30 WIB
📐 Kode wilayah ${k.adm4}

💡 Ganti  : ${p}cuaca on <kota>
💡 Matikan: ${p}cuaca off`
    )
  }

  /* ---- tentukan kota ---- */
  let namaKota = q
  if (namaKota === 'sekarang' || namaKota === 'saat ini' || namaKota === 'now') {
    namaKota = setelan.kota
  }

  const kode = cariKodeKota(namaKota)
  if (!kode) {
    return sendText(
      conn,
      m,
      `📍 Kota *"${namaKota || '(kosong)'}"* belum didukung.

🏙️ Kota yang tersedia:
${[...new Set(DAFTAR_KOTA_CUACA.map((k) => k.nama))].join(', ')}

💡 Contoh: ${p}cuaca serang`
    )
  }

  const data = await cuacaADM4(kode.adm4)

  /* ---- hanya kondisi sekarang ---- */
  if (q === 'sekarang' || q === 'saat ini' || q === 'now') {
    const s = periodeSekarang(data.harian)
    if (!s) return sendText(conn, m, `📭 Data cuaca tidak tersedia.`)
    return sendText(
      conn,
      m,
      `${ikon(s.cuaca)} *CUACA SEKARANG*
📍 ${data.kotkab} · ${data.kecamatan}
🕐 ${s.tanggal} ${s.jam} WIB

${s.cuaca}
🌡️ Suhu       : ${s.suhu}°C
💧 Kelembapan : ${s.kelembapan}%
💨 Angin      : ${s.angin} km/j dari ${s.arahAngin}

_Sumber: BMKG_`
    )
  }

  /* ---- prakiraan 3 hari ---- */
  const blok = data.harian.map((h) => ringkasHarian(h)).join('\n\n')

  await sendText(
    conn,
    m,
`🌤️ *PRAKIRAAN CUACA*
📍 ${data.kotkab} · ${data.kecamatan}
📐 ${data.lat.toFixed(3)}, ${data.lon.toFixed(3)}

${blok}

💡 ${p}cuaca <kota> — contoh ${p}cuaca makassar
💡 ${p}cuaca sekarang — kondisi saat ini
💡 ${p}cuaca on <kota> — pengingat tiap pagi

_Sumber: BMKG_`
  )
}

handler.command = /^(?:cuaca|weather|panas|dingin)$/i
handler.help = ['cuaca']
handler.tags = ['info', 'cuaca']
handler.category = 'info'
handler.description = 'Prakiraan cuaca dari BMKG'
handler.example = ['cuaca', 'cuaca serang', 'cuaca sekarang', 'cuaca on makassar']
handler.limit = 1
handler.custom = true

export default handler
