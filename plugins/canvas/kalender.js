/**
 * ╔══════════════════════════════════════════════╗
 * ║  ------ HABI AI --------                      ║
 * ║  WA Bot • by Habibih Official ID             ║
 * ╚══════════════════════════════════════════════╝
 *
 * Kalender Indonesia — render dari nol via Canvas.
 *
 * @author Habibih Official ID
 * @source Habibih Cloud ID
 */

import { makeCanvas, pickFont } from '../../lib/canvas-habi.js'

/**
 * Hari libur Indonesia per tahun, format: bulan → [[tanggal, nama, jenis]]
 * jenis: nasional | agama | cuti
 *
 * CATATAN: tanggal hijriah (Nyepi, Idul Fitri, Idul Adha, Maulid,
 * Isra Mikraj) ditentukan Penetapan Government dan bisa bergeser
 * satu hari. Sebelum dipakai untuk keperluan resmi, cocokkan dengan
 * Surat Keputusan Menteri Agama dan Surat Keputusan Menteri Koordinator
 * Bidang Perekonomian mengenai hari libur yang berlaku. Data di bawah
 * adalah estimasi dan perlu diverifikasi.
 */
const LIBUR = {
  2026: {
    1: [[1, 'Tahun Baru Masehi', 'nasional']],
    2: [[16, 'Isra Mikraj Nabi Muhammad', 'agama'], [17, 'Isra Mikraj (cuti bersama)', 'cuti']],
    3: [[19, 'Hari Raya Nyepi 1928 Saka', 'agama'], [20, 'Idul Fitri 1447 H', 'agama'], [21, 'Idul Fitri (cuti bersama)', 'cuti'], [23, 'Idul Fitri 1447 H', 'agama'], [24, 'Idul Fitri (cuti bersama)', 'cuti']],
    4: [[3, 'Wafat Isa Almasih', 'agama'], [5, 'Paskah', 'agama']],
    5: [[1, 'Hari Buruh Internasional', 'nasional'], [14, 'Kenaikan Isa Almasih', 'agama'], [27, 'Idul Adha 1447 H', 'agama'], [28, 'Idul Adha (cuti bersama)', 'cuti'], [31, 'Hari Lahir Pancasila', 'nasional']],
    6: [[1, 'Hari Lahir Pancasila', 'nasional'], [2, 'Hari Lahir Pancasila (cuti bersama)', 'cuti']],
    8: [[17, 'Hari Kemerdekaan RI', 'nasional']],
    9: [[25, 'Maulid Nabi Muhammad 1447 H', 'agama']],
    12: [[25, 'Hari Raya Natal', 'agama'], [26, 'Hari Raya Natal (cuti bersama)', 'cuti']],
  },
  2025: {
    1: [[1, 'Tahun Baru Masehi', 'nasional']],
    3: [[29, 'Sukses Idulfitri', 'nasional'], [31, 'Idul Fitri 1446 H', 'agama']],
    4: [[18, 'Wafat Isa Almasih', 'agama'], [20, 'Paskah', 'agama'], [21, 'Paskah (cuti bersama)', 'cuti']],
    5: [[1, 'Hari Buruh Internasional', 'nasional'], [12, 'Idul Adha 1446 H', 'agama'], [29, 'Kenaikan Isa Almasih', 'agama'], [30, 'Kenaikan Isa Almasih (cuti bersama)', 'cuti']],
    6: [[1, 'Hari Lahir Pancasila', 'nasional'], [2, 'Cuti bersama Hari Lahir Pancasila', 'cuti'], [7, 'Hari Raya Idul Adha 1446 H', 'agama']],
    8: [[17, 'Hari Kemerdekaan RI', 'nasional']],
    12: [[25, 'Hari Raya Natal', 'agama'], [26, 'Hari Raya Natal (cuti bersama)', 'cuti']],
  },
  2027: {
    1: [[1, 'Tahun Baru Masehi', 'nasional'], [2, 'Tahun Baru Masehi (cuti bersama)', 'cuti']],
    2: [[5, 'Isra Mikraj Nabi Muhammad', 'agama'], [6, 'Isra Mikraj (cuti bersama)', 'cuti']],
    3: [[9, 'Hari Raya Nyepi', 'agama'], [10, 'Idul Fitri 1448 H', 'agama'], [11, 'Idul Fitri (cuti bersama)', 'cuti'], [12, 'Idul Fitri 1448 H', 'agama'], [13, 'Idul Fitri (cuti bersama)', 'cuti']],
    4: [[3, 'Wafat Isa Almasih', 'agama'], [5, 'Paskah', 'agama'], [26, 'Idul Adha 1448 H', 'agama'], [27, 'Idul Adha (cuti bersama)', 'cuti']],
    5: [[1, 'Hari Buruh Internasional', 'nasional'], [6, 'Hari Raya Idul Adha 1448 H', 'agama'], [27, 'Kenaikan Isa Almasih', 'agama'], [31, 'Hari Lahir Pancasila', 'nasional']],
    6: [[1, 'Hari Lahir Pancasila', 'nasional']],
    8: [[17, 'Hari Kemerdekaan RI', 'nasional']],
    9: [[15, 'Maulid Nabi Muhammad 1448 H', 'agama']],
    12: [[25, 'Hari Raya Natal', 'agama'], [26, 'Hari Raya Natal (cuti bersama)', 'cuti']],
  },
}

const BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
const HARI = ['Min','Sen','Sel','Rab','Kam','Jum','Sab']
const WARNA = { nasional: '#e53935', agama: '#8e24aa', cuti: '#fb8c00' }

const daysInMonth = (y, m) => new Date(y, m, 0).getDate()

function renderBulan(y, m) {
  const W = 1000
  const H = 800
  const { canvas, ctx } = makeCanvas(W, H, '#ffffff')
  const font = pickFont(['Arial', 'Helvetica', 'DejaVu Sans', 'sans-serif'])

  ctx.fillStyle = '#075e54'
  ctx.fillRect(0, 0, W, 130)
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold 46px ${font}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(`${BULAN[m - 1]} ${y}`, W / 2, 62)

  const startY = 185
  const left = 40
  const colW = (W - left * 2) / 7
  ctx.font = `bold 24px ${font}`
  ctx.fillStyle = '#546e7a'
  HARI.forEach((h, i) => ctx.fillText(h, left + colW * i + colW / 2, startY))

  const firstDow = new Date(y, m - 1, 1).getDay()
  const cellH = 96
  ctx.textBaseline = 'top'

  for (let day = 1; day <= daysInMonth(y, m); day++) {
    const idx = firstDow + day - 1
    const col = idx % 7
    const row = Math.floor(idx / 7)
    const x = left + col * colW
    const yTop = startY + 26 + row * cellH
    const libur = (LIBUR[y]?.[m] || []).find((h) => h[0] === day)

    if (libur) {
      ctx.fillStyle = WARNA[libur[2]] + '22'
      ctx.fillRect(x + 3, yTop + 2, colW - 6, cellH - 12)
      ctx.fillStyle = WARNA[libur[2]]
    } else {
      ctx.fillStyle = col === 0 ? '#ef5350' : '#263238'
    }

    ctx.font = `bold 30px ${font}`
    ctx.textAlign = 'center'
    ctx.fillText(String(day), x + colW / 2, yTop + 8)
  }

  // Legenda
  let lx = left
  const ly = H - 22
  ctx.font = `16px ${font}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  for (const [k, label] of Object.entries({ nasional: 'Nasional', agama: 'Agama', cuti: 'Cuti bersama' })) {
    ctx.fillStyle = WARNA[k]
    ctx.fillRect(lx, ly - 7, 14, 14)
    ctx.fillStyle = '#546e7a'
    ctx.fillText(label, lx + 20, ly)
    lx += 130
  }

  return canvas
}

function renderTahun(y) {
  const W = 1400
  const H = 1040
  const { canvas, ctx } = makeCanvas(W, H, '#eceff1')
  const font = pickFont(['Arial', 'Helvetica', 'DejaVu Sans', 'sans-serif'])

  ctx.fillStyle = '#075e54'
  ctx.fillRect(0, 0, W, 110)
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold 44px ${font}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(`Kalender Indonesia ${y}`, W / 2, 55)

  const cols = 4
  const rows = 3
  const gridTop = 120
  const gridH = H - gridTop - 46      // sisakan ruang untuk legenda
  const cellW = W / cols
  const cellH = gridH / rows

  for (let m = 1; m <= 12; m++) {
    const cx = ((m - 1) % cols) * cellW
    const cy = gridTop + Math.floor((m - 1) / cols) * cellH

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(cx + 4, cy + 4, cellW - 8, cellH - 8)

    ctx.fillStyle = '#075e54'
    ctx.font = `bold 20px ${font}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(BULAN[m - 1], cx + cellW / 2, cy + 24)

    const firstDow = new Date(y, m - 1, 1).getDay()
    const d = daysInMonth(y, m)
    const startX = cx + 14
    const startY = cy + 56
    const dx = (cellW - 28) / 7
    const dy = (cellH - 72) / 6

    ctx.font = `12px ${font}`
    ctx.fillStyle = '#90a4ae'
    HARI.forEach((h, i) => ctx.fillText(h, startX + dx * i + dx / 2, startY - 12))

    ctx.textBaseline = 'top'
    for (let day = 1; day <= d; day++) {
      const idx = firstDow + day - 1
      const col = idx % 7
      const row = Math.floor(idx / 7)
      const libur = (LIBUR[y]?.[m] || []).find((h) => h[0] === day)
      ctx.fillStyle = libur ? WARNA[libur[2]] : (col === 0 ? '#ef5350' : '#37474f')
      ctx.font = `${libur ? 'bold ' : ''}13px ${font}`
      ctx.fillText(String(day), startX + dx * col + dx / 2, startY + dy * row + 2)
    }
  }

  let lx = 20
  const ly = H - 18
  ctx.font = `14px ${font}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  for (const [k, label] of Object.entries({ nasional: 'Nasional', agama: 'Agama', cuti: 'Cuti bersama' })) {
    ctx.fillStyle = WARNA[k]
    ctx.fillRect(lx, ly - 7, 12, 12)
    ctx.fillStyle = '#455a64'
    ctx.fillText(label, lx + 17, ly)
    lx += 120
  }

  return canvas
}

const handler = async (m, { conn, usedPrefix }) => {
  const tahun = Number(m.args[0]) || new Date().getFullYear()
  const bulanArg = m.args[1]

  if (!LIBUR[tahun]) {
    return m.reply(`❌ Data libur ${tahun} belum tersedia.\n\nTahun tersedia: ${Object.keys(LIBUR).join(', ')}`)
  }

  let canvas
  if (bulanArg && /^\d{1,2}$/.test(bulanArg)) {
    const bulan = Number(bulanArg)
    if (bulan < 1 || bulan > 12) return m.reply('❌ Bulan harus 1–12.')
    canvas = renderBulan(tahun, bulan)
  } else {
    canvas = renderTahun(tahun)
  }

  const buffer = canvas.toBuffer('image/png')
  await conn.sendMessage(m.chat, {
    image: buffer,
    mimetype: 'image/png',
    caption:
      `📅 *Kalender ${tahun}*\n\n` +
      `_Ketik ${usedPrefix}kalender ${tahun} 12 untuk satu bulan._\n` +
      `_🔴 Nasional · 🟣 Agama · 🟠 Cuti bersama_\n` +
      `_Tanggal hijriah estimasi — cek SK resmi untuk keperluan resmi._`,
  }, { quoted: m.raw })
}

handler.command = /^(?:kalender|kalenderindonesia|calender)$/i
handler.help = ['kalender']
handler.tags = ['canvas', 'tools', 'indonesia']
handler.category = 'canvas'
handler.description = 'Kalender Indonesia beserta hari libur nasional'
handler.example = ['kalender', 'kalender 2026', 'kalender 2026 12']

export default handler
