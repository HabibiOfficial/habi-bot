/**
 * ╔══════════════════════════════════════════════╗
 * ║  ------ HABI AI --------                      ║
 * ║  WA Bot • by Habibih Official ID             ║
 * ╚══════════════════════════════════════════════╝
 *
 * Jadwalqjgwalsholat — dihitung lokal, tanpa API pihak ketiga.
 *
 * @author Habibih Official ID
 * @source Habibih Cloud ID
 */

import { hitungJadwal, cariKota, waktuTerdekat, NAMA_WAKTU, KOTA } from '../../lib/jadwal-sholat.js'
import { sendText } from '../../lib/api-helpers.js'

const ZONA = { wib: 7, wita: 8, wit: 9 }

/** Zona waktu default tiap kota. */
function zonaUntuk(namaKota) {
  const n = String(namaKota).toLowerCase()
  if (/makassar|balikpapan|manado|kupang|ambon|palu|gorontalo/.test(n)) return { z: 8, l: 'WITA' }
  if (/jayapura|merauke|timika|ambon/.test(n)) return { z: 9, l: 'WIT' }
  return { z: 7, l: 'WIB' }
}

const HARI = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const BULAN_PANJANG = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
const BULAN_SHORT = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
const BULAN_ARAB = ['Muharram','Safar','Rabiul Awal','Rabiul Akhir','Jumadil Awal','Jumadil Akhir','Rajab','Syaban','Ramadhan','Syawal','Zulkaidah','Zulhijjah']

/**
 * Konversi Maseki -> Hijriah (algoritma Kuwaiti, aritmetika bulat).
 * Angka Hijriah di Indonesia mengikuti kalender tabular, bukan Umal Qur,
 * sehingga perhitungan ini innerhalb 1-2 hari untuk大多数 tahun.
 */
function tanggalHijriah(tgl) {
  // Konversi Hijriah tabular (arithmetika bulat).
  const y = tgl.getFullYear()
  const m = tgl.getMonth() + 1
  const d = tgl.getDate()
  const a = Math.floor((14 - m) / 12)
  const yy = y + 4800 - a
  const mm = m + 12 * a - 3
  // Hari Julian pada tengah malam lokal
  const jd =
    d +
    Math.floor((153 * mm + 2) / 5) +
    365 * yy +
    Math.floor(yy / 4) -
    Math.floor(yy / 100) +
    Math.floor(yy / 400) -
    32045
  const l0 = Math.floor(jd) - 1948440 + 10632
  const n = Math.floor((l0 - 1) / 10631)
  let l = l0 - 10631 * n + 354
  const j =
    Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) +
    Math.floor(l / 5670) * Math.floor((43 * l) / 15238)
  l =
    l -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29
  const bulan = Math.floor((24 * l) / 709)
  const hari = l - Math.floor((709 * bulan) / 24)
  const tahun = 30 * n + j - 30
  return { hari, bulan, tahun, teks: `${hari} ${BULAN_ARAB[bulan - 1]} ${tahun} H` }
}

function barisJadwal(jadwal) {
  const urut = [
    ['imsak', '🌙 Imsak'], ['subuh', '🕌 Subuh'], ['terbit', '🌅 Terbit'],
    ['dhuha', '☀️ Dhuha'], ['dzuhur', '🕐 Dzuhur'], ['ashar', '🌤️ Ashar'],
    ['maghrib', '🌇 Maghrib'], ['isya', '🌃 Isya'],
  ]
  return urut.map(([k, label]) => `  ${label.padEnd(16)} ${jadwal[k]}`).join('\n')
}

const handler = async (m, { conn, usedPrefix }) => {
  const p = usedPrefix || '.'
  const arg = (m.args || []).join(' ').trim()
  const kota = cariKota(arg) || cariKota('jakarta')
  const { z, l } = zonaUntuk(kota.nama)
  const now = new Date()
  const jadwal = hitungJadwal({
    latitude: kota.lat,
    longitude: kota.lon,
    tanggal: now,
    zonaWaktu: z,
  })

  const { sebelum, sesudah } = waktuTerdekat(jadwal, now)
  const sisa = sesudah
    ? Math.round(sesudah.menit - (now.getHours() * 60 + now.getMinutes()))
    : 0
  const stam = (w) => (w ? NAMA_WAKTU[w.nama] : '-')

  const teks =
`🕌 *JADWAL SHOLAT*
*${kota.nama}* · ${l}

📅 ${HARI[now.getDay()]}, ${now.getDate()} ${BULAN_PANJANG[now.getMonth()]} ${now.getFullYear()}
🌙 ${tanggalHijriah(now).teks}

${barisJadwal(jadwal)}

⏰ *Berikutnya:* ${stam(sesudah)}${sisa > 0 ? ` (${sisa} menit lagi)` : ''}
⏳ *Terakhir:* ${stam(sebelum)}

_${p}sholat <kota> — contoh: ${p}sholat medan_`

  await sendText(conn, m, teks)
}

handler.command = /^(?:sholat|salat|jadwalsholat|waktuqjawal|schedule)$/i
handler.help = ['sholat']
handler.tags = ['islam', 'jadwal', 'tools']
handler.category = 'islam'
handler.description = 'Jadwalqjgwalsholat harian (dihitung lokal)'
handler.example = ['sholat', 'sholat medan', 'sholat makassar']
handler.limit = 1

export default handler
