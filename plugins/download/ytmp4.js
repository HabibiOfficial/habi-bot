/**
 * ╔══════════════
 * ║  ------ HABI AI --------
 * ║ WA Bot • by Habibih Official ID   
 * ╚══════════════
 * 
 * @author Habibih Official ID
 * @website habibi-store.pages.dev
 * @wa  wa.me/6285181576338
 * @source Habibih Cloud ID - No Comot, No Ganti Nama
 */

import fs from 'fs-extra'
import { fetchBuffer } from '../../lib/http.js'
import { ytDlpDownloadVideo } from '../../lib/ytdlp.js'

const MAX_VIDEO = 200 * 1024 * 1024
const API_URL = 'https://api-faa.my.id/faa/ytmp4'

async function react(conn, m, emoji) {
  try {
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.raw.key } })
  } catch {}
}

function isYoutubeUrl(url) {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '')
    return host === 'youtube.com' || host === 'youtu.be' || host === 'm.youtube.com'
  } catch {
    return false
  }
}

async function downloadVideo(url) {
  const media = await fetchBuffer(url, {
    timeout: 180000,
    maxBytes: MAX_VIDEO,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 Chrome/140.0.0.0 Mobile Safari/537.36',
      Accept: 'video/mp4,video/*,*/*'
    }
  })

  return media.buffer
}

const handler = async (m, { conn, usedPrefix }) => {
  const input = m.text?.trim()

  if (!input) {
    return conn.sendMessage(m.chat, {
      text: `❌ Masukkan link YouTube!\n\nContoh:\n${usedPrefix}ytmp4 https://youtu.be/xxxxx`
    }, { quoted: m.raw })
  }

  if (!isYoutubeUrl(input)) {
    return conn.sendMessage(m.chat, { text: '❌ Link tersebut bukan link YouTube.' }, { quoted: m.raw })
  }

  await react(conn, m, '⏳')

  let ytDlpFile = null
  try {
    ytDlpFile = await ytDlpDownloadVideo(input, MAX_VIDEO, { prefix: 'qiro-ytmp4', maxHeight: 720 })
  } catch (ytDlpError) {
    console.log(`  \x1b[33m⚠\x1b[0m  yt-dlp tidak dapat digunakan untuk ytmp4: ${ytDlpError.message}`)
  }

  if (ytDlpFile) {
    try {
      await conn.sendMessage(m.chat, {
        video: { url: ytDlpFile },
        mimetype: 'video/mp4',
        fileName: 'youtube.mp4'
      }, { quoted: m.raw })
      await react(conn, m, '✅')
      return
    } catch (sendError) {
      console.error('[HABI YTMP4 YTDLP SEND]', sendError)
    } finally {
      await fs.remove(ytDlpFile).catch(() => {})
    }
  }

  try {
    const apiUrl = `${API_URL}?url=${encodeURIComponent(input)}`
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0'
      }
    })

    if (!response.ok) {
      let errorText = ''
      try { errorText = await response.text() } catch {}
      throw new Error(`API HTTP ${response.status}${errorText ? ` - ${errorText.slice(0, 300)}` : ''}`)
    }

    const data = await response.json()
    console.log('[HABI YTMP4 API]', JSON.stringify(data, null, 2))

    if (data?.status !== true) {
      throw new Error(data?.message || data?.error || 'API gagal mengambil video.')
    }

    const downloadUrl = data?.result?.download_url
    if (!downloadUrl || typeof downloadUrl !== 'string') {
      throw new Error('Download URL tidak ditemukan pada response API.')
    }

    const video = await downloadVideo(downloadUrl)
    if (!video.length) {
      throw new Error('File video kosong.')
    }

    await conn.sendMessage(m.chat, {
      video,
      mimetype: 'video/mp4',
      fileName: 'youtube.mp4'
    }, { quoted: m.raw })

    await react(conn, m, '✅')

  } catch (error) {
    console.error('[HABI YTMP4 ERROR]', error)
    await react(conn, m, '❌')
    await conn.sendMessage(m.chat, {
      text: `❌ Gagal mendownload YouTube.\n\nError: ${error.message}`
    }, { quoted: m.raw })
  }
}

handler.command = /^(ytmp4|ytv|ytvideo|ytmp4dl)$/i
handler.help = ['ytmp4', 'ytv']
handler.tags = ['download']
handler.description = 'Download video YouTube MP4'

export default handler
