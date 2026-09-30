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
import path from 'path'
import os from 'os'
import crypto from 'crypto'
import { ButtonV2 } from '../../lib/tombol.js'
import { ytDlpExtractAudio, ytDlpDownloadVideo } from '../../lib/ytdlp.js'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36'
const YT = 'https://www.youtube.com'
const SEARCH = `${YT}/results?search_query=`
const WATCH = `${YT}/watch?v=`
const PLAYER = `${YT}/youtubei/v1/player`
const MAX_AUDIO = 55 * 1024 * 1024
const MAX_VIDEO = 95 * 1024 * 1024
const CACHE = new Map()

const TITLE_MAX = 34
const CHANNEL_MAX = 26

const RESOLVERS = [
  process.env.HABI_COBALT_URL,
  process.env.COBALT_API_URL,
].filter(Boolean).map(x => x.replace(/\/+$/, ''))

const API_KEY = process.env.HABI_DOWNLOADER_KEY || ''


const CLIENTS = [
  { clientName: 'TVHTML5', clientVersion: '7.20260114.18.00', hl: 'id', gl: 'ID' },
  { clientName: 'ANDROID', clientVersion: '20.10.38', androidSdkVersion: 35, hl: 'id', gl: 'ID' },
  { clientName: 'MWEB', clientVersion: '2.20260120.01.00', hl: 'id', gl: 'ID' },
  { clientName: 'WEB', clientVersion: '2.20260120.01.00', hl: 'id', gl: 'ID' },
]

const getCache = (key, ttl = 300000) => {
  const x = CACHE.get(key)
  if (!x || Date.now() - x.time > ttl) return null
  return x.value
}

const setCache = (key, value) => {
  CACHE.set(key, { time: Date.now(), value })
  return value
}

const clean = (v = '') => String(v)
  .replace(/\\u0026/g, '&')
  .replace(/\\u003d/g, '=')
  .replace(/\\u0027/g, "'")
  .replace(/\\u002f/g, '/')
  .replace(/&amp;/g, '&')
  .replace(/&#39;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/\s+/g, ' ')
  .trim()

const shortTitle = (v = '', max = TITLE_MAX) => {
  const x = clean(v)
  if (x.length <= max) return x

  const cut = x.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  const trimmed = lastSpace > max * 0.5 ? cut.slice(0, lastSpace) : cut

  return `${trimmed.trimEnd()}…`
}

const safeName = (v = '') => clean(v)
  .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
  .replace(/\s+/g, ' ')
  .slice(0, 100)
  .trim() || 'qiro-play'

const duration = v => {
  const n = Number(v)
  if (!n) return '-'
  const s = Math.floor(n), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}` : `${m}:${String(x).padStart(2, '0')}`
}

const viewCount = v => Number(v) > 0 ? Number(v).toLocaleString('id-ID') : '-'
const mime = v => String(v || '').split(';')[0].trim().toLowerCase()
const height = f => Number(f?.height || String(f?.qualityLabel || '').match(/\d+/)?.[0] || 0)

async function request(url, options = {}) {
  const { timeoutMs = 20000, ...fetchOptions } = options
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const r = await fetch(url, {
      redirect: 'follow',
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'User-Agent': UA,
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        ...(fetchOptions.headers || {}),
      },
    })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return r
  } catch (e) {
    if (e?.name === 'AbortError') throw new Error('Permintaan timeout, coba lagi.')
    throw e
  } finally {
    clearTimeout(timer)
  }
}

function jsonObject(src, marker) {
  const pos = src.indexOf(marker)
  if (pos < 0) return null
  const start = src.indexOf('{', pos)
  if (start < 0) return null

  let depth = 0, quote = false, escaped = false

  for (let i = start; i < src.length; i++) {
    const c = src[i]

    if (quote) {
      if (escaped) escaped = false
      else if (c === '\\') escaped = true
      else if (c === '"') quote = false
      continue
    }

    if (c === '"') {
      quote = true
      continue
    }

    if (c === '{') depth++

    if (c === '}' && --depth === 0) {
      try {
        return JSON.parse(src.slice(start, i + 1))
      } catch {
        return null
      }
    }
  }

  return null
}

async function youtubeConfig() {
  const cached = getCache('yt-config', 3600000)
  if (cached) return cached

  const r = await request(YT)
  const html = await r.text()

  const key = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1]
  const version = html.match(/"INNERTUBE_CLIENT_VERSION":"([^"]+)"/)?.[1]
  const visitor = html.match(/"VISITOR_DATA":"([^"]+)"/)?.[1]

  if (!key) throw new Error('YouTube InnerTube key tidak ditemukan.')

  return setCache('yt-config', {
    key,
    version: version || CLIENTS[0].clientVersion,
    visitorData: visitor || '',
  })
}

async function player(videoId, client) {
  const cfg = await youtubeConfig()

  const body = {
    context: {
      client: {
        ...client,
        clientVersion: client.clientName === 'WEB' ? cfg.version : client.clientVersion,
        visitorData: cfg.visitorData,
      },
    },
    videoId,
    contentCheckOk: true,
    racyCheckOk: true,
    playbackContext: {
      contentPlaybackContext: {
        html5Preference: 'HTML5_PREF_WANTS',
      },
    },
  }

  const r = await request(`${PLAYER}?key=${encodeURIComponent(cfg.key)}&prettyPrint=false`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: YT,
      Referer: `${WATCH}${videoId}`,
    },
    body: JSON.stringify(body),
  })

  return r.json()
}

function streamScore(data) {
  const sd = data?.streamingData
  if (!sd) return -1

  const all = [...(sd.formats || []), ...(sd.adaptiveFormats || [])]
  const direct = all.filter(f => f.url)
  const hasMuxed = direct.some(f => mime(f.mimeType).startsWith('video/') && (f.audioQuality || f.audioChannels))
  const hasAudioOnly = direct.some(f => mime(f.mimeType).startsWith('audio/'))

  return (hasMuxed ? 100 : 0) + (hasAudioOnly ? 50 : 0) + direct.length
}

async function getPlayer(videoId) {
  const cached = getCache(`player:${videoId}`, 180000)
  if (cached) return cached

  let best = null
  let bestScore = -1
  let last = 'Video tidak dapat diproses.'

  for (const client of CLIENTS) {
    try {
      const data = await player(videoId, client)

      if (data?.videoDetails) {
        const score = streamScore(data)

        if (score > bestScore) {
          bestScore = score
          best = data
        }

        if (bestScore >= 100) break
      } else {
        last = data?.playabilityStatus?.reason || last
      }
    } catch (e) {
      last = e.message || last
    }
  }

  if (best) return setCache(`player:${videoId}`, best)

  throw new Error(clean(last))
}

function walk(obj, fn, seen = new Set()) {
  if (!obj || typeof obj !== 'object' || seen.has(obj)) return
  seen.add(obj)
  fn(obj)
  for (const v of Array.isArray(obj) ? obj : Object.values(obj)) walk(v, fn, seen)
}

function searchResults(data) {
  const out = []
  const seen = new Set()

  walk(data, node => {
    const x = node?.videoRenderer
    if (!x?.videoId || seen.has(x.videoId)) return

    seen.add(x.videoId)

    out.push({
      videoId: x.videoId,
      title: clean(x.title?.runs?.map(a => a.text).join('') || x.title?.simpleText || 'Tanpa Judul'),
      channel: clean(x.ownerText?.runs?.map(a => a.text).join('') || x.ownerText?.simpleText || 'YouTube'),
      duration: clean(x.lengthText?.simpleText || '-'),
      views: clean(x.viewCountText?.simpleText || '-'),
      thumbnail: x.thumbnail?.thumbnails?.at(-1)?.url || `https://i.ytimg.com/vi/${x.videoId}/hqdefault.jpg`,
    })
  })

  return out
}

async function searchYouTube(query) {
  const key = `search:${query.toLowerCase()}`
  const cached = getCache(key, 600000)
  if (cached) return cached

  const r = await request(`${SEARCH}${encodeURIComponent(query)}&hl=id&gl=ID`)
  const html = await r.text()
  const data = jsonObject(html, 'ytInitialData = ') || jsonObject(html, 'ytInitialData')

  if (!data) throw new Error('Data pencarian YouTube tidak terbaca.')

  const result = searchResults(data)
  if (!result.length) throw new Error('Video tidak ditemukan.')

  return setCache(key, result.slice(0, 8))
}

function extractId(input) {
  if (/^[A-Za-z0-9_-]{11}$/.test(input)) return input

  try {
    const u = new URL(input)
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('/')[0]
    return u.searchParams.get('v')
  } catch {
    return null
  }
}

function info(player, fallback = {}) {
  const d = player?.videoDetails || {}

  return {
    videoId: d.videoId || fallback.videoId,
    title: clean(d.title || fallback.title || 'YouTube Video'),
    channel: clean(d.author || fallback.channel || 'YouTube'),
    duration: duration(d.lengthSeconds) !== '-' ? duration(d.lengthSeconds) : fallback.duration || '-',
    views: viewCount(d.viewCount) !== '-' ? viewCount(d.viewCount) : fallback.views || '-',
    thumbnail: d.thumbnail?.thumbnails?.at(-1)?.url || fallback.thumbnail || `https://i.ytimg.com/vi/${d.videoId || fallback.videoId}/hqdefault.jpg`,
  }
}

function footer(data) {
  return [
    '╭──────────',
    `│ Judul   : ${shortTitle(data.title)}`,
    `│ Channel : ${shortTitle(data.channel, CHANNEL_MAX)}`,
    `│ Durasi  : ${data.duration}`,
    `│ Views   : ${data.views}`,
    '╰──────────',
  ].join('\n')
}

function errorBox(message) {
  return [
    '╭──────────',
    '│ HABI PLAY',
    '├──────────',
    `│ ${shortTitle(message, 50)}`,
    '╰──────────',
  ].join('\n')
}

async function menu(m, conn, prefix, data) {
  const button = new ButtonV2(conn)
    .setTitle('HABI PLAY')
    .setSubtitle(shortTitle(data.channel, CHANNEL_MAX))
    .setBody('Pilih format download.')
    .setFooter(footer(data))
    .setThumbnail(data.thumbnail)

  button.addButton('DOWNLOAD AUDIO', `${prefix}playaudio ${data.videoId}`)
  button.addButton('DOWNLOAD VIDEO', `${prefix}playvideo ${data.videoId}`)

  await button.send(m.chat, { quoted: m.raw })
}

async function downloadWithYtDlp(data, type, max) {
  const source = `${WATCH}${data.videoId}`

  return type === 'audio'
    ? ytDlpExtractAudio(source, max, { prefix: 'qiro-play' })
    : ytDlpDownloadVideo(source, max, { prefix: 'qiro-play', maxHeight: 720 })
}

async function cobalt(url, type) {
  if (!RESOLVERS.length) return null

  for (const base of RESOLVERS) {
    try {
      const endpoint = base.endsWith('/api/json') ? base : `${base}/`

      const payload = type === 'audio'
        ? {
            url,
            audioFormat: 'mp3',
            audioBitrate: '128',
            downloadMode: 'audio',
            filenameStyle: 'basic',
          }
        : {
            url,
            videoQuality: '720',
            youtubeVideoCodec: 'h264',
            downloadMode: 'auto',
            filenameStyle: 'basic',
          }

      const r = await request(endpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(API_KEY ? { Authorization: `Api-Key ${API_KEY}` } : {}),
        },
        body: JSON.stringify(payload),
      })

      const data = await r.json()

      if (data?.status === 'tunnel' && data.url) return data
      if (data?.status === 'redirect' && data.url) return data
      if (data?.status === 'picker' && Array.isArray(data.picker) && data.picker[0]?.url) {
        return { ...data, url: data.picker[0].url }
      }
    } catch {}
  }

  return null
}

function directFormats(playerData) {
  const sd = playerData?.streamingData
  if (!sd) return []

  return [...(sd.formats || []), ...(sd.adaptiveFormats || [])].filter(f => f?.url)
}
function audioFormats(playerData) {
  return directFormats(playerData)
    .filter(f => mime(f.mimeType).startsWith('audio/'))
    .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))
}

function videoFormats(playerData) {
  const all = directFormats(playerData).filter(f => mime(f.mimeType).startsWith('video/'))
  if (!all.length) return []

  const muxed = all.filter(f => f.audioQuality || f.audioChannels)
  const pool = muxed.length ? muxed : all
  const desc = [...pool].sort((a, b) => height(b) - height(a))

  const ideal = desc.find(f => height(f) > 0 && height(f) <= 720)
  if (!ideal) return desc

  return [ideal, ...desc.filter(f => f !== ideal)]
}

async function buildCandidates(data, type) {
  const isAudio = type === 'audio'
  const source = `${WATCH}${data.videoId}`
  const list = []

  const external = await cobalt(source, type)
  if (external?.url) list.push({ url: external.url, needsTranscode: false })

  let playerData = getCache(`player:${data.videoId}`, 180000)
  if (!playerData) playerData = await getPlayer(data.videoId)

  const direct = isAudio ? audioFormats(playerData) : videoFormats(playerData)
  for (const f of direct.slice(0, 3)) {
    list.push({ url: f.url, needsTranscode: isAudio })
  }

  if (isAudio) {
    for (const f of videoFormats(playerData).slice(0, 2)) {
      list.push({ url: f.url, needsTranscode: true })
    }
  }

  return list
}

async function tryDownload(list, max) {
  let lastError = new Error('Semua sumber download gagal memproses video ini. Coba video lain atau ulangi beberapa saat lagi.')

  for (const candidate of list) {
    try {
      const buf = await download(candidate.url, max)
      return { buf, needsTranscode: candidate.needsTranscode }
    } catch (e) {
      lastError = e
    }
  }

  throw lastError
}

async function download(url, max) {
  const r = await request(url, {
    headers: {
      Referer: YT,
      Accept: '*/*',
      Range: 'bytes=0-',
    },
    timeoutMs: 45000,
  })

  const size = Number(r.headers.get('content-length') || 0)

  if (size && size > max) {
    throw new Error('Ukuran media terlalu besar.')
  }

  const data = Buffer.from(await r.arrayBuffer())

  if (data.length > max) {
    throw new Error('Ukuran media terlalu besar.')
  }

  return data
}

function tempPath(ext) {
  return path.join(
    os.tmpdir(),
    `qiro-${Date.now()}-${crypto.randomBytes(5).toString('hex')}.${ext}`,
  )
}

async function temp(buffer, ext) {
  const file = tempPath(ext)
  await fs.writeFile(file, buffer)
  return file
}

let ffmpegModule = null

async function loadFfmpeg() {
  if (ffmpegModule) return ffmpegModule

  try {
    const [{ default: ffmpeg }, { default: ffmpegInstaller }] = await Promise.all([
      import('fluent-ffmpeg'),
      import('@ffmpeg-installer/ffmpeg'),
    ])

    ffmpeg.setFfmpegPath(ffmpegInstaller.path)
    ffmpegModule = ffmpeg
    return ffmpeg
  } catch {
    throw new Error('Modul ffmpeg belum terpasang. Jalankan: npm install @ffmpeg-installer/ffmpeg fluent-ffmpeg')
  }
}

async function transcodeAudio(inputFile, outputFile) {
  const ffmpeg = await loadFfmpeg()

  return new Promise((resolve, reject) => {
    ffmpeg(inputFile)
      .noVideo()
      .audioCodec('libmp3lame')
      .audioBitrate('128k')
      .audioChannels(2)
      .format('mp3')
      .on('error', err => reject(new Error(`Gagal konversi audio: ${err.message}`)))
      .on('end', () => resolve(outputFile))
      .save(outputFile)
  })
}

async function sendMedia(m, conn, data, type) {
  const isAudio = type === 'audio'
  const max = isAudio ? MAX_AUDIO : MAX_VIDEO
  const cleanup = []
  let outFile = null

  try {
    outFile = await downloadWithYtDlp(data, type, max)
    cleanup.push(outFile)
  } catch (ytDlpError) {
    console.log(`  [33m⚠[0m  yt-dlp tidak dapat digunakan: ${ytDlpError.message}`)
    outFile = null
  }

  if (!outFile) {
    let list = await buildCandidates(data, type)
    if (!list.length) {
      throw new Error('Semua sumber download gagal memproses video ini. Coba video lain atau ulangi beberapa saat lagi.')
    }

    let result

    try {
      result = await tryDownload(list, max)
    } catch (firstError) {

      CACHE.delete(`player:${data.videoId}`)
      list = await buildCandidates(data, type)

      try {
        result = await tryDownload(list, max)
      } catch (finalError) {
        throw finalError.message === 'Ukuran media terlalu besar.'
          ? finalError
          : new Error('Semua sumber download gagal memproses video ini. Coba video lain atau ulangi beberapa saat lagi.')
      }
    }

    const { buf: raw, needsTranscode } = result
    const rawFile = await temp(raw, needsTranscode ? 'src' : (isAudio ? 'mp3' : 'mp4'))
    cleanup.push(rawFile)
    outFile = rawFile

    if (isAudio && needsTranscode) {
      const mp3File = tempPath('mp3')
      await transcodeAudio(rawFile, mp3File)
      cleanup.push(mp3File)
      outFile = mp3File
    }
  }

  try {
    if (isAudio) {
      await conn.sendMessage(
        m.chat,
        {
          audio: { url: outFile },
          mimetype: 'audio/mpeg',
          fileName: `${safeName(data.title)}.mp3`,
        },
        { quoted: m.raw },
      )
    } else {
      await conn.sendMessage(
        m.chat,
        {
          video: { url: outFile },
          mimetype: 'video/mp4',
          fileName: `${safeName(data.title)}.mp4`,
          caption: footer(data),
        },
        { quoted: m.raw },
      )
    }
  } finally {
    await Promise.all(cleanup.map(f => fs.remove(f).catch(() => {})))
  }
}

async function play(m, { conn, usedPrefix }) {
  const query = clean(m.text)

  if (!query) {
    return conn.sendMessage(
      m.chat,
      { text: errorBox(`Gunakan ${usedPrefix}play judul lagu.`) },
      { quoted: m.raw },
    )
  }

  try {
    await conn.sendMessage(
      m.chat,
      {
        text: [
          '╭──────────',
          '│ HABI PLAY',
          '├──────────',
          '│ Mencari video...',
          '╰──────────',
        ].join('\n'),
      },
      { quoted: m.raw },
    )

    const id = extractId(query)
    let data

    if (id) {
      data = info(await getPlayer(id), { videoId: id })
    } else {
      data = (await searchYouTube(query))[0]
    }

    if (!data?.videoId) throw new Error('Video tidak ditemukan.')

    setCache(`video:${data.videoId}`, data)
    await menu(m, conn, usedPrefix, data)
  } catch (e) {
    await conn.sendMessage(
      m.chat,
      { text: errorBox(e.message || 'Gagal mencari video.') },
      { quoted: m.raw },
    )
  }
}

async function action(m, { conn }, type) {
  const id = clean(m.args?.[0])

  if (!id) {
    return conn.sendMessage(
      m.chat,
      { text: errorBox('ID video tidak ditemukan.') },
      { quoted: m.raw },
    )
  }

  try {
    const cached = getCache(`video:${id}`, 600000)
    const data = cached || info(await getPlayer(id), { videoId: id })

    await conn.sendMessage(
      m.chat,
      {
        text: [
          '╭──────────',
          '│ HABI PLAY',
          '├──────────',
          `│ Menyiapkan ${type === 'audio' ? 'audio' : 'video'}...`,
          `│ ${shortTitle(data.title)}`,
          '╰──────────',
        ].join('\n'),
      },
      { quoted: m.raw },
    )

    await sendMedia(m, conn, data, type)
  } catch (e) {
    await conn.sendMessage(
      m.chat,
      { text: errorBox(e.message || `Gagal mengunduh ${type}.`) },
      { quoted: m.raw },
    )
  }
}

const handler = async (m, { conn, usedPrefix }) => {
  if (m.command === 'playaudio') return action(m, { conn }, 'audio')
  if (m.command === 'playvideo') return action(m, { conn }, 'video')
  return play(m, { conn, usedPrefix })
}

handler.command = /^(play|playaudio|playvideo)$/i
handler.help = ['play']
handler.tags = ['download']
handler.category = 'download'
handler.description = 'YouTube scraper dengan resolver downloader'

export default handler
