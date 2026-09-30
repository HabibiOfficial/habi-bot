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
 * Klien untuk REST API Habibih Cloud ID.
 *
 * Semua perintah yang "%[a-z]+" di teks akan otomatis diganti
 * dengan hasil dari API — jadi bot bisa pakai fitur image maker
 * dan downloader tanpa menulis logika render di sini.
 */

import { settings } from '../config/settings.js'

const API_BASE = String(
  process.env.HABI_API_URL || settings.api?.baseUrl || 'https://api.habibicloudserver.dpdns.org'
).replace(/\/+$/, '')

const API_KEY = String(process.env.HABI_API_KEY || settings.api?.apikey || '').trim()
const TIMEOUT = Number(process.env.HABI_API_TIMEOUT_MS) || 60000

/** Cache key supaya tidak registering ulang tiap pesan */
let cachedKey = null
let cachedAt = 0
const KEY_TTL = 10 * 60 * 1000

export function isApiEnabled() {
  return Boolean(API_BASE)
}

/** Register key gratis kalau HABI_API_KEY belum diisi */
async function getKey() {
  if (API_KEY) return API_KEY
  if (cachedKey && Date.now() - cachedAt < KEY_TTL) return cachedKey
  try {
    const res = await fetch(`${API_BASE}/api/register`, { signal: AbortSignal.timeout(15000) })
    const body = await res.json()
    if (body?.status && body.apikey) {
      cachedKey = body.apikey
      cachedAt = Date.now()
      return cachedKey
    }
  } catch { /* biarkan null, akan dilaporkan di bawah */ }
  return null
}

/**
 * Panggil endpoint API.
 * @param {string} path  contoh: /api/sticker
 * @param {object} query  parameter query
 * @returns {Promise<Buffer>} file biner
 */
export async function apiFile(path, query = {}) {
  const key = await getKey()
  if (!key) {
    throw new Error('API key belum ada. Isi HABI_API_KEY di .env, atau cek koneksi ke API.')
  }

  const url = new URL(`${API_BASE}${path}`)
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === '') continue
    url.searchParams.set(k, String(v))
  }
  url.searchParams.set('apikey', key)

  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) })

  if (!res.ok) {
    let message = `HTTP ${res.status}`
    try {
      const body = await res.json()
      if (body?.error) message = body.error
    } catch { /* respons bukan JSON */ }
    throw new Error(message)
  }

  const buffer = Buffer.from(await res.arrayBuffer())
  if (!buffer.length) throw new Error('Respons API kosong.')
  return buffer
}

/** Panggil endpoint yang balas JSON */
export async function apiJson(path, query = {}) {
  const key = await getKey()
  if (!key) throw new Error('API key belum ada. Isi HABI_API_KEY di .env.')

  const url = new URL(`${API_BASE}${path}`)
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === '') continue
    url.searchParams.set(k, String(v))
  }
  url.searchParams.set('apikey', key)

  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) })
  const body = await res.json().catch(() => ({}))
  if (!res.ok || body?.status === false) {
    throw new Error(body?.error || `HTTP ${res.status}`)
  }
  return body
}

/** Cek apakah string mengandung perintah %nama */
export function hasCommand(text) {
  return /%[a-z0-9_]+/i.test(String(text || ''))
}

/** Daftar perintah yang tersedia */
export const COMMANDS = {
  iqc: text => apiFile('/api/iqc', { text }),
  quote: text => apiFile('/api/iqc', { text }),
  reply: text => apiFile('/api/reply', { text, variant: 1, name: 'HABI Official' }),
  welcome: text => apiFile('/api/welcome', { name: text, group: 'Grup WhatsApp', accent: 'green' }),
  meme: text => apiFile('/api/meme', { top: text, bottom: 'HABI API' }),
  brat: text => apiFile('/api/brat', { text }),
}

export default { apiFile, apiJson, isApiEnabled, hasCommand, COMMANDS }
