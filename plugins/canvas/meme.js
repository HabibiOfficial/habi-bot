/**
 * ╔══════════════════════════════════════════════╗
 * ║  ------ HABI AI --------                      ║
 * ║  WA Bot • by Habibih Official ID             ║
 * ╚══════════════════════════════════════════════╝
 *
 * Meme template — digambar dari nol via Canvas.
 * Tidak memakai aset gambar milik pihak lain.
 *
 * @author Habibih Official ID
 * @source Habibih Cloud ID
 */

import { makeCanvas, fitText, pickFont, strokedText } from '../../lib/canvas-habi.js'

const W = 600
const H = 600

const templates = {
  /** Dua panel atas/bawah — gaya "hot take". */
  drake: {
    draw(ctx, atas, bawah) {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = '#000000'

      // figure
      const fig = (y, h) => {
        ctx.fillStyle = '#111111'
        ctx.beginPath()
        ctx.arc(W - 105, y + 42, 38, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillRect(W - 130, y + 80, 50, h - 80)
        ctx.beginPath()
        ctx.moveTo(W - 130, y + 130)
        ctx.lineTo(W - 215, y + 150)
        ctx.lineTo(W - 128, y + 165)
        ctx.fill()
        ctx.beginPath()
        ctx.moveTo(W - 80, y + 130)
        ctx.lineTo(W + 5, y + 148)
        ctx.lineTo(W - 82, y + 165)
        ctx.fill()
      }
      fig(0, 300)
      fig(300, 300)

      // panel
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 5
      ctx.strokeRect(0, 0, W, 300)
      ctx.strokeRect(0, 300, W, 300)

      const font = pickFont(['Arial', 'Helvetica', 'DejaVu Sans', 'sans-serif'])
      fitText(ctx, atas, { x: 20, y: 8, maxWidth: 330, maxHeight: 284, maxSize: 42, font, stroke: true })
      fitText(ctx, bawah, { x: 20, y: 308, maxWidth: 330, maxHeight: 284, maxSize: 42, font, stroke: true })
    },
  },

  /** Dua tombol dengan label — gaya "pilihan". */
  twobuttons: {
    draw(ctx, atas, bawah) {
      const bg = ctx.createLinearGradient(0, 0, W, H)
      bg.addColorStop(0, '#4a4a4a')
      bg.addColorStop(1, '#1a1a1a')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // character
      ctx.fillStyle = '#e8c39e'
      ctx.beginPath()
      ctx.arc(W / 2, 150, 62, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#2c2c2c'
      ctx.beginPath()
      ctx.arc(W / 2, 150, 62, Math.PI, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#111'
      ctx.beginPath(); ctx.arc(W / 2 - 22, 150, 7, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(W / 2 + 22, 150, 7, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = '#111'
      ctx.lineWidth = 5
      ctx.beginPath(); ctx.arc(W / 2, 178, 18, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke()
      ctx.fillStyle = '#e8c39e'
      ctx.fillRect(W / 2 - 95, 212, 190, 200)

      const font = pickFont(['Arial', 'Helvetica', 'DejaVu Sans', 'sans-serif'])
      const drawButton = (label, cy) => {
        ctx.fillStyle = '#f5f5f5'
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 5
        ctx.beginPath()
        ctx.roundRect ? ctx.roundRect(70, cy, W - 140, 66, 12) : ctx.rect(70, cy, W - 140, 66)
        ctx.fill()
        ctx.stroke()
        fitText(ctx, label, { x: 80, y: cy + 6, maxWidth: W - 160, maxHeight: 54, maxSize: 30, font })
      }
      drawButton(atas, 330)
      drawButton(bawah, 424)
    },
  },

  /** Dua foto dengan label. */
  beautiful: {
    draw(ctx, atas, bawah) {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, W, H)
      const cellW = W / 2
      const font = pickFont(['Arial', 'Helvetica', 'DejaVu Sans', 'sans-serif'])

      for (let i = 0; i < 2; i++) {
        const x = i * cellW
        const g = ctx.createLinearGradient(x, 0, x, H)
        g.addColorStop(0, i ? '#ffd97d' : '#a8d8ea')
        g.addColorStop(1, i ? '#ff8fab' : '#4a7fb5')
        ctx.fillStyle = g
        ctx.fillRect(x + 8, 8, cellW - 16, H - 16)
        fitText(ctx, i ? bawah : atas, { x: x + 18, y: 20, maxWidth: cellW - 36, maxHeight: H - 40, maxSize: 34, font })
      }
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 8
      ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke()
    },
  },

  /** Kotak kosong untuk teks bebas. */
  kosong: {
    draw(ctx, atas, bawah) {
      const g = ctx.createLinearGradient(0, 0, W, H)
      g.addColorStop(0, '#667eea')
      g.addColorStop(1, '#764ba2')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)
      const font = pickFont(['Arial', 'Helvetica', 'DejaVu Sans', 'sans-serif'])
      fitText(ctx, atas, { x: 30, y: 40, maxWidth: W - 60, maxHeight: H - 80, maxSize: 56, font, fill: '#ffffff' })
    },
  },
}

const handler = async (m, { conn }) => {
  const args = m.args || []
  const jenis = (args[0] || '').toLowerCase()

  // Buang nama template dari teks, lalu pisahkan atas|bawah.
  // Contoh: "drake Eh hujan | Goals" → ["Eh hujan", "Goals"]
  const sisa = args.slice(1)
  const [atas = '', bawah = ''] = sisa.join(' ').split('|').map((s) => s.trim())

  const key = templates[jenis] ? jenis : 'kosong'
  const teksAtas = atas || sisa.join(' ').trim() || 'Teks atas'
  const teksBawah = bawah || 'Teks bawah'

  const { canvas, ctx } = makeCanvas(W, H)
  templates[key].draw(ctx, teksAtas, teksBawah)

  await conn.sendMessage(m.chat, {
    image: canvas.toBuffer('image/png'),
    mimetype: 'image/png',
    caption:
      `🎨 Meme *${key}*\n\n` +
      `_Atas: ${teksAtas}_\n` +
      (key === 'drake' || key === 'twobuttons' || key === 'beautiful' ? `_Bawah: ${teksBawah}_\n` : '') +
      `\n_Pisah pakai tanda | . Contoh: ${m.command || 'meme'} drake teks atas | teks bawah_`,
  }, { quoted: m.raw })
}

handler.command = /^(?:maketemplate|template|memekeren)$/i
handler.help = ['maketemplate']
handler.tags = ['canvas', 'image', 'meme']
handler.category = 'canvas'
handler.description = 'Buat meme dari template (drake / twobuttons / beautiful)'
handler.example = ['meme drake Eh raining atau Goals', 'meme twobutton Goals Rebahan']

export default handler
