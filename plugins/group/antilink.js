/**
 * ╔══════════════
 * ║  ------ HABI AI --------
 * ║ WA Bot • by Habibih Official ID   
 * ╚══════════════
 * 
 * @author Habibih Official ID
 * @website habibi-store.pages.dev
 * @wa  wa.me/6285181576338
 * @source Habibih Cloud ID - No Comot, No Ganti Nama
 */

import { isOwner } from '../../lib/cek-akses.js'
import { isGroupAdmin } from '../../lib/akses-grup.js'
import { getAntiLinkStatus, setAntiLinkStatus } from '../../core/antilink.js'

function statusText(status) {
  return [
    '╭─〔 ANTI LINK GROUP 〕',
    '│',
    `│ Link Group  : *${status.gc ? 'AKTIF' : 'NONAKTIF'}*`,
    `│ Link Saluran: *${status.ch ? 'AKTIF' : 'NONAKTIF'}*`,
    '│',
    '│ Batas pelanggaran : 3x',
    '│ Admin dan owner : bebas',
    '╰──────────────',
  ].join('\n')
}

const handler = async (m, { conn, usedPrefix }) => {
  if (!m.isGroup) {
    await conn.sendMessage(m.chat, { text: 'Fitur anti-link hanya dapat digunakan di dalam group.' }, { quoted: m.raw })
    return
  }

  const owner = await isOwner(m.sender, conn)
  const admin = owner || await isGroupAdmin(conn, m.chat, m.sender)
  if (!admin) {
    await conn.sendMessage(m.chat, { text: 'Perintah ini hanya dapat diatur oleh owner bot atau admin group.' }, { quoted: m.raw })
    return
  }

  const command = String(m.command || '').toLowerCase()
  const action = String(m.args?.[0] || '').toLowerCase()
  const type = command === 'antilinkgc' ? 'gc' : 'ch'

  if (!['on', 'off', 'aktif', 'enable', 'mati', 'disable', 'status'].includes(action)) {
    const label = type === 'gc' ? 'link group' : 'link saluran WhatsApp'
    await conn.sendMessage(
      m.chat,
      {
        text: [
          `╭─〔 ${command.toUpperCase()} 〕`,
          '│',
          `│ Gunakan untuk mengatur ${label}.`,
          '│',
          `│ ${usedPrefix}${command} on`,
          `│ ${usedPrefix}${command} off`,
          `│ ${usedPrefix}${command} status`,
          '╰──────────────',
        ].join('\n'),
      },
      { quoted: m.raw }
    )
    return
  }

  const current = getAntiLinkStatus(m.chat)
  if (action === 'status') {
    await conn.sendMessage(m.chat, { text: statusText(current) }, { quoted: m.raw })
    return
  }

  const enabled = ['on', 'aktif', 'enable'].includes(action)
  const status = setAntiLinkStatus(m.chat, type, enabled)
  const label = type === 'gc' ? 'Link Group' : 'Link Saluran'

  await conn.sendMessage(
    m.chat,
    {
      text: [
        `╭─〔 ${label.toUpperCase()} 〕`,
        '│',
        `│ Status : *${enabled ? 'AKTIF' : 'NONAKTIF'}*`,
        '│',
        enabled ? '│ Pesan link akan dimoderasi otomatis.' : '│ Moderasi link telah dinonaktifkan.',
        enabled ? '│ Batas pelanggaran : 3x' : '│ Peringatan pelanggaran direset.',
        '╰──────────────',
      ].join('\n'),
    },
    { quoted: m.raw }
  )
}

handler.command = /^(antilinkgc|antilinkch)$/i
handler.help = ['antilinkgc', 'antilinkch']
handler.menuHelp = ['antilinkgc', 'antilinkch']
handler.tags = ['group']
handler.category = 'group'
handler.description = 'Mengatur anti-link group dan saluran WhatsApp'
handler.groupOnly = true

export default handler
