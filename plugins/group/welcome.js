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

import { isOwner, normalizeNumber, resolvePhoneNumber } from '../../lib/cek-akses.js'
import { isWelcomeEnabled, setWelcomeEnabled } from '../../core/welcome.js'

function participantMatches(a, b) {
  const left = normalizeNumber(a)
  const right = normalizeNumber(b)
  return Boolean(left && right && left === right)
}

export async function isGroupAdmin(conn, groupId, senderJid) {
  if (!groupId?.endsWith('@g.us') || !senderJid) return false

  try {
    const metadata = await conn.groupMetadata(groupId)
    const senderPhone = await resolvePhoneNumber(senderJid, conn)
    let sender = null

    for (const participant of metadata.participants || []) {
      if (participant.id === senderJid || participantMatches(participant.id, senderJid)) {
        sender = participant
        break
      }

      if (participant.lid && participantMatches(participant.lid, senderJid)) {
        sender = participant
        break
      }

      try {
        const participantPhone = await resolvePhoneNumber(participant.id, conn)
        if (participantMatches(participantPhone, senderPhone)) {
          sender = participant
          break
        }
      } catch {
      }
    }

    return Boolean(sender?.admin === 'admin' || sender?.admin === 'superadmin' || sender?.isAdmin)
  } catch (err) {
    console.log(`  \x1b[33m⚠\x1b[0m  Gagal memeriksa admin group: ${err.message}`)
    return false
  }
}

const handler = async (m, { conn, usedPrefix }) => {
  if (!m.isGroup) {
    await conn.sendMessage(m.chat, { text: 'Fitur welcome hanya dapat digunakan di dalam group.' }, { quoted: m.raw })
    return
  }

  const owner = await isOwner(m.sender, conn)
  const admin = owner || await isGroupAdmin(conn, m.chat, m.sender)

  if (!admin) {
    await conn.sendMessage(
      m.chat,
      { text: 'Perintah ini hanya dapat diatur oleh *owner bot* atau *admin group*.' },
      { quoted: m.raw }
    )
    return
  }

  const action = String(m.args?.[0] || '').toLowerCase()
  const current = isWelcomeEnabled(m.chat)

  if (action === 'on' || action === 'aktif' || action === 'enable') {
    setWelcomeEnabled(m.chat, true)
    await conn.sendMessage(
      m.chat,
      {
        text: [
          '╭─〔 WELCOME GROUP 〕',
          '│',
          '│ Status : *AKTIF*',
          '│',
          '│ Member baru akan mendapatkan',
          '│ sambutan otomatis saat bergabung.',
          '│ Member yang keluar juga akan',
          '│ mendapatkan pesan goodbye.',
          '│',
          `│ Matikan : *${usedPrefix}welcome off*`,
          '╰──────────────',
        ].join('\n'),
      },
      { quoted: m.raw }
    )
    return
  }

  if (action === 'off' || action === 'mati' || action === 'disable') {
    setWelcomeEnabled(m.chat, false)
    await conn.sendMessage(
      m.chat,
      {
        text: [
          '╭─〔 WELCOME GROUP 〕',
          '│',
          '│ Status : *NONAKTIF*',
          '│',
          '│ Sambutan join dan goodbye',
          '│ otomatis telah dimatikan.',
          '│',
          `│ Aktifkan : *${usedPrefix}welcome on*`,
          '╰──────────────',
        ].join('\n'),
      },
      { quoted: m.raw }
    )
    return
  }

  const status = current ? 'AKTIF ✓' : 'NONAKTIF ✕'
  await conn.sendMessage(
    m.chat,
    {
      text: [
        '╭─〔 WELCOME GROUP 〕',
        '│',
        `│ Status : *${status}*`,
        '│',
        '│ Gunakan perintah:',
        `│ • ${usedPrefix}welcome on`,
        `│ • ${usedPrefix}welcome off`,
        `│ • ${usedPrefix}welcome status`,
        '│',
        '│ Hanya owner bot atau admin',
        '│ group yang dapat mengubahnya.',
        '╰──────────────',
      ].join('\n'),
    },
    { quoted: m.raw }
  )
}

handler.command = /^welcome$/i
handler.help = ['welcome']
handler.tags = ['group']
handler.description = 'Mengaktifkan atau menonaktifkan welcome & goodbye group'
handler.groupOnly = true

export default handler
