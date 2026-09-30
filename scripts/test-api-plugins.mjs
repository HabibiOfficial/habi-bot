#!/usr/bin/env node
/**
 * Uji plugin REST API tanpa WhatsApp.
 *
 * Pakai stub Baileys + conn/m palsu, lalu jalankan tiap plugin
 * sungguhan terhadap API produksi. Yang lulus berarti perintahnya
 * benar-benar bisa dipanggil.
 *
 * Jalankan: node scripts/test-api-plugins.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const API_DIR = path.join(here, '..', 'plugins', 'api')
const BASE = 'https://api.habibicloudserver.dpdns.org'

const reg = await (await fetch(`${BASE}/api/register`)).json()
process.env.HABI_API_KEY = reg.apikey
console.log(`\n  key: ${reg.apikey.slice(0, 10)}…\n`)

/* Setiap kasus: nama file + argumen + jenis yang diharapkan */
const CASES = [
  ['apiiqc.js', 'Halo dunia dari bot', 'image'],
  ['apibrat.js', 'halo semua', 'image'],
  ['apibratvid.js', 'halo', 'video'],
  ['apimeme.js', 'https://picsum.photos/seed/x/600/400 atas bawah', 'image'],
  ['apiwatermark.js', 'https://picsum.photos/seed/y/600/400 HABI', 'image'],
  ['apiwelcome.js', 'Budi Tester', 'image'],
  ['apireply.js', '5 Jalan crur ctx', 'image'],
  ['apistickerapi.js', 'https://picsum.photos/seed/z/400/400', 'sticker'],
  ['apissweb.js', 'https://example.com', 'image'],
  ['apiremovebg.js', 'https://picsum.photos/seed/w/500/400', 'image'],
  ['apitts.js', 'Halo dunia', 'audio'],
  ['apigetfile.js', 'https://www.google.com/robots.txt', 'document'],
  ['apipdf.js', 'https://raw.githubusercontent.com/mozilla/pdf.js/master/test/pdfs/basicapi.pdf', 'document'],
  ['apiytsearch.js', 'rizky janaka', 'text'],
  ['apiytinfo.js', 'https://youtu.be/dQw4w9WgXcQ', 'text'],
  ['apiytthumb.js', 'dQw4w9WgXcQ', 'text'],
  ['apispotify.js', 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT', 'text'],
  ['apiget.js', 'https://www.tiktok.com/@scout2015/video/6718335390845095173', 'text'],
  ['apikirim.js', 'https://www.tiktok.com/@scout2015/video/6718335390845095173', 'videoUrl'],
  ['apidetect.js', 'https://vm.tiktok.com/XXXX/', 'text'],
  ['apihumanizer.js', 'It is important to note that this furthermore utilizes', 'text'],
  ['apitranslate.js', 'en Hello world', 'text'],
  ['apiocr.js', 'https://picsum.photos/seed/ocr/600/400', 'text'],
  ['apiwebfetch.js', 'https://example.com', 'text'],
  ['aphonespecs.js', 'iPhone 15 Pro', 'text'],
  ['aphonecompare.js', 'iPhone 15 Pro Samsung S23', 'text'],
  ['alirik.js', 'Indonesia Raya', 'text'],
  ['apistatus.js', '', 'text'],
]

const sent = []

function makeConn() {
  return {
    sendMessage: async (chat, content) => {
      // Reaction bukan hasil — abaikan supaya tidak mengganggu deteksi
      if (content && content.react) return { key: { id: 'x' } }
      const has = (k) => content[k] !== undefined && content[k] !== null
      let kind = 'unknown'
      let size = 0
      if (has('image')) { kind = 'image'; size = content.image.length || 0 }
      else if (has('video')) {
        kind = 'video'
        size = typeof content.video === 'string' ? content.video.length : (content.video.buffer?.length || 0)
      }
      else if (has('audio')) { kind = 'audio'; size = content.audio.length || 0 }
      else if (has('document')) { kind = 'document'; size = content.document.length || 0 }
      else if (has('sticker')) { kind = 'sticker'; size = content.sticker.length || 0 }
      else if (has('text')) { kind = 'text'; size = content.text.length || 0 }
      sent.push({ kind, size, text: content.text || '' })
      return { key: { id: 'x' } }
    },
  }
}

let pass = 0
const fails = []

for (const [file, arg, want] of CASES) {
  const p = path.join(API_DIR, file)
  if (!fs.existsSync(p)) { fails.push([file, 'file tidak ada']); continue }

  sent.length = 0
  const mod = await import(p + '?t=' + Date.now())
  const handler = mod.default

  if (typeof handler !== 'function' || !handler.command) {
    fails.push([file, 'tidak ekspor handler valid']); continue
  }

  const conn = makeConn()
  const m = {
    chat: '62test@s.whatsapp.net',
    raw: { key: { id: 'x' } },
    text: arg,
    args: arg ? arg.split(/\s+/) : [],
    isGroup: false,
    quoted: null,
  }

  const t0 = Date.now()
  try {
    await handler(m, { conn, usedPrefix: '.' })
  } catch (err) {
    fails.push([file, 'THROW: ' + err.message]); continue
  }
  const ms = Date.now() - t0

  // .apistatus/.apiget/.apikirim boleh diam (status error pun sah)
  if (sent.length === 0) {
    if (want === 'text' || want === 'videoUrl') { pass++; console.log(`  ✓ ${file.padEnd(22)} diam (dilewati diam-diam)`) }
    else { fails.push([file, 'tidak kirim apa-apa']); }
    continue
  }

  const last = sent[sent.length - 1]
  if (!last) { fails.push([file, 'tidak kirim apa-apa']); continue }
  const ok = want === 'videoUrl' ? last.kind === 'video' : last.kind === want
  const label = `${last.kind} ${last.size ? last.size.toLocaleString('id-ID') + 'b' : ''}`
  if (ok) {
    pass++
    console.log(`  \x1b[32m✓\x1b[0m ${file.padEnd(22)} ${label.padEnd(24)} \x1b[2m${ms}ms\x1b[0m`)
  } else {
    fails.push([file, `kirim ${last.kind}, harap ${want} — ${last.text.slice(0, 90)}`])
    console.log(`  \x1b[31m✗\x1b[0m ${file.padEnd(22)} dapat ${last.kind}, harap ${want}`)
  }
}

console.log()
if (fails.length) {
  console.log(`  \x1b[31m${fails.length} gagal:\x1b[0m`)
  for (const [f, why] of fails) console.log(`    ${f.padEnd(22)} ${why}`)
}
console.log(`  ${pass}/${CASES.length} plugin lolos`)
console.log()
process.exit(fails.length ? 1 : 0)
