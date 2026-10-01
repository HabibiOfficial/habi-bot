/**
 * ╔══════════════════════════════════════════════╗
 * ║  ------ HABI AI --------                      ║
 * ║  WA Bot • by Habibih Official ID             ║
 * ╚══════════════════════════════════════════════╝
 *
 * System Info — render statistik server ke PNG.
 * Berbeda dari .ping (ringkas), ini menampilkan disk
 * dan penggunaan memori per modul.
 *
 * @author Habibih Official ID
 * @source Habibih Cloud ID
 */

import os from 'node:os'
import fs from 'node:fs'
import { makeCanvas, fitText, pickFont, roundRect } from '../../lib/canvas-habi.js'

const W = 1000
const H = 760

const bytes = (n) => {
  if (!Number.isFinite(n) || n <= 0) return '0 B'
  const u = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0
  let x = n
  while (x >= 1024 && i < u.length - 1) { x /= 1024; i++ }
  return `${x.toFixed(i >= 2 ? 1 : 0)} ${u[i]}`
}

const bar = (ctx, x, y, w, h, pct, warna) => {
  ctx.fillStyle = 'rgba(255,255,255,0.10)'
  roundRect(ctx, x, y, w, h, h / 2)
  ctx.fill()
  const p = Math.max(0, Math.min(1, pct))
  if (p > 0) {
    ctx.fillStyle = warna
    roundRect(ctx, x, y, Math.max(h, w * p), h, h / 2)
    ctx.fill()
  }
}

const handler = async (m, { conn }) => {
  const font = pickFont(['Arial', 'Helvetica', 'DejaVu Sans', 'sans-serif'])
  const { canvas, ctx } = makeCanvas(W, H, '#0f141a')
  const mem = process.memoryUsage()
  const totalMem = os.totalmem()
  const freeMem = os.freemem()
  const load = os.loadavg()
  const cores = (os.cpus() || []).length || 1

  // cpu teratas
  const cpuList = (os.cpus() || []).slice(0, 3)
  const cpuPersen = (list) => {
    const total = list.reduce((a, c) => a + Object.values(c.times).reduce((x, y) => x + y, 0), 0)
    const idle = list.reduce((a, c) => a + c.times.idle, 0)
    return total ? Math.max(0, Math.min(1, 1 - idle / total)) : 0
  }
  const cpu0 = cpuPersen(os.cpus() || [])

  // disk
  let disk = { size: 0, free: 0 }
  try {
    const st = fs.statfsSync(process.cwd())
    disk = {
      size: Number(st.blocks) * Number(st.bsize),
      free: Number(st.bavail) * Number(st.bsize),
    }
  } catch { /* filesystem tidak mendukung statfs */ }
  const diskUsedPct = disk.size ? (disk.size - disk.free) / disk.size : 0

  const ramPct = 1 - freeMem / totalMem

  // header
  const g = ctx.createLinearGradient(0, 0, W, 200)
  g.addColorStop(0, '#00a884')
  g.addColorStop(1, '#075e54')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, 150)
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold 40px ${font}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('System Info', 50, 62)
  ctx.font = `22px ${font}`
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.fillText(`${os.hostname()}  ·  Node ${process.version}  ·  ${cores} core`, 50, 106)

  const kartu = (x, y, w, h, judul, nilai, pct, warna, catatan = '') => {
    ctx.fillStyle = '#161b22'
    roundRect(ctx, x, y, w, h, 18)
    ctx.fill()
    ctx.fillStyle = '#8b949e'
    ctx.font = `20px ${font}`
    ctx.textAlign = 'left'
    ctx.fillText(judul, x + 26, y + 34)
    ctx.fillStyle = '#e6edf3'
    ctx.font = `bold 34px ${font}`
    ctx.fillText(nilai, x + 26, y + 82)
    if (pct !== null && pct !== undefined) {
      bar(ctx, x + 26, y + 108, w - 52, 12, pct, warna)
      if (catatan) {
        ctx.fillStyle = '#8b949e'
        ctx.font = `17px ${font}`
        ctx.fillText(catatan, x + 26, y + 142)
      }
    }
  }

  // dua baris, dua kolom
  kartu(40, 190, 450, 180, 'CPU', `${Math.round(cpu0 * 100)}%`, cpu0, '#58a6ff',
    `load ${load.map((v) => v.toFixed(2)).join(' / ')}`)
  kartu(510, 190, 450, 180, 'RAM', bytes(mem.rss), ramPct, '#3fb950',
    `sistem ${bytes(freeMem)} bebas / ${bytes(totalMem)}`)
  kartu(40, 400, 450, 180, 'Disk', disk.size ? bytes(disk.size - disk.free) : 'n/a',
    disk.size ? diskUsedPct : null, '#d29922',
    disk.size ? `${bytes(disk.free)} bebas dari ${bytes(disk.size)}` : '')
  kartu(510, 400, 450, 180, 'Heap', bytes(mem.heapUsed), mem.heapTotal ? mem.heapUsed / mem.heapTotal : null,
    '#bc8cff', `dari ${bytes(mem.heapTotal)}`)

  // footer
  ctx.fillStyle = '#8b949e'
  ctx.font = `20px ${font}`
  ctx.textAlign = 'left'
  const up = Math.floor(process.uptime() / 3600)
  const mn = Math.floor((process.uptime() % 3600) / 60)
  ctx.fillText(`Uptime ${up}j ${mn}m  ·  PID ${process.pid}  ·  Platform ${os.platform()} ${os.arch()}`, 40, 640)

  ctx.fillStyle = 'rgba(0,168,132,0.15)'
  roundRect(ctx, 40, 672, W - 80, 56, 14)
  ctx.fill()
  ctx.fillStyle = '#3fb950'
  ctx.font = `bold 22px ${font}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('●  BOT ONLINE — HABIBIH CLOUD ID', W / 2, 700)

  await conn.sendMessage(m.chat, {
    image: canvas.toBuffer('image/png'),
    mimetype: 'image/png',
    caption: '🖥️ *System Info*\n\n_Render dari server tempat bot berjalan._',
  }, { quoted: m.raw })
}

handler.command = /^(?:sysinfo|systeminfo|statsserver)$/i
handler.help = ['sysinfo']
handler.tags = ['canvas', 'tools', 'server']
handler.category = 'canvas'
handler.description = 'Statistik server (CPU/RAM/disk/heap) jadi gambar'
handler.example = ['sysinfo']

export default handler
