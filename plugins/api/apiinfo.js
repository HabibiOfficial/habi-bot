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
 * Info & status koneksi ke REST API Habibih Cloud ID.
 */

import { apiJson, isApiEnabled, COMMANDS } from '../../lib/habi-api.js'

const BASE = String(
  process.env.HABI_API_URL || 'https://api.habibicloudserver.dpdns.org'
).replace(/\/+$/, '')

const handler = async (m, { conn }) => {
  let status = 'tidak diketahui'
  let uptime = null
  let note = ''

  try {
    const res = await fetch(`${BASE}/healthz`, { signal: AbortSignal.timeout(10000) })
    const body = await res.json()
    status = body.status ? 'ONLINE ✅' : 'OFFLINE ❌'
    uptime = body.uptime
  } catch (err) {
    status = 'TIDAK BISA DIHUBUNGI ❌'
    note = err?.message || ''
  }

  const list = Object.keys(COMMANDS).map(k => `• \`%${k}\``).join('\n')

  const text = [
    '╭───〔 🌐 HABI API 〕',
    '│',
    `│ Status : ${status}`,
    uptime !== null ? `│ Uptime : ${Math.round(uptime / 60)} menit` : null,
    `│ Server : ${BASE}`,
    '│',
    '│ Perintah yang bisa dipakai:',
    list,
    '│',
    '│ Contoh:',
    '│   %iqc Halo dunia',
    '│   %replyyx Jalur ctx',
    '╰──────────────',
  ].filter(Boolean).join('\n')

  return conn.sendMessage(m.chat, { text }, { quoted: m.raw })
}

handler.command = /^(?:apistatus|apihub)$/i
handler.help = ['apistatus']
handler.tags = ['api', 'tools']
handler.category = 'api'
handler.description = 'Cek status koneksi ke REST API HABI'

export default handler
