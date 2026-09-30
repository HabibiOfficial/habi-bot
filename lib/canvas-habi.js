/**
 * ╔══════════════════════════════════════════════╗
 * ║  ------ HABI AI --------                      ║
 * ║  WA Bot • by Habibih Official ID             ║
 * ╚══════════════════════════════════════════════╝
 *
 * Helper render Canvas milik HABI.
 *
 * Dipakai plugin di plugins/canvas/ untuk menggambar
 * dari nol (tanpa aset gambar milik pihak lain).
 *
 * @author Habibih Official ID
 * @source Habibih Cloud ID
 */

import fs from 'node:fs'
import path from 'node:path'
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas'

const FONT_DIR = './assets/font'
const IMAGE_CACHE = new Map()
let fontsReady = false

/** Daftarkan font lokal sekali saja. */
export function ensureFonts() {
  if (fontsReady) return
  fontsReady = true
  if (!fs.existsSync(FONT_DIR)) return
  for (const file of fs.readdirSync(FONT_DIR)) {
    if (!/\.(ttf|otf)$/i.test(file)) continue
    try {
      GlobalFonts.registerFromPath(path.join(FONT_DIR, file), file.replace(/\.[^.]+$/, ''))
    } catch { /* font rusak, lewati */ }
  }
}

/** Daftar family font yang tersedia. */
export function availableFamilies() {
  ensureFonts()
  return GlobalFonts.families.map((f) => f.family)
}

/**
 * Ambil family pertama yang benar-benar terpasang.
 * @param {string[]} wanted daftar pilihan berurutan prioritas
 * @param {string} fallback dipakai kalau tidak ada yang cocok
 */
export function pickFont(wanted, fallback = 'sans-serif') {
  ensureFonts()
  const have = new Set(availableFamilies().map((f) => f.toLowerCase()))
  for (const w of wanted) if (have.has(w.toLowerCase())) return w
  return fallback
}

/**
 * Muat gambar dengan cache, supaya tidak di-decode berulang.
 * @param {string} src path relatif atau URL
 */
export async function loadImageCached(src) {
  if (IMAGE_CACHE.has(src)) return IMAGE_CACHE.get(src)
  const p =
    /^https?:\/\//i.test(src) || Buffer.isBuffer(src)
      ? loadImage(src)
      : loadImage(fs.existsSync(src) ? src : path.resolve(src))
  IMAGE_CACHE.set(src, p)
  return p
}

/** Bersihkan cache gambar (dipakai saat ganti aset). */
export function clearImageCache() {
  IMAGE_CACHE.clear()
}

/**
 * Pecah teks jadi baris yang muat dalam lebar tertentu.
 * Menghormati newline eksplisit dari pengguna.
 */
export function wrapLines(ctx, text, maxWidth) {
  const out = []
  for (const paragraph of String(text ?? '').split('\n')) {
    const words = paragraph.split(/\s+/).filter(Boolean)
    if (!words.length) {
      out.push('')
      continue
    }
    let line = ''
    for (const w of words) {
      const test = line ? `${line} ${w}` : w
      if (ctx.measureText(test).width > maxWidth && line) {
        out.push(line)
        line = w
      } else {
        line = test
      }
    }
    if (line) out.push(line)
  }
  return out
}

/**
 * Tulis teks dengan auto-shrink sampai muat di dalam kotak.
 * Mirip memotong huruf otomatis pada generator gambar,
 * sehingga teks panjang tidak pernah keluar kotak.
 *
 * @returns {number} font size akhir yang dipakai
 */
export function fitText(ctx, text, {
  x,
  y,
  maxWidth,
  maxHeight,
  maxSize = 64,
  minSize = 10,
  lineHeight = 1.25,
  align = 'center',
  font = 'sans-serif',
  weight = 'bold',
  fill = '#000000',
  stroke = null,
  strokeWidth = 5,
} = {}) {
  let size = maxSize
  let lines = []

  while (size >= minSize) {
    ctx.font = `${weight} ${size}px ${font}`
    lines = wrapLines(ctx, text, maxWidth)
    if (lines.length * size * lineHeight <= maxHeight) break
    size -= 1
  }

  ctx.font = `${weight} ${size}px ${font}`
  ctx.textAlign = align
  ctx.textBaseline = 'top'
  const step = size * lineHeight
  const totalH = lines.length * step

  ctx.save()
  if (stroke) {
    ctx.lineJoin = 'round'
    ctx.miterLimit = 2
    ctx.strokeStyle = stroke
    ctx.lineWidth = strokeWidth
  }
  ctx.fillStyle = fill

  lines.forEach((line, i) => {
    const lx = align === 'center' ? x + maxWidth / 2 : align === 'right' ? x + maxWidth : x
    const ly = y + (maxHeight - totalH) / 2 + i * step
    if (stroke) ctx.strokeText(line, lx, ly)
    ctx.fillText(line, lx, ly)
  })
  ctx.restore()

  return { size, height: totalH, lines: lines.length }
}

/** Bulat dengan pembulatan yang benar (half-up), bukan float mentah. */
export function pngBuffer(canvas) {
  return canvas.toBuffer('image/png')
}

/** Buat canvas baru. */
export function makeCanvas(width, height, background) {
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  if (background) {
    ctx.fillStyle = background
    ctx.fillRect(0, 0, width, height)
  }
  return { canvas, ctx }
}

/**
 * Potong gambar agar menutup kotak tanpa gepeng (object-fit: cover).
 */
export function drawCover(ctx, img, x, y, w, h) {
  const iw = img.width
  const ih = img.height
  if (!iw || !ih) return
  const scale = Math.max(w / iw, h / ih)
  const dw = iw * scale
  const dh = ih * scale
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh)
}

/** Sudut membulat. */
export function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

/** Teks dengan outline, biar terbaca di atas foto apa pun. */
export function strokedText(ctx, text, x, y, {
  size = 48,
  font = 'sans-serif',
  weight = 'bold',
  fill = '#ffffff',
  stroke = '#000000',
  strokeWidth = 6,
  align = 'center',
} = {}) {
  ctx.save()
  ctx.font = `${weight} ${size}px ${font}`
  ctx.textAlign = align
  ctx.textBaseline = 'middle'
  ctx.lineJoin = 'round'
  ctx.miterLimit = 2
  ctx.strokeStyle = stroke
  ctx.lineWidth = strokeWidth
  ctx.strokeText(text, x, y)
  ctx.fillStyle = fill
  ctx.fillText(text, x, y)
  ctx.restore()
}
