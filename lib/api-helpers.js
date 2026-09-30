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
 * Pembantu bersama untuk plugin yang memanggil REST API HABI.
 * Semua plugin di plugins/api/ pakai ini biar tidak berulang.
 */

import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import { Readable } from 'node:stream'

/** Reaction — diabaikan kalau client lama tidak dukung */
export async function react(conn, m, emoji) {
  try {
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.raw.key } })
  } catch { /* abaikan */ }
}

/** Ubah stream Baileys jadi Buffer */
async function streamToBuffer(stream) {
  const chunks = []
  for await (const chunk of stream) chunks.push(Buffer.from(chunk))
  return Buffer.concat(chunks)
}

/** Buka pesan yang dibungkus (ephemeral, view once, dll) */
export function unwrapMessage(message) {
  let current = message
  for (let i = 0; i < 8; i++) {
    const next =
      current?.ephemeralMessage?.message ||
      current?.viewOnceMessage?.message ||
      current?.viewOnceMessageV2?.message ||
      current?.viewOnceMessageV2Extension?.message ||
      current?.documentWithCaptionMessage?.message
    if (!next || next === current) break
    current = next
  }
  return current || {}
}

/** Ambil pesan gambar dari pesan yang dibalas */
export function quotedImage(m) {
  const quoted = unwrapMessage(m.quoted)
  return quoted?.imageMessage || quoted?.viewOnceMessage?.message?.imageMessage || null
}

/**
 * Sumber gambar untuk plugin: URL di argumen, atau reply ke foto.
 * Kalau keduanya ada, URL lebih diprioritaskan.
 * @returns {Promise<string>} URL gambar (untuk dikirim ke API)
 */
export async function resolveImageSource(m, { maxBytes = 4 * 1024 * 1024 } = {}) {
  const arg = String(m.text || '').trim()
  if (arg) return arg

  const imageMessage = quotedImage(m)
  if (!imageMessage) {
    throw new Error('Kirim URL gambar, atau reply ke sebuah foto.')
  }

  // API ini butuh URL, jadi foto di-upload dulu ke host sementara.
  // Kalau tidak ada layanan upload, kasih pesan yang jelas.
  throw new Error(
    'Untuk foto dari chat, kirim URL gambarnya saja. ' +
    '(Unggah foto dulu ke hosting / imgur, lalu tempel URL-nya)'
  )
}

/** Unduh gambar dari pesan Baileys jadi Buffer */
export async function downloadQuotedImage(m, { maxBytes = 4 * 1024 * 1024 } = {}) {
  const imageMessage = quotedImage(m)
  if (!imageMessage) throw new Error('Reply ke sebuah foto.')
  const buffer = await streamToBuffer(await downloadContentFromMessage(imageMessage, 'image'))
  if (!buffer.length) throw new Error('Gagal mengunduh foto.')
  if (buffer.length > maxBytes) {
    throw new Error(`Ukuran foto ${(buffer.length / 1048576).toFixed(1)} MB, melebihi batas 4 MB.`)
  }
  return buffer
}

/** Kirim gambar */
export async function sendImage(conn, m, buffer, caption = '') {
  return conn.sendMessage(m.chat, {
    image: buffer,
    mimetype: 'image/png',
    caption: caption || undefined,
  }, { quoted: m.raw })
}

/** Kirim video buffer */
export async function sendVideo(conn, m, buffer, caption = '', { mimetype = 'video/mp4' } = {}) {
  return conn.sendMessage(m.chat, { video: buffer, mimetype, caption: caption || undefined }, { quoted: m.raw })
}

/** Kirim audio buffer */
export async function sendAudio(conn, m, buffer, caption = '') {
  return conn.sendMessage(m.chat, {
    audio: buffer,
    mimetype: 'audio/mpeg',
    fileName: 'habi.mp3',
    caption: caption || undefined,
  }, { quoted: m.raw })
}

/** Kirim file apa pun sebagai dokumen */
export async function sendFile(conn, m, buffer, filename = 'habi-file', mimetype = 'application/octet-stream') {
  return conn.sendMessage(m.chat, {
    document: buffer,
    fileName: filename,
    mimetype,
    caption: `📎 ${filename}`,
  }, { quoted: m.raw })
}

/** Kirim teks */
export async function sendText(conn, m, text) {
  return conn.sendMessage(m.chat, { text }, { quoted: m.raw })
}

/** Laporkan error dengan bahasa manusia, bukan stack trace */
export async function fail(conn, m, error, hint = '') {
  await react(conn, m, '❌')
  const msg = error?.message || 'Terjadi kesalahan.'
  await sendText(conn, m, [
    '❌ *Gagal.*',
    '',
    msg,
    hint ? `\n_${hint}_` : '',
    '',
    '_Cek koneksi: `.apistatus`_',
  ].filter(Boolean).join('\n'))
}

/** Format angka ala Indonesia */
export function bytes(n) {
  if (!Number.isFinite(n) || n <= 0) return '?'
  const u = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let x = n
  while (x >= 1024 && i < u.length - 1) { x /= 1024; i++ }
  return `${x.toFixed(i >= 2 ? 1 : 0)} ${u[i]}`
}

/** Format detik jadi "1j 23m" */
export function duration(sec) {
  if (!Number.isFinite(sec) || sec <= 0) return '-'
  const h = Math.floor(sec / 3600)
  const mnt = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  return [h && `${h}j`, mnt && `${mnt}m`, s && `${s}d`].filter(Boolean).join(' ') || '0d'
}

/** Ambil teks wajib dari pesan */
export function needText(m, example) {
  const text = String(m.text || '').trim()
  if (!text) throw new Error(`Isi teksnya dulu.\n\n_Contoh: ${example}_`)
  return text
}

/** Ambil URL wajib dari pesan */
export function needUrl(m, example) {
  const text = String(m.text || '').trim()
  if (!/^https?:\/\//i.test(text)) {
    throw new Error(`Tempel URL-nya dulu.\n\n_Contoh: ${example}_`)
  }
  return text
}

export default {
  react, sendImage, sendVideo, sendAudio, sendFile, sendText, fail,
  bytes, duration, needText, needUrl, downloadQuotedImage, resolveImageSource,
}
