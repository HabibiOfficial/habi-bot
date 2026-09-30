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


import { setPrefix, resetPrefix } from '../../core/prefix.js'

const handler = async (m, { conn, usedPrefix }) => {
  const newPrefix = m.args[0]

  if (!newPrefix) {
    await conn.sendMessage(
      m.chat,
      { text: `Prefix aktif saat ini: *${usedPrefix}*\n\nCara pakai:\n${usedPrefix}setprefix <prefix_baru>\n${usedPrefix}setprefix default` },
      { quoted: m.raw }
    )
    return
  }

  if (newPrefix.toLowerCase() === 'default') {
    const reverted = await resetPrefix(m.chat)
    await conn.sendMessage(m.chat, { text: `Prefix dikembalikan ke default: *${reverted}*` }, { quoted: m.raw })
    return
  }

  if (newPrefix.length > 3) {
    await conn.sendMessage(m.chat, { text: 'Prefix maksimal 3 karakter.' }, { quoted: m.raw })
    return
  }

  await setPrefix(m.chat, newPrefix)
  await conn.sendMessage(
    m.chat,
    { text: `Prefix berhasil diubah menjadi: *${newPrefix}*\n\nContoh: ${newPrefix}menu` },
    { quoted: m.raw }
  )
}

handler.command = /^setprefix$/i
handler.help = ['setprefix']
handler.tags = ['owner']
handler.description = 'Mengubah prefix bot untuk chat ini'
handler.ownerOnly = true

export default handler
