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
import { buildCategoryText } from '../../lib/menu.js'
import { getPluginsByCategory } from '../../core/pemuat-plugin.js'
import { ButtonV2 } from '../../lib/tombol.js'
import { isOwner, resolvePhoneNumber } from '../../lib/cek-akses.js'
import { getUser } from '../../core/database-user.js'

const handler = async (m, { conn, usedPrefix }) => {
  const categoryKey = m.args[0]

  if (!categoryKey || !getPluginsByCategory(categoryKey).length) {
    await conn.sendMessage(
      m.chat,
      { text: `Kategori tidak ditemukan. Ketik ${usedPrefix}menu untuk melihat daftar kategori yang tersedia.` },
      { quoted: m.raw }
    )
    return
  }

  const isOwnerUser = await isOwner(m.sender, conn)
  const user = await getUser(m.sender)
  const contactNumber = await resolvePhoneNumber(m.sender, conn)

  const categoryText = buildCategoryText(categoryKey, {
    prefix: usedPrefix,
    pushName: m.pushName,
    contactNumber,
    isOwnerUser,
    registeredAt: user?.registeredAt,
  })

  const button = new ButtonV2(conn)
    .setBody(' ')
    .setFooter(categoryText) 

  const thumbnailPath = './assets/image/habibih.jpg'
  if (fs.existsSync(thumbnailPath)) {
    button.setThumbnail(fs.readFileSync(thumbnailPath))
  } else {
    console.log(`  \x1b[31m✗\x1b[0m  Thumbnail tidak ditemukan: ${thumbnailPath}`)
  }

  button.addButton('❀ SEMUA MENU', `${usedPrefix}allmenu`)

  await button.send(m.chat, { quoted: m.raw })
}

handler.command = /^kategori$/i
handler.help = ['kategori']
handler.tags = ['main']
handler.description = 'Menampilkan detail fitur dalam satu kategori'

export default handler
