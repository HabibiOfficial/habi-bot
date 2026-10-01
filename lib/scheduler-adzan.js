/**
 * ╔══════════════════════════════════════════════╗
 * ║  ------ HABI AI --------                      ║
 * ║  WA Bot • by Habibih Official ID             ║
 * ╚══════════════════════════════════════════════╝
 *
 * Scheduler adzan.
 *
 * Menjalankan pengingat adzan otomatis untuk setiap chat yang mengaktifkan
 * fitur ini lewat `.adzan on <kota>`.
 *
 * Cara kerja:
 * - Cek setiap 30 detik
 * - Untuk tiap chat aktif, hitung jadwal hari itu di kota yang disimpan
 * - Kirim pengingat saat waktu adzan masuk ( toleransi 2 menit, terkirim sekali)
 *
 * @author Habibih Official ID
 * @source Habibih Cloud ID
 */

import { hitungJadwal, cariKota, zonaKota, NAMA_WAKTU } from './jadwal-sholat.js'
import { adzanLokal } from './adzan.js'

/** Waktu adzan yang memicu pengingat. */
const WAKTU_ADZAN = ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya']

/** Toleransi menit agar tetap terkirim meski cek telat. */
const TOLERANSI = 2

/** Kunci unik agar tidak mengirim dua kali untuk waktu yang sama. */
const terkirim = new Set()

/** Ubah "19.01" menjadi menit sejak tengah malam. */
function keMenit(jam) {
  if (!jam || typeof jam !== 'string') return null
  const m = jam.match(/^(\d{1,2})[.](\d{2})$/)
  if (!m) return null
  return Number(m[1]) * 60 + Number(m[2])
}

/**
 * Chat mana saja yang perlu dikirimi adzan pada menit ini.
 * Fungsi murni supaya bisa diuji tanpa koneksi.
 *
 * @param {Map} pengaturan peta chat -> { aktif, kota }
 * @param {Date} sekarang
 * @returns {Array<{chat, kota, zona, waktu, jam}>}
 */
export function adzanTerjadwal(pengaturan, sekarang = new Date()) {
  const hasil = []

  for (const [chat, setelan] of pengaturan) {
    if (!setelan || !setelan.aktif) continue

    const kota = cariKota(setelan.kota) || cariKota('jakarta')
    if (!kota) continue

    const zona = zonaKota(kota)
    const jadwal = hitungJadwal({
      latitude: kota.lat,
      longitude: kota.lon,
      tanggal: sekarang,
      zonaWaktu: zona.jam,
    })

    // Hari berbeda tiap zona, jadi pakai tanggal lokal zona tersebut
    const tglZona = new Date(sekarang.getTime() + (zona.jam * 60 + sekarang.getTimezoneOffset()) * 60000)
    const hariIni = tglZona.toISOString().slice(0, 10)

    // Menit "sekarang" menurut zona kota tsb
    const menitZona =
      tglZona.getUTCHours() * 60 + tglZona.getUTCMinutes()

    for (const w of WAKTU_ADZAN) {
      const menit = keMenit(jadwal[w])
      if (menit == null) continue
      const selisih = menit - menitZona
      if (selisih < 0 || selisih > TOLERANSI) continue

      const kunci = `${chat}|${hariIni}|${w}`
      if (terkirim.has(kunci)) continue
      terkirim.add(kunci)

      hasil.push({
        chat,
        kota,
        zona,
        waktu: w,
        jam: jadwal[w],
        nama: NAMA_WAKTU[w],
      })
    }
  }
  return hasil
}

/** Bersihkan cache "sudah terkirim" yang sudah lewat 2 hari. */
function bersihkanCache() {
  if (terkirim.size < 500) return
  for (const k of terkirim) {
    const bagian = k.split('|')[1]
    const d = new Date(bagian)
    if (Number.isNaN(d.getTime()) || Date.now() - d.getTime() > 2 * 864e5) terkirim.delete(k)
  }
}

/** Reset cache — dipakai test. */
export function resetCache() {
  terkirim.clear()
}

/**
 * Mulai scheduler adzan.
 * @param {object} conn   socket Baileys
 * @param {Map} pengaturan peta chat -> { aktif, kota }
 * @param {object} helper  { kirimTeks, kirimAudio }
 */
export function mulaiSchedulerAdzan(conn, pengaturan, helper) {
  const jalankan = async () => {
    try {
      const daftar = adzanTerjadwal(pengaturan, new Date())
      for (const item of daftar) {
        const {
          chat, kota, zona, waktu, jam, nama,
        } = item

        const teks =
`🕌 *WAKTU ${String(nama || waktu).toUpperCase()}*
📍 ${kota.nama} (${zona.nama})
🕐 ${jam}

${zona.nama === 'WIB' ? 'WIB' : zona.nama} —derived dari koordinat ${kota.lat.toFixed(4)}, ${kota.lon.toFixed(4)}`

        try {
          const audio = await adzanLokal(kota.nama.toLowerCase())
          if (audio && helper.kirimAudio) {
            await helper.kirimAudio(chat, audio.buffer, teks)
            continue
          }
          await helper.kirimTeks(chat, teks)
        } catch (err) {
          console.error(`  \x1b[31m✗\x1b[0m  Gagal kirim adzan ke ${chat}: ${err.message}`)
        }
      }
      if (daftar.length) bersihkanCache()
    } catch (err) {
      console.error(`  \x1b[31m✗\x1b[0m  Scheduler adzan: ${err.message}`)
    }
  }

  const timer = setInterval(jalankan, 30_000)
  timer.unref?.()
  jalankan()
  return timer
}

export default { mulaiSchedulerAdzan, adzanTerjadwal, resetCache }
