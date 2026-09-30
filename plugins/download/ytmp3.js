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
import { ytDlpExtractAudio } from '../../lib/ytdlp.js'

const MAX_AUDIO = 100 * 1024 * 1024

const API_URL = 'https://gateway.gencipta.com/api/downloader/ytmp3'
// Diambil dari .env — jangan pernah ditulis langsung di sini.
// Kalau kosong, plugin ini dilewati dan bot pakai fallback lain.
const API_KEY = process.env.HABI_YTMP3_KEY || ''

async function react(conn, m, emoji) {
  try {
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.raw.key } })
  } catch {}
}

function sanitizeFilename(name) {
  return String(name || 'youtube')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100) || 'youtube'
}

const handler = async (m, { conn, usedPrefix }) => {
  const input = m.text?.trim()

  if (!input) {
    return conn.sendMessage(m.chat, {
      text: `❌ Masukkan link YouTube!\n\nContoh:\n${usedPrefix}ytmp3 https://youtu.be/xxxxx`
    }, { quoted: m.raw })
  }

  let parsed
  try {
    parsed = new URL(input)
  } catch {
    return conn.sendMessage(m.chat, { text: '❌ URL YouTube tidak valid.' }, { quoted: m.raw })
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '')
  const valid = hostname === 'youtube.com' || hostname === 'youtu.be' || hostname === 'm.youtube.com'

  if (!valid) {
    return conn.sendMessage(m.chat, { text: '❌ Link tersebut bukan link YouTube.' }, { quoted: m.raw })
  }

  await react(conn, m, '⏳')

  let ytDlpFile = null
  try {
    ytDlpFile = await ytDlpExtractAudio(input, MAX_AUDIO, { prefix: 'qiro-ytmp3' })
  } catch (ytDlpError) {
    console.log(`  \x1b[33m⚠\x1b[0m  yt-dlp tidak dapat digunakan untuk ytmp3: ${ytDlpError.message}`)
  }

  if (ytDlpFile) {
    try {
      await conn.sendMessage(m.chat, {
        audio: { url: ytDlpFile },
        mimetype: 'audio/mpeg',
        fileName: 'youtube.mp3',
        ptt: false
      }, { quoted: m.raw })
      await react(conn, m, '✅')
      return
    } catch (sendError) {
      console.error('[HABI YTMP3 YTDLP SEND]', sendError)
    } finally {
      await fs.remove(ytDlpFile).catch(() => {})
    }
  }

  if (!API_KEY) {
    await react(conn, m, '❌')
    return conn.sendMessage(m.chat, { text: '❌ Gagal mendownload YouTube (yt-dlp gagal, dan API cadangan belum diset).' }, { quoted: m.raw })
  }

  try {
    // Tanpa key, lewati gateway — jalur lain yang menangani.
    if (!API_KEY) throw new Error('HABI_YTMP3_KEY belum diisi di .env')

    const endpoint = `${API_URL}?url=${encodeURIComponent(input)}`
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`,
        'User-Agent': 'Mozilla/5.0'
      }
    })

    if (!response.ok) {
      let errorText = ''
      try { errorText = await response.text() } catch {}
      throw new Error(`API HTTP ${response.status}${errorText ? ` - ${errorText.slice(0, 300)}` : ''}`)
    }

    const result = await response.json()
    console.log('[HABI YTMP3]', result)

    if (result?.status !== true) {
      throw new Error(result?.error || result?.message || 'API gagal memproses YouTube.')
    }

    const audioUrl = result.output
    if (!audioUrl || typeof audioUrl !== 'string') {
      throw new Error('URL audio tidak ditemukan pada output API.')
    }

    const audioResponse = await fetchBuffer(audioUrl, {
      timeout: 120000,
      maxBytes: MAX_AUDIO,
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'audio/mpeg,audio/*,*/*'
      }
    })

    const audioBuffer = audioResponse.buffer
    if (!audioBuffer.length) {
      throw new Error('File MP3 kosong.')
    }

    const title = result.title || 'YouTube Audio'

    await conn.sendMessage(m.chat, {
      audio: audioBuffer,
      mimetype: 'audio/mpeg',
      fileName: `${sanitizeFilename(title)}.mp3`,
      ptt: false
    }, { quoted: m.raw })

    await react(conn, m, '✅')

  } catch (error) {
    console.error('[HABI YTMP3 ERROR]', error)
    await react(conn, m, '❌')
    await conn.sendMessage(m.chat, {
      text: `❌ Gagal mendownload YouTube.\n\nError: ${error.message}`
    }, { quoted: m.raw })
  }
}

handler.command = /^(ytmp3|yta|ytmusic|ytmp3dl)$/i
handler.help = ['ytmp3', 'yta']
handler.tags = ['download']
handler.description = 'Download audio YouTube MP3'

export default handler
