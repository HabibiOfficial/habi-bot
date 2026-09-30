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


const handler = async (m, { conn }) => {
  const metadata = await conn.groupMetadata(m.chat)
  const admins = metadata.participants.filter((p) => p.admin).length

  const text = [
    `*${metadata.subject}*`,
    '',
    `Anggota  : ${metadata.participants.length}`,
    `Admin    : ${admins}`,
    `Dibuat   : ${new Date(metadata.creation * 1000).toLocaleDateString('id-ID')}`,
    metadata.desc ? `\nDeskripsi:\n${metadata.desc}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  await conn.sendMessage(m.chat, { text }, { quoted: m.raw })
}

handler.command = /^groupinfo$/i
handler.help = ['groupinfo']
handler.tags = ['group']
handler.description = 'Menampilkan informasi group'
handler.groupOnly = true

export default handler
