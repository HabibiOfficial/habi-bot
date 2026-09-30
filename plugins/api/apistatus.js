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
 * * Cek status koneksi ke REST API HABI
 */

import { apiJson } from '../../lib/habi-api.js'
import { fail, needText, needUrl, react, sendText } from '../../lib/api-helpers.js'

const handler = async (m, { conn }) => {
  try {
  const d = await apiJson('/api/detect', { url: 'https://vm.tiktok.com/x' })
  const base = String(process.env.HABI_API_URL || 'https://api.habibicloudserver.dpdns.org')
  await sendText(conn, m, [
    'REST API HABI', '',
    'Status : ' + (d.status ? 'ONLINE' : 'OFFLINE'),
    'Server : ' + base,
    'Kunci  : ' + (process.env.HABI_API_KEY ? 'dari .env' : 'otomatis (register)'),
    '', 'Perintah:',
    '  .iqc        screenshot chat iPhone',
    '  .reply      fake balasan chat',
    '  .meme       meme dari URL gambar',
    '  .watermark  watermark foto',
    '  .brat       gambar brat',
    '  .bratvid    brat jadi video',
    '  .welcomecard kartu sambutan',
    '  .ytsearch   cari YouTube',
    '  .ytinfo     metadata video',
    '  .spotify    Spotify ke YouTube',
    '  .apiget     link media TikTok/FB/IG/X',
    '  .apikirim   kirim video ke chat',
    '  .ig         link Instagram',
    '  .getfile    unduh file',
    '  .translate  terjemahkan',
    '  .ocr        baca teks gambar',
    '  .ssweb      screenshot website',
    '  .webfetch   baca isi web',
    '  .removebg   hapus background',
    '  .phonespec  spek HP',
    '  .phonecompare banding 2 HP',
    '  .lirik      cari lirik',
    '  .ttsapi     teks jadi suara',
    '  .pdfcompress kompres PDF',
    '  .humanizer  tulis ulang teks AI',
  ].join('\n'))
    await react(conn, m, '✅')
  } catch (error) {
    await fail(conn, m, error)
  }
}

handler.command = /^(?:apistatus|apihub)$/i
handler.help = ["apistatus"]
handler.tags = ["api","tools"]
handler.category = 'api'
handler.description = "Cek status koneksi ke REST API HABI"

export default handler
