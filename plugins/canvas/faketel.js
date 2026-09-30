/**
 * ╔══════════════════════════════════════════════╗
 * ║  ------ HABI AI --------                      ║
 * ║  WA Bot • by Habibih Official ID             ║
 * ╚══════════════════════════════════════════════╝
 *
 * Layar panggilan & Telegram palsu — render dari nol via Canvas.
 * Untuk lelucon, bukan untuk menipu.
 *
 * @author Habibih Official ID
 * @source Habibih Cloud ID
 */

import { makeCanvas, fitText, pickFont, roundRect } from '../../lib/canvas-habi.js'

const W = 720
const H = 1280

function layarPanggilan(nama, status) {
  const { canvas, ctx } = makeCanvas(W, H, '#1b1b1f')
  const font = pickFont(['Arial', 'Helvetica', 'DejaVu Sans', 'sans-serif'])

  // gradasi latar
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, '#2a2a35')
  g.addColorStop(1, '#101014')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)

  // avatar
  const inisial = String(nama || '?').trim().charAt(0).toUpperCase()
  ctx.fillStyle = '#5a5a68'
  ctx.beginPath()
  ctx.arc(W / 2, 400, 110, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold 96px ${font}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(inisial, W / 2, 405)

  // nama & status
  ctx.fillStyle = '#ffffff'
  fitText(ctx, nama || 'Tanpa Nama', {
    x: 40, y: 545, maxWidth: W - 80, maxHeight: 90, maxSize: 54, font, fill: '#ffffff',
  })
  ctx.fillStyle = '#b0b0bd'
  fitText(ctx, status || 'Panggilan masuk…', {
    x: 40, y: 640, maxWidth: W - 80, maxHeight: 50, maxSize: 30, font, weight: 'normal', fill: '#b0b0bd',
  })

  // dua tombol
  const tombol = (cx, warna, glyph) => {
    ctx.fillStyle = warna
    ctx.beginPath()
    ctx.arc(cx, 1080, 62, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.font = `bold 44px ${font}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(glyph, cx, 1082)
  }
  tombol(180, '#3bd16f', '✕')   // tolak
  tombol(540, '#3bd16f', '✓')   // terima

  // label tombol
  ctx.font = `20px ${font}`
  ctx.fillStyle = '#9a9aa6'
  ctx.fillText('Tolak', 180, 1165)
  ctx.fillText('Terima', 540, 1165)

  return canvas
}

function layarTelegram(nama, pesan) {
  const { canvas, ctx } = makeCanvas(W, H, '#0f1620')
  const font = pickFont(['Arial', 'Helvetica', 'DejaVu Sans', 'sans-serif'])

  // header
  ctx.fillStyle = '#17212b'
  ctx.fillRect(0, 0, W, 130)
  ctx.fillStyle = '#5288c1'
  ctx.beginPath()
  ctx.arc(64, 65, 30, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold 34px ${font}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(String(nama || 'Tanpa Nama').slice(0, 22), 112, 58)
  ctx.font = `20px ${font}`
  ctx.fillStyle = '#7f91a4'
  ctx.fillText('online', 112, 90)

  // gelembung pesan
  const bubble = (teks, y, keluar) => {
    ctx.font = `28px ${font}`
    const maxW = 440
    const words = String(teks).split(/\s+/)
    const lines = []
    let line = ''
    for (const w of words) {
      const t = line ? `${line} ${w}` : w
      if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w }
      else line = t
    }
    if (line) lines.push(line)

    const h = lines.length * 40 + 32
    const bw = Math.min(maxW, Math.max(...lines.map((l) => ctx.measureText(l).width))) + 40
    const x = keluar ? W - 40 - bw : 40

    ctx.fillStyle = keluar ? '#2b5278' : '#182533'
    roundRect(ctx, x, y, bw, h, 18)
    ctx.fill()

    ctx.fillStyle = '#e8e8e8'
    ctx.font = `28px ${font}`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    lines.forEach((l, i) => ctx.fillText(l, x + 20, y + 16 + i * 40))
    return h
  }

  bubble('Halo!', 180, false)
  bubble(String(pesan || 'Ini pesan dari HABI').slice(0, 120), 290, true)
  bubble('Lah, serius? 😆', 430, false)

  // input bar
  ctx.fillStyle = '#17212b'
  ctx.fillRect(0, H - 90, W, 90)
  ctx.strokeStyle = '#5288c1'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(50, H - 45, 22, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = '#7f91a4'
  ctx.font = `24px ${font}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('Balasan...', 90, H - 44)

  return canvas
}

const handler = async (m, { conn }) => {
  const mode = (m.args[0] || '').toLowerCase()
  const nama = m.args[1] ? m.args.slice(1).join(' ') : ''

  let canvas
  let label
  if (mode === 'telegram' || mode === 'tg') {
    label = 'Telegram'
    canvas = layarTelegram(nama, m.text)
  } else {
    label = 'Panggilan'
    canvas = layarPanggilan(nama, m.text)
  }

  await conn.sendMessage(m.chat, {
    image: canvas.toBuffer('image/png'),
    mimetype: 'image/png',
    caption: `📱 Layar *${label}* palsu — dibuat oleh HABI 🤖\n\n_Cuma untuk lelucon ya._`,
  }, { quoted: m.raw })
}

handler.command = /^(?:faketel|fakecall|faketelegram|faketg)$/i
handler.help = ['faketel']
handler.tags = ['canvas', 'image', 'prank']
handler.category = 'canvas'
handler.description = 'Layar panggilan / Telegram palsu (lelucon)'
handler.example = ['faketel call Habibih', 'faketel telegram Budi']

export default handler
