/**
 * ╔══════════════════════════════════════════════╗
 * ║  ------ HABI AI --------                      ║
 * ║  WA Bot • by Habibih Official ID             ║
 * ╚══════════════════════════════════════════════╝
 *
 * Sumber audio adzan.
 *
 * Berkas MP3 TIDAK disimpan di dalam repo (agar repo tetap ramping).
 * Bot mengunduhnya otomatis dari GitHub Release ke cache
 * assets/adzan/ saat pertama kali dibutuhkan. Lihat lib/adzan-download.js.
 *
 * Kalau kamu punya rekaman sendiri, taruh langsung di assets/adzan/:
 *   adzan-subuh.mp3, adzan-dzuhur.mp3, adzan-ashar.mp3,
 *   adzan-maghrib.mp3, adzan-isya.mp3
 *   adzan-<kota>.mp3   (opsional, khusus kota)
 *   adzan-nasional.mp3 (fallback)
 *
 * Credit berkas bawaan, wajib ditampilkan:
 *   Rekaman: Doha Adhan Recordings — Public Domain Mark 1.0
 *   Sumber: https://archive.org/details/adhan.recordings.from.doha.qatar
 *
 * @author Habibih Official ID
 * @source Habibih Cloud ID
 */

import { readFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { unduhAdzan } from './adzan-download.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const DIREKTORI_ADZAN = join(__dirname, '..', 'assets', 'adzan')

/** Credit berkas bawaan, wajib ditampilkan. */
export const CREDIT_ADZAN =
  'Rekaman: Doha Adhan Recordings — Public Domain Mark 1.0 (Internet Archive)'

/**
 * Nama berkas yang dicoba, berurutan prioritas.
 * @param {string} waktu 'subuh' | 'dzuhur' | ... (boleh kosong)
 * @param {string} kota nama kota (boleh kosong)
 */
function kandidatNama(waktu, kota) {
  const nama = []
  const k = String(kota || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const w = String(waktu || '').toLowerCase()

  // 1. khusus kota + waktu  (mis. adzan-serang-subuh.mp3)
  if (k && w) nama.push(`adzan-${k}-${w}.mp3`)
  // 2. khusus kota         (mis. adzan-serang.mp3)
  if (k) nama.push(`adzan-${k}.mp3`)
  // 3. per waktu           (mis. adzan-subuh.mp3)
  if (w) nama.push(`adzan-${w}.mp3`)
  // 4. fallback
  nama.push('adzan-nasional.mp3', 'adzan.mp3')

  return [...new Set(nama)]
}

/**
 * Ambil buffer adzan.
 *
 * Urutan:
 *   1. File lokal di assets/adzan/ (rekaman milikmu sendiri, atau cache).
 *   2. Kalau tidak ada, unduh otomatis dari GitHub Release.
 *   3. Kalau tetap gagal, kembalikan null (bot kirim teks saja).
 *
 * @param {string} waktu
 * @param {string} kota
 * @param {{logger?:object, izinkanUnduh?:boolean}} opsi
 * @returns {Promise<{buffer: Buffer, file: string, nama: string}|null>}
 */
export async function adzanLokal(waktu = '', kota = '', opsi = {}) {
  // 1. File lokal
  for (const nama of kandidatNama(waktu, kota)) {
    const path = join(DIREKTORI_ADZAN, nama)
    if (!existsSync(path)) continue
    try {
      const buffer = await readFile(path)
      if (buffer.length > 0) return { buffer, file: path, nama }
    } catch {
      /* coba nama berikutnya */
    }
  }

  // 2. Unduh otomatis (hanya untuk waktu baku, bukan file khusus kota)
  if (waktu && opsi.izinkanUnduh !== false) {
    const w = String(waktu).toLowerCase()
    try {
      const r = await unduhAdzan(w, { logger: opsi.logger })
      if (r) return { buffer: r.buffer, file: r.file, nama: r.nama }
    } catch {
      /* diam saja — pemanggil tetap bisa kirim teks */
    }
  }

  return null
}

/** Daftar file adzan yang tersedia. */
export async function daftarAdzan() {
  if (!existsSync(DIREKTORI_ADZAN)) return []
  const isi = await readdir(DIREKTORI_ADZAN)
  return isi.filter((f) => /\.mp3$/i.test(f)).sort()
}

/** Nama waktu yang punya berkas audio. */
export async function waktuTersedia() {
  const files = await daftarAdzan()
  const out = []
  for (const w of ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya']) {
    if (files.includes(`adzan-${w}.mp3`)) out.push(w)
  }
  return out
}

export default { adzanLokal, daftarAdzan, waktuTersedia, DIREKTORI_ADZAN, CREDIT_ADZAN }
