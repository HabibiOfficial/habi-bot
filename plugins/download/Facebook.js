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
import { ytDlpDownloadBest } from '../../lib/ytdlp.js'

const MAX_VIDEO = 100 * 1024 * 1024

const API_URL = 'https://gateway.gencipta.com/api/downloader/facebook'
// Diambil dari .env — jangan pernah ditulis langsung di sini.
// Kalau kosong, plugin ini dilewati dan bot pakai fallback lain.
const API_KEY = process.env.HABI_FACEBOOK_KEY || ''

async function react(conn, m, emoji) {
  try {
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.raw.key } })
  } catch {}
}

function isFacebookUrl(url) {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '')
    return host === 'facebook.com' || host === 'm.facebook.com' || host === 'fb.watch'
  } catch {
    return false
  }
}

function findMediaUrls(data) {
  const results = []
  const videoKeys = [
    'video', 'video_url', 'videoUrl', 'url', 'hd', 'hd_url', 'hdUrl', 
    'sd', 'sd_url', 'sdUrl', 'download_url', 'downloadUrl', 'media_url', 'mediaUrl'
  ]
  const imageKeys = [
    'image', 'image_url', 'imageUrl', 'photo', 'photo_url', 'photoUrl', 'thumbnail', 'cover'
  ]

  function scan(obj, depth = 0) {
    if (!obj || depth > 8) return

    if (typeof obj === 'string') {
      if (/^https?:\/\//i.test(obj) && (/\.(mp4|m4v|webm|mov)(\?|$)/i.test(obj) || /video/i.test(obj))) {
        results.push({ type: 'video', url: obj })
      } else if (/^https?:\/\//i.test(obj) && (/\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(obj) || /image/i.test(obj))) {
        results.push({ type: 'image', url: obj })
      }
      return
    }
    
    if (Array.isArray(obj)) {
      for (const item of obj) scan(item, depth + 1)
      return
    }

    if (typeof obj === 'object') {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string' && /^https?:\/\//i.test(value)) {
          const lower = key.toLowerCase()
          if (videoKeys.some(k => lower === k.toLowerCase())) {
            results.push({ type: 'video', url: value })
            continue
          }
          if (imageKeys.some(k => lower === k.toLowerCase())) {
            results.push({ type: 'image', url: value })
            continue
          }
        }
        scan(value, depth + 1)
      }
    }
  }

  scan(data)

  const unique = []
  const seen = new Set()
  for (const item of results) {
    if (!item.url || seen.has(item.url)) continue
    seen.add(item.url)
    unique.push(item)
  }

  unique.sort((a, b) => {
    if (a.type === 'video' && b.type !== 'video') return -1
    if (a.type !== 'video' && b.type === 'video') return 1
    return 0
  })

  return unique
}

async function downloadMedia(url) {
  const media = await fetchBuffer(url, {
    timeout: 120000,
    maxBytes: 100 * 1024 * 1024,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 Chrome/140.0.0.0 Mobile Safari/537.36',
      Accept: '*/*',
      Referer: 'https://www.facebook.com/'
    }
  })

  return {
    buffer: media.buffer,
    contentType: media.contentType || ''
  }
}

const handler = async (m, { conn, usedPrefix }) => {
  const input = m.text?.trim()

  if (!input) {
    return conn.sendMessage(m.chat, {
      text: `❌ Masukkan link Facebook!\n\nContoh:\n${usedPrefix}fb https://www.facebook.com/share/v/xxxxx/`
    }, { quoted: m.raw })
  }

  if (!isFacebookUrl(input)) {
    return conn.sendMessage(m.chat, { text: '❌ Link tersebut bukan link Facebook.' }, { quoted: m.raw })
  }

  await react(conn, m, '⏳')

  let ytDlpFile = null
  try {
    ytDlpFile = await ytDlpDownloadBest(input, MAX_VIDEO, { prefix: 'qiro-fb' })
  } catch (ytDlpError) {
    console.log(`  \x1b[33m⚠\x1b[0m  yt-dlp tidak dapat digunakan untuk Facebook: ${ytDlpError.message}`)
  }

  if (ytDlpFile) {
    try {
      await conn.sendMessage(m.chat, {
        video: { url: ytDlpFile },
        mimetype: 'video/mp4',
        caption: '🎬 Facebook'
      }, { quoted: m.raw })
      await react(conn, m, '✅')
      return
    } catch (sendError) {
      console.error('[HABI FACEBOOK YTDLP SEND]', sendError)
    } finally {
      await fs.remove(ytDlpFile).catch(() => {})
    }
  }

  if (!API_KEY) {
    await react(conn, m, '❌')
    return conn.sendMessage(m.chat, { text: '❌ Gagal mendownload Facebook (yt-dlp gagal, dan API cadangan belum diset).' }, { quoted: m.raw })
  }

  try {
    // Tanpa key, lewati gateway — jalur lain yang menangani.
    if (!API_KEY) throw new Error('HABI_FACEBOOK_KEY belum diisi di .env')

    const apiUrl = `${API_URL}?url=${encodeURIComponent(input)}`
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`,
        'User-Agent': 'Mozilla/5.0'
      }
    })

    if (!response.ok) {
      let detail = ''
      try { detail = await response.text() } catch {}
      throw new Error(`API HTTP ${response.status}${detail ? ` - ${detail.slice(0, 300)}` : ''}`)
    }

    const result = await response.json()
    console.log('[HABI FACEBOOK API]', JSON.stringify(result, null, 2))

    if (result?.status === false || result?.success === false) {
      throw new Error(result?.message || result?.error || 'API gagal mengambil Facebook.')
    }

    const media = findMediaUrls(result)
    if (!media.length) {
      throw new Error('URL media tidak ditemukan pada response API.')
    }

    const title = result.title || result.caption || result.description || 'Facebook'
    let sent = false

    for (let i = 0; i < media.length; i++) {
      const item = media[i]
      try {
        const downloaded = await downloadMedia(item.url)
        const contentType = downloaded.contentType.toLowerCase()

        if (item.type === 'video' || contentType.includes('video')) {
          await conn.sendMessage(m.chat, {
            video: downloaded.buffer,
            mimetype: contentType.includes('mp4') ? 'video/mp4' : 'video/mp4',
            caption: sent ? '' : `🎬 ${title}`
          }, { quoted: m.raw })
          sent = true
          break
        }

        if (item.type === 'image' || contentType.includes('image')) {
          await conn.sendMessage(m.chat, {
            image: downloaded.buffer,
            mimetype: contentType || 'image/jpeg',
            caption: sent ? '' : `🖼️ ${title}`
          }, { quoted: m.raw })
          sent = true
          break
        }
      } catch (mediaError) {
        console.error('[HABI FACEBOOK MEDIA]', mediaError)
        continue
      }
    }

    if (!sent) {
      throw new Error('Media ditemukan tetapi gagal didownload.')
    }

    await react(conn, m, '✅')

  } catch (error) {
    console.error('[HABI FACEBOOK]', error)
    await react(conn, m, '❌')
    await conn.sendMessage(m.chat, {
      text: `❌ Gagal mendownload Facebook.\n\nError: ${error.message}`
    }, { quoted: m.raw })
  }
}

handler.command = /^(fb|facebook|fbdl|fbdown)$/i
handler.help = ['fb', 'facebook', 'fbdl']
handler.tags = ['download']
handler.description = 'Download video dan media Facebook'

export default handler
