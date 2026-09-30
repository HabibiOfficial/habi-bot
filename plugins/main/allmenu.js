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

import fs from 'fs'
import { settings } from '../../config/settings.js'
import { buildFullMenuText } from '../../lib/menu.js'
import { ButtonV2 } from '../../lib/tombol.js'
import { isOwner, resolvePhoneNumber } from '../../lib/cek-akses.js'
import { getUser } from '../../core/database-user.js'

const handler = async (m, { conn, usedPrefix }) => {
  const isOwnerUser = await isOwner(m.sender, conn)
  const user = await getUser(m.sender)
  const contactNumber = await resolvePhoneNumber(m.sender, conn)

  const fullText = buildFullMenuText({
    prefix: usedPrefix,
    pushName: m.pushName,
    contactNumber,
    isOwnerUser,
    registeredAt: user?.registeredAt,
  })

  const button = new ButtonV2(conn)
    .setBody(' ') .setFooter(fullText) 

  const thumbnailPath = './assets/image/habibih.jpg'
  if (fs.existsSync(thumbnailPath)) {
    button.setThumbnail(fs.readFileSync(thumbnailPath))
  } else {
    console.log(`  \x1b[31m✗\x1b[0m  Thumbnail tidak ditemukan: ${thumbnailPath}`)
  }

  button.addButton('⌂ MENU UTAMA', `${usedPrefix}menu`)

  await button.send(m.chat, { quoted: m.raw })
}

handler.command = /^allmenu$/i
handler.help = ['allmenu']
handler.tags = ['main']
handler.description = 'Menampilkan seluruh menu dalam satu tampilan lengkap'

export default handler