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
 * Ambil URL media dari REST API HABI (TikTok, Facebook, IG, X, dll)
 * lalu kirim videonya ke chat.
 */

import { apiJson } from '../../lib/habi-api.js'

const react = async (conn, m, emoji) => {
  try {
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.raw.key } })
  } catch { /* ignore */ }
}

const handler = async (m, { conn }) => {
  const url = String(m.args?.[0] || m.text || '').trim().replace(/^https?:\/\//, '')

  if (!url) {
    return conn.sendMessage(m.chat, {
      text: '❌ Contoh: *.apiget https://www.tiktok.com/@user/video/ID*',
    }, { quoted: m.raw })
  }

  await react(conn, m, '⏳')

  let platform = '-'
  try {
    const detected = await apiJson('/api/detect', { url }).catch(() => null)
    platform = detected?.platform || '-'

    const media = await apiJson('/api/resolve', { url })

    const video = media.media?.video
    if (!video?.url) throw new Error('Tidak ada video yang bisa diambil dari link itu.')

    const size = video.size ? `${(video.size / 1048576).toFixed(1)} MB` : '?'
    const caption = [
      '╭───〔 🎬 MEDIA 〕',
      '│',
      `│ Judul    : ${String(media.title || '-').slice(0, 40)}`,
      `│ Platform : ${media.platform}`,
      `│ Sumber   : ${media.source}`,
      `│ Resolusi : ${video.width || '?'}×${video.height || '?'}`,
      `│ Ukuran   : ${size}`,
      '╰──────────────',
    ].join('\n')

    await conn.sendMessage(m.chat, {
      video: { url: video.url },
      mimetype: 'video/mp4',
      caption,
    }, { quoted: m.raw })

    await react(conn, m, '✅')
  } catch (error) {
    await react(conn, m, '❌')
    await conn.sendMessage(m.chat, {
      text: `❌ Gagal ambil media.\n\n${error?.message || 'Tidak diketahui'}\n\n_Platform : ${platform}_`,
    }, { quoted: m.raw })
  }
}

handler.command = /^(?:apiget|mediahub)$/i
handler.help = ['apiget']
handler.tags = ['api', 'download']
handler.category = 'api'
handler.description = 'Ambil video dari link TikTok/FB/IG/X lewat REST API HABI'

export default handler
