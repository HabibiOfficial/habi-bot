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
import { hitungJadwal, cariKota, zonaKota } from '../../lib/jadwal-sholat.js'
import { sendText, sendAudio } from '../../lib/api-helpers.js'

/**
 * Pengaturan adzan per chat: { aktif, kota, uid }
 * Kota disimpan terpisah dari status supaya bisa diganti kapan saja.
 */
const pengaturan = new Map()

function ambil(chat) {
  if (!pengaturan.has(chat)) pengaturan.set(chat, { aktif: false, kota: 'jakarta' })
  return pengaturan.get(chat)
}

export function semuaPengaturan() {
  return pengaturan
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
      zonaWaktu: zonaKota(kota).jam,
    }),
  }
}

const handler = async (m, { conn, usedPrefix }) => {
  const p = usedPrefix || '.'
  const chat = m.chat || m.from
  const arg = (m.args || []).join(' ').trim()
  const q = arg.toLowerCase()
  const setelan = ambil(chat)
  const argKota = arg.replace(/^(audio|suara|mp3|on|off|list|daftar|status)\s*/i, '')
  const { kota, jadwal } = jadwalKota(argKota || setelan.kota)

  // .adzan on [kota] / off / status
  if (/^(on|off|aktif|nonaktif|status)$/.test(q) || /^on\s+/.test(q)) {
    const s_ = ambil(chat)
    if (q === 'off' || q === 'nonaktif') {
      s_.aktif = false
      return sendText(
        conn,
        m,
        `🔕 Adzan otomatis *NONAKTIF* di chat ini.`
      )
    }

    if (q === 'status') {
      const k = cariKota(s_.kota) || cariKota('jakarta')
      return sendText(
        conn,
        m,
        `⚙️ *Pengaturan adzan chat ini*

🔔 Status : ${s_.aktif ? 'AKTIF' : 'NONAKTIF'}
📍 Kota   : ${k.nama} (${zonaKota(k).nama})
🕐 Jadwal: Subuh ${jadwal.subuh} · Dzuhur ${jadwal.dzuhur} · Ashar ${jadwal.ashar} · Maghrib ${jadwal.maghrib} · Isya ${jadwal.isya}

💡 Ubah kota: ${p}adzan on serang
💡 Matikan   : ${p}adzan off`
      )
    }

    // .adzan on [kota]
    const kotaBaru = q.replace(/^on\s*/, '').trim()
    if (kotaBaru) {
      const kt = cariKota(kotaBaru)
      if (!kt) {
        return sendText(
          conn,
          m,
          `📍 Kota *"${kotaBaru}"* tidak ditemukan.

💡 Contoh: ${p}adzan on serang · ${p}adzan on makassar · ${p}adzan on medan`
        )
      }
      s_.kota = kt.nama.toLowerCase()
    }

    s_.aktif = true
    const k = cariKota(s_.kota) || cariKota('jakarta')
    const z = zonaKota(k)

    return sendText(
      conn,
      m,
      `🔔 Adzan otomatis *AKTIF* di chat ini.

📍 Kota : *${k.nama}* (${z.nama})
🕐 Dikirim saat: Subuh ${jadwal.subuh} · Maghrib ${jadwal.maghrib} · Isya ${jadwal.isya}
📍 ${k.lat.toFixed(4)}, ${k.lon.toFixed(4)}

💡 Ganti kota: ${p}adzan on <kota>
💡 Cek     : ${p}adzan status
💡 Matikan : ${p}adzan off`
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
