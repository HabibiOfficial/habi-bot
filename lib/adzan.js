/**
 * ╔══════════════════════════════════════════════╗
 * ║  ------ HABI AI --------                      ║
 * ║  WA Bot • by Habibih Official ID             ║
 * ╚══════════════════════════════════════════════╝
 *
 * Sumber adzan.
 *
 * Strategi: audio BUNDLED lebih dulu (offline, stabil, tanpa ketergantungan
 * URL pihak ketiga). Sumber daring hanya dipakai sebagai cadangan, dan
 *-credit ke penyedia aslinya.
 *
 * File lokal diletakkan di: assets/adzan/
 * Nama file: adzan-{kota|nasional}.mp3
 * Jika file tidak ada, bot memakai fallback daring.
 *
 * @author Habibih Official ID
 * @source Habibih Cloud ID
 */

import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIREKTORI = join(__dirname, '..', 'assets', 'adzan')

/** Nama-nama file yang dicoba, berurutan prioritas. */
function kandidatNama(variasi) {
  const v = String(variasi || '').toLowerCase().trim()
  const nama = []
  if (v) {
    const bersih = v.replace(/[^a-z0-9]+/g, '-')
    nama.push(`adzan-${bersih}.mp3`, `adzan-${v}.mp3`, `${v}.mp3`)
  }
  nama.push('adzan-nasional.mp3', 'adzan.mp3')
  return [...new Set(nama)]
}

/**
 * Ambil buffer adzan dari disk.
 * @returns {Promise<{buffer: Buffer, file: string}|null>}
 */
export async function adzanLokal(variasi = '') {
  for (const nama of kandidatNama(variasi)) {
    const path = join(DIREKTORI, nama)
    if (existsSync(path)) {
      try {
        const buffer = await readFile(path)
        if (buffer.length > 0) return { buffer, file: path }
      } catch {
        /* lanjut ke kandidat berikutnya */
      }
    }
  }
  return null
}

/** Daftar file adzan yang tersedia di folder assets/adzan. */
export async function daftarAdzan() {
  const { readdir } = await import('node:fs/promises')
  if (!existsSync(DIREKTORI)) return []
  const isi = await readdir(DIREKTORI)
  return isi.filter((f) => /\.mp3$/i.test(f))
}

export const DIREKTORI_ADZAN = DIREKTORI

export default { adzanLokal, daftarAdzan, DIREKTORI_ADZAN }
