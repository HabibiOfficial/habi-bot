/**
 * ╔══════════════════════════════════════════════╗
 * ║  ------ HABI AI --------                      ║
 * ║  WA Bot • by Habibih Official ID             ║
 * ╚══════════════════════════════════════════════╝
 *
 * Adzan — kirim audio adzan atau teks adzan.
 *
 * .adzan              -> teks adzan
 * .adzan audio        -> file audio (dari assets/adzan/)
 * .adzan jakarta      -> adzan kota tersebut
 * .adzan on/off       -> aktifkan/matikan adzan otomatis per grup
 *
 * @author Habibih Official ID
 * @source Habibih Cloud ID
 */

import { adzanLokal, daftarAdzan } from '../../lib/adzan.js'
import { hitungJadwal, cariKota } from '../../lib/jadwal-sholat.js'
import { sendText, sendAudio } from '../../lib/api-helpers.js'

/** Penyimpanan status adzan per chat (di luar file agar ringan). */
const status = new Map()

function zonaUntuk(namaKota) {
  const n = String(namaKota).toLowerCase()
  if (/makassar|balikpapan|manado|kupang|palu|gorontalo/.test(n)) return 8
  if (/jayapura|merauke|timika|ambon/.test(n)) return 9
  return 7
}

const TEKS_ADZAN = `اَللّٰهُ أَكْبَرُ · اَللّٰهُ أَكْبَرُ
اَللّٰهُ أَكْبَرُ · اَللّٰهُ أَكْبَرُ
اَللّٰهُ أَكْبَرُ · اَللّٰهُ أَكْبَرُ

اَللّٰهُ أَكْبَرُ · اَللّٰهُ أَكْبَرُ
اَللّٰهُ أَكْبَرُ · اَللّٰهُ أَكْبَرُ
اَللّٰهُ أَكْبَرُ · اَللّٰهُ أَكْبَرُ

لَا إِلٰهَ إِلَّا اللّٰهُ · لَا إِلٰهَ إِلَّا اللّٰهُ
لَا إِلٰهَ إِلَّا اللّٰهُ · لَا إِلٰهَ إِلَّا اللّٰهُ

اَللّٰهُ أَكْبَرُ · اَللّٰهُ أَكْبَرُ
اَللّٰهُ أَكْبَرُ · اَللّٰهُ أَكْبَرُ
مَا شَاءَ اللّٰهُ · لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ

اَللّٰهُ أَكْبَرُ · اَللّٰهُ أَكْبَرُ
اَللّٰهُ أَكْبَرُ · اَللّٰهُ أَكْبَرُ
لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ`

function jadwalKota(nama) {
  const kota = cariKota(nama) || cariKota('jakarta')
  return {
    kota,
    jadwal: hitungJadwal({
      latitude: kota.lat,
      longitude: kota.lon,
      tanggal: new Date(),
      zonaWaktu: zonaUntuk(kota.nama),
    }),
  }
}

const handler = async (m, { conn, usedPrefix }) => {
  const p = usedPrefix || '.'
  const chat = m.chat || m.from
  const arg = (m.args || []).join(' ').trim()
  const q = arg.toLowerCase()
  const { kota, jadwal } = jadwalKota(arg.replace(/^(audio|suara|mp3)\s*/i, ''))

  // .adzan on / off
  if (q === 'on' || q === 'off') {
    status.set(chat, q === 'on')
    return sendText(
      conn,
      m,
      q === 'on'
        ? `🔔 Adzan otomatis *AKTIF* di chat ini.\nBot akan mengirim pengingat saat masuk waktu adzan.`
        : `🔕 Adzan otomatis *NONAKTIF* di chat ini.`
    )
  }

  // .adzan list
  if (q === 'list' || q === 'daftar') {
    const files = await daftarAdzan()
    return sendText(
      conn,
      m,
      files.length
        ? `🎧 *Audio adzan tersedia:*\n${files.map((f) => `• ${f}`).join('\n')}\n\nKetik: ${p}adzan audio`
        : `🎧 Belum ada file audio adzan di server.\n\nKetik ${p}adzan untuk mendapat teks adzan.`
    )
  }

  // .adzan audio / .adzan <kota> -> coba file lokal
  const mauAudio = /^(audio|suara|mp3|voice)$/i.test(q) || Boolean(arg && !/^(on|off|list|daftar)$/i.test(q))
  if (mauAudio) {
    const variasi = arg.replace(/^(audio|suara|mp3|voice)\s*/i, '').trim()
    const lokal = await adzanLokal(variasi)
    if (lokal) {
      await sendAudio(
        conn,
        m,
        lokal.buffer,
        `🕌 *ADZAN — ${kota.nama}*\n\n${TEKS_ADZAN}`
      )
      return
    }
    return sendText(
      conn,
      m,
`🕌 *ADZAN — ${kota.nama}*

File audio untuk "${variasi || 'nasional'}" belum tersedia di server.
Inilah teks adzannya:

${TEKS_ADZAN}

💡 Admin bisa menambah file di: assets/adzan/adzan-${(variasi || 'nasional').toLowerCase()}.mp3`
    )
  }

  // .adzan -> teks + jadwal
  const now = new Date()
  await sendText(
    conn,
    m,
`🕌 *ADZAN — ${kota.nama}*
📅 ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} · ${kota.nama}

${TEKS_ADZAN}

⏰ *Waktu adzan hari ini:*
  Maghrib ${jadwal.maghrib} · Isya ${jadwal.isya}
  Dzuhur ${jadwal.dzuhur} · Subuh ${jadwal.subuh}

💡 ${p}adzan audio — kirim file audio adzan
💡 ${p}adzan list — lihat file yang tersedia
💡 ${p}adzan on — aktifkan pengingat otomatis`
  )
}

handler.command = /^(?:adzan|adhan|azan|azhan)$/i
handler.help = ['adzan']
handler.tags = ['islam', 'adzan', 'religious']
handler.category = 'islam'
handler.description = 'Kirim adzan teks atau audio'
handler.example = ['adzan', 'adzan audio', 'adzan jakarta', 'adzan list', 'adzan on']
handler.limit = 1

export default handler
