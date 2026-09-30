/**
 * ╔══════════════════════════════════════════════╗
 * ║  ------ HABI AI --------                      ║
 * ║  WA Bot • by Habibih Official ID             ║
 * ╚══════════════════════════════════════════════╝
 *
 * @author Habibih Official ID
 * @website habibi-store.pages.dev
 * @wa  wa.me/6285181576338
 * @source Habibih Cloud ID - No Comot, No Ganti Nama
 *
 *Ekstensi: perintah gambar dari REST API Habibih Cloud ID.
 *
 * Cara pakai — tulis %nama di teks mana pun:
 *   %iqc Halo dunia        → screenshot chat iPhone
 *   %quote Halo             → sama seperti %iqc
 *   %reply Jalan crur       → fake balasan chat
 *   %welcome Budi           → kartu sambutan
 *   %meme Teks atas         → meme
 *   %brat HAI               → gambar brat
 */

import { COMMANDS } from '../../lib/habi-api.js'

const react = async (conn, m, emoji) => {
  try {
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.raw.key } })
  } catch { /* react sometimes fails on old clients, just ignore it */ }
}

const handler = async (m, { conn }) => {
  const text = String(m.text || '').trim()
  if (!text) {
    return conn.sendMessage(m.chat, {
      text: '❌ Tulis perintahnya, contoh: *%iqc Halo dunia*',
    }, { quoted: m.raw })
  }

  const match = text.match(/%([a-z0-9_]+)/i)
  const name = match?.[1]?.toLowerCase()
  const fn = COMMANDS[name]

  if (!fn) {
    const list = Object.keys(COMMANDS).map(k => `%${k}`).join(', ')
    return conn.sendMessage(m.chat, {
      text: `❌ Perintah "%${name}" tidak dikenal.\n\nYang tersedia: *${list}*`,
    }, { quoted: m.raw })
  }

  // Sisanya jadi isi teks yang dikirim ke API
  const content = text.replace(/%[a-z0-9_]+/i, '').trim() || 'Halo dunia'

  await react(conn, m, '⏳')
  try {
    const buffer = await fn(content)

    await conn.sendMessage(m.chat, {
      image: buffer,
      mimetype: 'image/png',
      caption: `🎨 *%${name}*\n\`%${name} ${content}\``,
      url: undefined,
    }, { quoted: m.raw })

    await react(conn, m, '✅')
  } catch (error) {
    await react(conn, m, '❌')
    await conn.sendMessage(m.chat, {
      text: `❌ Gagal memanggil API.\n\n${error?.message || 'Terjadi kesalahan.'}\n\n_Pasti HABI API lagi nggak bisa dihubungi._`,
    }, { quoted: m.raw })
  }
}

handler.command = /^(?:api|imggen)\s+(.+)$/is
handler.help = ['api']
handler.tags = ['api', 'tools', 'image']
handler.category = 'api'
handler.description = 'Panggil REST API HABI (contoh: .api %iqc Halo)'

export default handler
