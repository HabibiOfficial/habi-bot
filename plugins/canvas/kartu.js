/**
 * ╔══════════════════════════════════════════════╗
 * ║  ------ HABI AI --------                      ║
 * ║  WA Bot • by Habibih Official ID             ║
 * ╚══════════════════════════════════════════════╝
 *
 * Kartu visuals — digambar dari nol via Canvas.
 *   jarvis : meme gaya Jarvis
 *   igstory: kartu Instagram Story
 *   berita : kartu berita / headline
 *
 * @author Habibih Official ID
 * @source Habibih Cloud ID
 */

import { makeCanvas, fitText, pickFont, roundRect, loadImageCached, drawCover } from '../../lib/canvas-habi.js'

const FONT = () => pickFont(['Arial', 'Helvetica', 'DejaVu Sans', 'sans-serif'])

/* ───────────────────────── Jarvis ───────────────────────── */

function renderJarvis(teks) {
  const W = 800
  const H = 800
  const { canvas, ctx } = makeCanvas(W, H, '#05070a')
  const font = FONT()

  // grid halus ala HUD
  ctx.strokeStyle = 'rgba(0,229,255,0.10)'
  ctx.lineWidth = 1
  for (let x = 0; x <= W; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
  }
  for (let y = 0; y <= H; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
  }

  // radial glow
  const glow = ctx.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, W / 1.4)
  glow.addColorStop(0, 'rgba(0,180,255,0.16)')
  glow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  // cincinbereaksi
  ctx.strokeStyle = 'rgba(0,229,255,0.55)'
  ctx.lineWidth = 3
  for (const r of [300, 262, 224]) {
    ctx.beginPath()
    ctx.arc(W / 2, H / 2, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 1.4)
    ctx.stroke()
  }

  // lingkaran putus-putus
  ctx.strokeStyle = 'rgba(0,229,255,0.30)'
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2
    ctx.beginPath()
    ctx.arc(W / 2, H / 2, 340, a, a + 0.09)
    ctx.stroke()
  }

  // judul
  ctx.fillStyle = '#00e5ff'
  ctx.font = `bold 30px ${font}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('J.A.R.V.I.S.', W / 2, 84)

  // teks utama
  fitText(ctx, teks, {
    x: 110, y: 250, maxWidth: W - 220, maxHeight: 300,
    maxSize: 62, font, fill: '#e8f9ff',
  })

  // bar status bawah
  ctx.fillStyle = 'rgba(0,229,255,0.20)'
  ctx.fillRect(80, 690, W - 160, 10)
  ctx.fillStyle = '#00e5ff'
  ctx.fillRect(80, 690, (W - 160) * 0.78, 10)
  ctx.font = `20px ${font}`
  ctx.fillStyle = '#7fe9ff'
  ctx.textAlign = 'left'
  ctx.fillText('ONLINE', 80, 726)
  ctx.textAlign = 'right'
  ctx.fillText('HABI CLOUD', W - 80, 726)

  return canvas
}

/* ──────────────────────── IG Story ──────────────────────── */

async function renderIgStory({ judul, sub, foto, tag }) {
  const W = 1080
  const H = 1920
  const { canvas, ctx } = makeCanvas(W, H, '#101010')
  const font = FONT()

  // foto latar (opsional)
  if (foto) {
    try {
      const img = await loadImageCached(foto)
      const ph = 1080
      drawCover(ctx, img, 0, 0, W, ph)
      // gradasi panjang: meredupkan foto di bawah supaya bar HP
      // dan judul tetap terbaca
      const fade = ctx.createLinearGradient(0, 0, 0, ph + 220)
      fade.addColorStop(0, 'rgba(16,16,16,0.45)')
      fade.addColorStop(0.45, 'rgba(16,16,16,0.12)')
      fade.addColorStop(0.8, 'rgba(16,16,16,0.95)')
      fade.addColorStop(1, '#101010')
      ctx.fillStyle = fade
      ctx.fillRect(0, 0, W, ph + 220)
      ctx.fillStyle = '#101010'
      ctx.fillRect(0, 1080, W, H - 1080)
    } catch {
      ctx.fillStyle = '#181818'
      ctx.fillRect(0, 0, W, 1080)
    }
  } else {
    const g = ctx.createLinearGradient(0, 0, W, 1080)
    g.addColorStop(0, '#2b2b2b')
    g.addColorStop(1, '#101010')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, 1080)
  }

  // bar status HP
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold 30px ${font}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('9:41', 60, 70)
  ctx.textAlign = 'right'
  // avoid glyph emoji yang tidak ada di font ini
  ctx.fillText('LTE  ▮▮▮  100%', W - 60, 70)

  // judul besar
  fitText(ctx, judul, {
    x: 70, y: 1160, maxWidth: W - 140, maxHeight: 420,
    maxSize: 92, font, fill: '#ffffff', align: 'left',
  })

  // garis aksen
  ctx.fillStyle = '#e1306c'
  ctx.fillRect(70, 1620, 120, 10)

  // sub-teks
  fitText(ctx, sub, {
    x: 70, y: 1660, maxWidth: W - 140, maxHeight: 180,
    maxSize: 40, font, weight: 'normal', fill: '#cfcfcf', align: 'left',
  })

  // bar interaksi — pakai glyph yang tersedia di font
  const y0 = 1850
  const items = ['♥  1.2rb', '●  86', '↑  120']
  ctx.font = `32px ${font}`
  ctx.textAlign = 'left'
  items.forEach((t, i) => ctx.fillText(t, 70 + i * 300, y0))

  // label / tag
  if (tag) {
    const label = tag.startsWith('#') ? tag : '#' + tag
    ctx.font = `bold 30px ${font}`
    const tw = ctx.measureText(label).width
    ctx.fillStyle = 'rgba(255,255,255,0.16)'
    roundRect(ctx, 70, 220, tw + 48, 66, 33)
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, 70 + (tw + 48) / 2, 254)
  }

  return canvas
}

/* ────────────────────── Kartu Berita ────────────────────── */

async function renderBerita({ judul, sub, sumber, foto, waktu }) {
  const W = 1080
  const H = 1440
  const { canvas, ctx } = makeCanvas(W, H, '#ffffff')
  const font = FONT()

  // header merah (gaya koran)
  ctx.fillStyle = '#c0392b'
  ctx.fillRect(0, 0, W, 120)
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold 46px ${font}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText((sumber || 'HABI NEWS').toUpperCase(), 56, 62)

  // garis bawah header
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 120, W, 4)

  // foto
  const fy = 160
  const fh = 560
  if (foto) {
    try {
      const img = await loadImageCached(foto)
      drawCover(ctx, img, 56, fy, W - 112, fh)
    } catch {
      ctx.fillStyle = '#e8e8e8'
      ctx.fillRect(56, fy, W - 112, fh)
      ctx.fillStyle = '#999999'
      ctx.font = `28px ${font}`
      ctx.textAlign = 'center'
      ctx.fillText('foto tidak tersedia', W / 2, fy + fh / 2)
    }
  } else {
    ctx.fillStyle = '#e8e8e8'
    ctx.fillRect(56, fy, W - 112, fh)
    ctx.fillStyle = '#999999'
    ctx.font = `28px ${font}`
    ctx.textAlign = 'center'
    ctx.fillText('HABI CLOUD', W / 2, fy + fh / 2)
  }

  // judul
  fitText(ctx, judul, {
    x: 56, y: 770, maxWidth: W - 112, maxHeight: 300,
    maxSize: 66, font, fill: '#111111', align: 'left',
  })

  // garis pemisah
  ctx.fillStyle = '#dddddd'
  ctx.fillRect(56, 1100, W - 112, 2)

  // sub / ringkasan
  fitText(ctx, sub, {
    x: 56, y: 1130, maxWidth: W - 112, maxHeight: 220,
    maxSize: 34, font, weight: 'normal', fill: '#444444', align: 'left',
  })

  // footer
  ctx.fillStyle = '#c0392b'
  ctx.fillRect(0, H - 90, W, 90)
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold 28px ${font}`
  ctx.textAlign = 'left'
  ctx.fillText('HABI CLOUD — news card', 56, H - 45)
  ctx.textAlign = 'right'
  ctx.fillText(waktu || '', W - 56, H - 45)

  return canvas
}

/* ────────────────────────── Handler ────────────────────────── */

const handler = async (m, { conn, usedPrefix }) => {
  const p = usedPrefix || '.'
  const jenis = (m.args[0] || '').toLowerCase()

  if (jenis === 'jarvis') {
    // Buang kata "jarvis" di depan; sisa teks adalah isi kartu.
    const teks = m.text.replace(/^\s*jarvis\s*/i, '').trim() || 'Sistem aktif dan siap membantu.'
    const canvas = renderJarvis(teks)
    await conn.sendMessage(m.chat, {
      image: canvas.toBuffer('image/png'),
      mimetype: 'image/png',
      caption: '⚙️ *J.A.R.V.I.S.*\n\n_Format: ' + p + 'desain jarvis teksnya_',
    }, { quoted: m.raw })
    return
  }

  if (jenis === 'igstory' || jenis === 'story') {
    // kartu igstory [foto] | judul | sub | tag
    const bagian = m.text.replace(/^\s*(igstory|story)\s*/i, '').split('|').map((s) => s.trim())
    const foto = bagian[0] || ''
    const judul = bagian[1] || 'Halo'
    const sub = bagian[2] || 'Kartu IG Story dari HABI Cloud.'
    const tag = bagian[3] || ''
    const canvas = await renderIgStory({ judul, sub, foto, tag })
    await conn.sendMessage(m.chat, {
      image: canvas.toBuffer('image/png'),
      mimetype: 'image/png',
      caption:
        '📸 *Kartu IG Story*\n\n' +
        '_Format: ' + p + 'desain igstory [url foto] | Judul | Subjudul | #tag_',
    }, { quoted: m.raw })
    return
  }

  if (jenis === 'berita' || jenis === 'news') {
    const bagian = m.text.replace(/^\s*(berita|news)\s*/i, '').split('|').map((s) => s.trim())
    const judul = bagian[0] || 'Judul Berita'
    const sub = bagian[1] || 'Ringkasan berita.'
    const sumber = bagian[2] || 'HABI NEWS'
    const foto = bagian[3] || ''
    const waktu = bagian[4] || ''
    const canvas = await renderBerita({ judul, sub, sumber, foto, waktu })
    await conn.sendMessage(m.chat, {
      image: canvas.toBuffer('image/png'),
      mimetype: 'image/png',
      caption:
        '📰 *Kartu Berita*\n\n' +
        '_Format: ' + p + 'desain berita Judul | Sub judul | Sumber | url foto | Waktu_',
    }, { quoted: m.raw })
    return
  }

  await m.reply(
    '🎨 *Desain visuals*\n\n' +
    `• ${p}desain jarvis Teks kamu\n` +
    `• ${p}desain igstory [url] | Judul | Sub | #tag\n` +
    `• ${p}desain berita Judul | Sub | Sumber | [url foto] | Waktu`
  )
}

handler.command = /^(?:desain|jarvis|igstory|story|kartuberita|news)$/i
handler.help = ['desain']
handler.tags = ['canvas', 'image']
handler.category = 'canvas'
handler.description = 'Kartu visuals: jarvis, IG Story, kartu berita'
handler.example = [
  'desain jarvis Semua sistem normal',
  'desain igstory https://picsum.photos/600/800 | Judul | Sub judul | #promo',
  'desain berita Breaking | Isi ringkas | HABI NEWS | https://picsum.photos/900/500 | 10:00',
]

export default handler
