/**
 * ╔══════════════════════════════════════════════╗
 * ║  ------ HABI AI --------                      ║
 * ║  WA Bot • by Habibih Official ID             ║
 * ╚══════════════════════════════════════════════╝
 *
 * Scheduler info: auto-alert gempa dan ringkasan cuaca harian.
 *
 * - Gempa: cek tiap 60 detik, kirim bila ada gempa baru >= ambang chat
 * - Cuaca: kirim ringkasan tiap pagi pukul 05.30 WIB
 *
 * @author Habibih Official ID
 * @source Habibih Cloud ID
 */

import { gempaTerkini, cuacaADM4 } from './sumber-data.js'
import { cariKodeKota } from './kode-wilayah.js'

/** ID gempa yang sudah pernah dikirim, supaya tidak dobel. */
const sudahTerkirim = new Set()
let cacheGempa = { waktu: 0, list: [] }

/** Kunci unik satu gempa. */
function kunciGempa(g) {
  return `${g.tanggal}|${g.jam}|${g.magnitudo}|${(g.wilayah || '').slice(0, 30)}`
}

function formatGempaRingkas(g) {
  const tsunami = /tsunami/i.test(g.potensi || '')
  return (
`🌐 *GEMPA M${g.magnitudo}*
🕐 ${g.tanggalWaktu}

📍 ${g.wilayah}
⬇️ Kedalaman: ${g.kedalaman}
⚠️ ${g.potensi}${tsunami ? '\n🚨 *_PERINGATAN TSUNAMI - hindari pantai!_*' : ''}${g.dirasakan ? `\n👥 ${g.dirasakan}` : ''}

_Sumber: BMKG_`
  )
}

/**
 * Ambil gempa M5.0+ terbaru, di-cache supaya tidak memanggil BMKG tiap detik.
 */
async function gempaBaru() {
  const sekarang = Date.now()
  if (sekarang - cacheGempa.waktu < 55_000 && cacheGempa.list.length) return cacheGempa.list
 cacheGempa = { waktu: sekarang, list: await gempaTerkini(15) }
  return cacheGempa.list
}

function ikonCuaca(c) {
  const s = String(c || '')
  if (/Cerah Berawan/.test(s)) return '⛅'
  if (/Cerah/.test(s)) return '☀️'
  if (/Hujan Petir|Badai/.test(s)) return '⛈️'
  if (/Hujan Sedang|Hujan Lebat/.test(s)) return '🌧️'
  if (/Hujan/.test(s)) return '🌦️'
  if (/Kabut|Asap|Debu/.test(s)) return '🌫️'
  if (/Berawan/.test(s)) return '☁️'
  return '🌡️'
}

/** Ringkasan satu hari untuk pesan pagi. */
function ringkasCuaca(data) {
  const hari = data.harian[0]
  if (!hari) return null
  const p = hari.periode[0] || {}
  return (
`🌤️ *CUACA HARI INI*
📍 ${data.kotkab} · ${data.kecamatan}
📅 ${hari.tanggal}

${ikonCuaca(p.cuaca)} ${hari.suhuMin}–${hari.suhuMax}°C
${hari.periode.slice(0, 4).map((x) => `${ikonCuaca(x.cuaca)} ${x.jam} ${x.suhu}°C`).join('\n')}

_Sumber: BMKG_`
  )
}

/**
 * Mulai scheduler info.
 * @param {object} conn
 * @param {Map} pengaturanGempa
 * @param {Map} pengaturanCuaca
 * @param {object} helper { kirimTeks }
 */
export function mulaiSchedulerInfo(conn, pengaturanGempa, pengaturanCuaca, helper) {
  const kirim = async (chat, teks) => {
    try {
      await helper.kirimTeks(chat, teks)
    } catch (err) {
      console.error(`  \x1b[31m✗\x1b[0m  Gagal kirim info ke ${chat}: ${err.message}`)
    }
  }

  /* ---------- gempa ---------- */
  const cekGempa = async () => {
    const aktif = [...(pengaturanGempa || new Map())].filter(([, s]) => s && s.aktif)
    if (!aktif.length) return

    let list
    try {
      list = await gempaBaru()
    } catch {
      return
    }

    for (const g of list) {
      const k = kunciGempa(g)
      if (sudahTerkirim.has(k)) continue

      // Tandai sebagai terkirim supaya chat yang baru aktif tidak dapat spam lama
      const perluKirim = aktif.filter(([, s]) => g.magnitudo >= s.magnitudo)
      sudahTerkirim.add(k)
      if (!perluKirim.length) continue

      const teks = formatGempaRingkas(g)
      for (const [chat] of perluKirim) await kirim(chat, teks)
    }

    // Jaga cache tetap kecil
    if (sudahTerkirim.size > 300) {
      const arr = [...sudahTerkirim]
      sudahTerkirim.clear()
      for (const k of arr.slice(-150)) sudahTerkirim.add(k)
    }
  }

  /* ---------- cuaca pagi ---------- */
  let tanggalTerkirim = ''
  const cekCuaca = async () => {
    const aktif = [...(pengaturanCuaca || new Map())].filter(([, s]) => s && s.aktif)
    if (!aktif.length) return

    // 05.30 WIB
    const now = new Date()
    const wib = new Date(now.getTime() + (7 * 60 + now.getTimezoneOffset()) * 60000)
    const jam = wib.getUTCHours() * 60 + wib.getUTCMinutes()
    if (jam < 330 || jam > 390) return

    const hariIni = wib.toISOString().slice(0, 10)
    if (tanggalTerkirim === hariIni) return
    tanggalTerkirim = hariIni

    for (const [chat, s] of aktif) {
      const k = cariKodeKota(s.kota) || cariKodeKota('jakarta')
      try {
        const data = await cuacaADM4(k.adm4, 1800)
        const teks = ringkasCuaca(data)
        if (teks) await kirim(chat, teks)
      } catch {
        /* diamkan, coba lagi besok */
      }
    }
  }

  const timer = setInterval(() => {
    cekGempa().catch(() => {})
    cekCuaca().catch(() => {})
  }, 60_000)

  timer.unref?.()
  cekGempa().catch(() => {})
  cekCuaca().catch(() => {})

  return timer
}

export function resetCacheScheduler() {
  sudahTerkirim.clear()
 cacheGempa = { waktu: 0, list: [] }
}

export default { mulaiSchedulerInfo, resetCacheScheduler }
