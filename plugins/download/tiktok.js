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
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { spawn } from 'node:child_process'
import { ytDlpDownloadBest, getFfmpegBinPath } from '../../lib/ytdlp.js'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'
const MAX_VIDEO = 95 * 1024 * 1024

const API_URL = 'https://gateway.gencipta.com/api/downloader/tiktok'
// Diambil dari .env — jangan pernah ditulis langsung di sini.
// Kalau kosong, plugin ini dilewati dan bot pakai fallback lain.
const API_KEY = process.env.HABI_TIKTOK_KEY || ''

async function fetchWithTimeout(url, options = {}) {
  const { timeoutMs = 20000, ...rest } = options
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, { ...rest, signal: controller.signal })
  } catch (e) {
    if (e?.name === 'AbortError') throw new Error('Permintaan timeout, coba lagi.')
    throw e
  } finally {
    clearTimeout(timer)
  }
}

function tempBase() {
  return path.join(os.tmpdir(), `qiro-tt-${Date.now()}-${crypto.randomBytes(5).toString('hex')}`)
}

async function writeTemp(buffer, ext = 'mp4') {
  const file = `${tempBase()}.${ext}`
  await fs.writeFile(file, buffer)
  return file
}

async function ffmpegBin() {
  const installerPath = await getFfmpegBinPath()
  return installerPath || 'ffmpeg'
}

async function ytDlpDownload(url, max) {
  const file = await ytDlpDownloadBest(url, max, { prefix: 'qiro-tt' })
  return { file, title: null }
}

function jsonFromScript(html, id) {
  const re = new RegExp(`<script[^>]*id=["']${id}["'][^>]*>([\\s\\S]*?)<\\/script>`, 'i')
  const match = html.match(re)
  if (!match) return null

  try {
    return JSON.parse(match[1])
  } catch {
    return null
  }
}

function findVideoItem(json) {
  const modern = json?.__DEFAULT_SCOPE__?.['webapp.video-detail']?.itemInfo?.itemStruct
  if (modern) return modern

  const legacy = json?.ItemModule
  if (legacy) {
    const first = Object.values(legacy)[0]
    if (first) return first
  }

  return null
}

async function directScrape(inputUrl) {
  const r = await fetchWithTimeout(inputUrl, {
    headers: {
      'User-Agent': UA,
      'Accept-Language': 'en-US,en;q=0.9',
    },
  })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)

  const html = await r.text()
  const json = jsonFromScript(html, '__UNIVERSAL_DATA_FOR_REHYDRATION__') || jsonFromScript(html, 'SIGI_STATE')
  if (!json) throw new Error('Halaman TikTok tidak terbaca.')

  const item = findVideoItem(json)
  if (!item) throw new Error('Data video TikTok tidak ditemukan.')

  const playUrl = item?.video?.playAddr
    || item?.video?.downloadAddr
    || item?.video?.bitrateInfo?.[0]?.PlayAddr?.UrlList?.[0]

  if (!playUrl) throw new Error('URL video TikTok tidak ditemukan.')

  return { url: playUrl, title: item?.desc || null }
}

async function tikwmDownload(inputUrl) {
  const r = await fetchWithTimeout(`https://www.tikwm.com/api/?url=${encodeURIComponent(inputUrl)}&hd=1`, {
    headers: { 'User-Agent': UA },
  })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)

  const json = await r.json()
  if (json?.code !== 0 || !json?.data) throw new Error('tikwm tidak mengembalikan data.')

  const playUrl = json.data.hdplay || json.data.play
  if (!playUrl) throw new Error('URL video dari tikwm tidak ditemukan.')

  const full = playUrl.startsWith('http') ? playUrl : `https://www.tikwm.com${playUrl}`
  return { url: full, title: json.data.title || null }
}

async function gencipta(inputUrl) {
  // Tanpa key, lewati saja — biar resolver lain yang menangani.
  if (!API_KEY) throw new Error('HABI_TIKTOK_KEY belum diisi di .env')

  const endpoint = `${API_URL}?url=${encodeURIComponent(inputUrl)}`
  const response = await fetchWithTimeout(endpoint, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      Accept: 'application/json',
      'User-Agent': UA,
    },
  })

  if (!response.ok) throw new Error(`API HTTP ${response.status}`)
  const result = await response.json()

  if (!result || result.status !== true) throw new Error('API tidak mengembalikan data TikTok.')

  const data = Array.isArray(result.data) ? result.data : []
  const hdVideo = data.find(item => item?.type === 'nowatermark_hd' && item?.url)
  const normalVideo = data.find(item => item?.type === 'nowatermark' && item?.url)
  const videoUrl = hdVideo?.url || normalVideo?.url

  if (!videoUrl) throw new Error('Video No-Watermark tidak ditemukan.')

  return { url: videoUrl, title: result.title || null }
}

async function urlToFile(resolver, inputUrl, max) {
  const { url, title } = await resolver(inputUrl)

  const r = await fetchWithTimeout(url, {
    redirect: 'follow',
    headers: {
      'User-Agent': UA,
      Accept: 'video/mp4,video/*,*/*',
      Referer: 'https://www.tiktok.com/',
    },
    timeoutMs: 45000,
  })
  if (!r.ok) throw new Error(`Video HTTP ${r.status}`)

  const size = Number(r.headers.get('content-length') || 0)
  if (size && size > max) throw new Error('Ukuran video terlalu besar.')

  const buf = Buffer.from(await r.arrayBuffer())
  if (buf.length > max) throw new Error('Ukuran video terlalu besar.')

  const file = await writeTemp(buf)
  return { file, title }
}

async function resolveTikTokFile(inputUrl, max) {
  try {
    return await ytDlpDownload(inputUrl, max)
  } catch {}

  try {
    return await urlToFile(directScrape, inputUrl, max)
  } catch {}

  try {
    return await urlToFile(tikwmDownload, inputUrl, max)
  } catch {}

  return urlToFile(gencipta, inputUrl, max)
}

async function extractAudio(filePath) {
  const bin = await ffmpegBin()

  return new Promise((resolve, reject) => {
    const ffmpeg = spawn(bin, [
      '-hide_banner', '-loglevel', 'error',
      '-i', filePath,
      '-vn', 
      '-c:a', 'libmp3lame',
      '-b:a', '128k',
      '-f', 'mp3',
      'pipe:1'
    ], { stdio: ['ignore', 'pipe', 'pipe'] })

    const chunks = []
    const errors = []

    ffmpeg.stdout.on('data', chunk => chunks.push(chunk))
    ffmpeg.stderr.on('data', chunk => errors.push(chunk))

    ffmpeg.on('error', error => reject(new Error(`FFmpeg tidak tersedia: ${error.message}`)))
    ffmpeg.on('close', code => {
      if (code !== 0) {
        return reject(new Error(`FFmpeg gagal: ${Buffer.concat(errors).toString().trim() || `exit code ${code}`}`))
      }
      resolve(Buffer.concat(chunks))
    })
  })
}

async function react(conn, m, emoji) {
  try {
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.raw.key } })
  } catch (error) {
    console.error('[REACTION ERROR]', error)
  }
}

function sanitizeFilename(name) {
  return String(name).replace(/[<>:"/\\|?*\x00-\x1F]/g, '').replace(/\s+/g, ' ').trim().slice(0, 100) || 'tiktok'
}

const handler = async (m, { conn, usedPrefix }) => {
  const input = m.text?.trim()

  if (!input) {
    return conn.sendMessage(m.chat, {
      text: `❌ Masukkan link TikTok!\n\nContoh:\n${usedPrefix}tiktok https://vt.tiktok.com/xxxxx`
    }, { quoted: m.raw })
  }

  let parsedUrl
  try {
    parsedUrl = new URL(input)
  } catch {
    return conn.sendMessage(m.chat, { text: '❌ URL TikTok tidak valid.' }, { quoted: m.raw })
  }

  const allowedHosts = ['tiktok.com', 'www.tiktok.com', 'vt.tiktok.com', 'vm.tiktok.com', 'm.tiktok.com']
  if (!allowedHosts.includes(parsedUrl.hostname)) {
    return conn.sendMessage(m.chat, { text: '❌ Link tersebut bukan link TikTok.' }, { quoted: m.raw })
  }
  await react(conn, m, '⏳')

  let videoFile = null

  try {
    const resolved = await resolveTikTokFile(input, MAX_VIDEO)
    videoFile = resolved.file
    const title = resolved.title || 'TikTok Video'

    await conn.sendMessage(m.chat, {
      video: { url: videoFile },
      mimetype: 'video/mp4',
      caption: `🎬 ${title}\n\n✅ HD No Watermark`
    }, { quoted: m.raw })

    try {
      const audioBuffer = await extractAudio(videoFile)
      if (audioBuffer?.length) {
        await conn.sendMessage(m.chat, {
          audio: audioBuffer,
          mimetype: 'audio/mpeg',
          fileName: `${sanitizeFilename(title)}.mp3`,
          ptt: false
        }, { quoted: m.raw })
      }
    } catch (audioError) {
      console.error('[HABI TIKTOK AUDIO]', audioError)
    }

    await react(conn, m, '✅')

  } catch (error) {
    console.error('[HABI TIKTOK ERROR]', error)
    await react(conn, m, '❌')
    await conn.sendMessage(m.chat, {
      text: `❌ Gagal mendownload TikTok.\n\nError: ${error.message}`
    }, { quoted: m.raw })
  } finally {
    if (videoFile) await fs.remove(videoFile).catch(() => {})
  }
}

handler.command = /^(tiktok|tt|ttdl)$/i
handler.help = ['tiktok', 'tt', 'ttdl']
handler.tags = ['download']
handler.description = 'Download TikTok HD No Watermark + Auto Audio'

export default handler
