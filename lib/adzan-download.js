/**
 * ╔══════════════════════════════════════════════╗
 * ║  ------ HABI AI --------                      ║
 * ║  WA Bot • by Habibih Official ID             ║
 * ╚══════════════════════════════════════════════╝
 *
 * Unduh otomatis audio adzan dari GitHub Release.
 *
 * Tujuannya: repo GitHub tetap ramping (~2 MB) karena file
 * MP3 tidak ikut di-commit, melainkan disimpan sebagai asset
 * GitHub Release dan diunduh bot ke cache lokal saat runtime.
 *
 * Alur:
 *   1. Cek cache lokal (assets/adzan/) — kalau ada & cocok, pakai.
 *   2. Kalau belum, unduh dari Release → simpan ke cache.
 *   3. Verifikasi ukuran + prefiks sha256 (dari manifest.json).
 *   4. Kalau gagal, kembalikan null — pemanggil tetap bisa kirim
 *      teks adzan saja, bot tidak boleh crash karena file audio.
 *
 * Credit: Rekaman: Doha Adhan Recordings — Public Domain Mark 1.0
 *
 * @author Habibih Official ID
 * @source Habibih Cloud ID
 */

import { readFile, writeFile, mkdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIREKTORI = join(__dirname, '..', 'assets', 'adzan')
const MANIFEST = join(DIREKTORI, 'manifest.json')

/** Basis URL Release. Audio sengaja TIDAK di dalam repo. */
const BASIS_RELEASE = 'https://github.com/HabibiOfficial/habi-bot/releases/download'

/** Manifest di-cache, plus promise agar tidak dibaca berulang. */
let cacheManifest = null
let promiseManifest = null

/** Unduhan yang sedang berjalan, mencegah unduh ganda. */
const sedangUnduh = new Map()

/** Berapa lama menunggu unduhan sebelum menyerah (ms). */
const BATAS_UNDUH = 60_000

/**
 * Baca manifest.json (dengan cache).
 * @returns {Promise<object|null>}
 */
export async function bacaManifest() {
  if (cacheManifest) return cacheManifest
  if (!promiseManifest) {
    promiseManifest = (async () => {
      try {
        const isi = await readFile(MANIFEST, 'utf8')
        cacheManifest = JSON.parse(isi.toString('utf8'))
        return cacheManifest
      } catch {
        return null
      } finally {
        promiseManifest = null
      }
    })()
  }
  return promiseManifest
}

/**
 * Hitung prefiks sha256 (16 hex pertama) dari buffer.
 * @param {Buffer} buffer
 * @returns {Promise<string>}
 */
async function prefiksSha(buffer) {
  return createHash('sha256').update(buffer).digest('hex').slice(0, 16)
}

/**
 * Apakah file lokal sudah valid (ukuran cocok)?
 * @param {string} path
 * @param {{ukuran?:number}|undefined} meta
 */
async function sahLocal(path, meta) {
  if (!existsSync(path)) return false
  try {
    const s = await stat(path)
    if (s.size === 0) return false
    if (meta?.ukuran && s.size !== meta.ukuran) return false
    return true
  } catch {
    return false
  }
}

/**
 * Unduh satu berkas adzan ke cache lokal.
 *
 * @param {string} waktu  'subuh' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya'
 * @param {{TAG?:string, timeout?:number, logger?:object}} opsi
 * @returns {Promise<{buffer:Buffer, file:string, nama:string, dariCache:boolean}|null>}
 */
export async function unduhAdzan(waktu, opsi = {}) {
  const w = String(waktu || '').toLowerCase()
  if (!w) return null

  const manifest = await bacaManifest()
  const meta = manifest?.berkas?.[w]
  if (!meta) return null

  const path = join(DIREKTORI, meta.nama)

  // 1. Sudah ada di cache?
  if (await sahLocal(path, meta)) {
    try {
      const buffer = await readFile(path)
      if (buffer.length) {
        return { buffer, file: path, nama: meta.nama, dariCache: true }
      }
    } catch {
      /* lanjut ke unduhan */
    }
  }

  // Hindari unduh ganda untuk berkas yang sama
  if (sedangUnduh.has(meta.nama)) return sedangUnduh.get(meta.nama)

  const kerja = (async () => {
      const tag = opsi.TAG || 'v1.5.0'
      // GitHub Release tidak mendukung subfolder: asset diletakkan
      // langsung di akar tag, jadi URL-nya /download/<tag>/<nama>
      const url = `${BASIS_RELEASE}/${tag}/${meta.nama}`
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), opsi.timeout || BATAS_UNDUH)

    try {
      const res = await fetch(url, {
        signal: ctrl.signal,
        headers: { 'user-agent': 'habi-bot/1.0 (+https://habibicloud.id)' },
        redirect: 'follow',
      })
      if (!res.ok) {
        opsi.logger?.warn?.(`  adzan ${w}: HTTP ${res.status}`)
        return null
      }

      const buf = Buffer.from(await res.arrayBuffer())
      if (!buf.length) return null

      // Verifikasi: ukuran harus cocok persis
      if (meta.ukuran && buf.length !== meta.ukuran) {
        opsi.logger?.warn?.(`  adzan ${w}: ukuran tidak cocok (${buf.length} != ${meta.ukuran})`)
        return null
      }
      // Verifikasi: prefiks hash harus cocok (kalau ada di manifest)
      if (meta.sha256) {
        const h = await prefiksSha(buf)
        if (!h.startsWith(meta.sha256)) {
          opsi.logger?.warn?.(`  adzan ${w}: hash tidak cocok`)
          return null
        }
      }

      // Simpan ke cache
      try {
        await mkdir(DIREKTORI, { recursive: true })
        await writeFile(path, buf)
      } catch {
        /* cache hanya opsional — tetap pakai buffer di memori */
      }

      return { buffer: buf, file: path, nama: meta.nama, dariCache: false }
    } catch (err) {
      if (err?.name === 'AbortError') {
        opsi.logger?.warn?.(`  adzan ${w}: unduhan timeout`)
      } else {
        opsi.logger?.warn?.(`  adzan ${w}: gagal — ${err?.message || err}`)
      }
      return null
    } finally {
      clearTimeout(timer)
      sedangUnduh.delete(meta.nama)
    }
  })()

  sedangUnduh.set(meta.nama, kerja)
  return kerja
}

/**
 * Unduh semua audio sekaligus (dipakai saat boot / command admin).
 * Tidak melempar error — Reporting per berkas.
 *
 * @param {{TAG?:string, logger?:object}} opsi
 * @returns {Promise<{berhasil:string[], gagal:string[]}>}
 */
export async function unduhSemuaAdzan(opsi = {}) {
  const manifest = await bacaManifest()
  const berhasil = []
  const gagal = []
  if (!manifest?.berkas) return { berhasil, gagal }

  for (const waktu of Object.keys(manifest.berkas)) {
    const r = await unduhAdzan(waktu, opsi)
    if (r) berhasil.push(waktu)
    else gagal.push(waktu)
  }
  return { berhasil, gagal }
}

/**
 * Status cache lokal — berkas mana yang sudah ada.
 * @returns {Promise<{waktu:string, ada:boolean, ukuran:number}[]>}
 */
export async function statusAdzan() {
  const manifest = await bacaManifest()
  if (!manifest?.berkas) return []
  const out = []
  for (const [waktu, meta] of Object.entries(manifest.berkas)) {
    const path = join(DIREKTORI, meta.nama)
    let ukuran = 0
    try {
      if (existsSync(path)) ukuran = (await stat(path)).size
    } catch {
      ukuran = 0
    }
    out.push({ waktu, ada: ukuran > 0, ukuran })
  }
  return out
}

/** Hapus cache audio (berguna kalau file rusak). */
export async function bersihkanCacheAdzan() {
  const { unlink } = await import('node:fs/promises')
  const manifest = await bacaManifest()
  const dihapus = []
  for (const meta of Object.values(manifest?.berkas || {})) {
    const path = join(DIREKTORI, meta.nama)
    if (existsSync(path)) {
      try {
        await unlink(path)
        dihapus.push(meta.nama)
      } catch {
        /* abaikan */
      }
    }
  }
  return dihapus
}

export default {
  unduhAdzan,
  unduhSemuaAdzan,
  statusAdzan,
  bersihkanCacheAdzan,
  bacaManifest,
}
