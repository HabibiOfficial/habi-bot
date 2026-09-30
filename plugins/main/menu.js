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
import { buildMenuFooter, buildCategoryList, getGreeting } from '../../lib/menu.js'
import { ButtonV2 } from '../../lib/tombol.js'
import { isOwner, resolvePhoneNumber } from '../../lib/cek-akses.js'
import { getUser } from '../../core/database-user.js'
import { creatorWatermark } from '../../core/identitas.js'

const handler = async (m, { conn, usedPrefix }) => {
  const isOwnerUser = await isOwner(m.sender, conn)
  const user = await getUser(m.sender)
  const contactNumber = await resolvePhoneNumber(m.sender, conn)


  const footerLong = buildMenuFooter({
    prefix: usedPrefix,
    pushName: m.pushName,
    contactNumber,
    isOwnerUser,
    registeredAt: user?.registeredAt,
  }) + '\n\n' + creatorWatermark()


  const rawSections = buildCategoryList({ prefix: usedPrefix }).sections
  const sections = rawSections.map((section) => ({
    title: section.title,
    highlight_label: section.highlightLabel || '',
    rows: section.rows.map((row) => ({
      header: row.header || '',
      title: row.title,
      description: row.description || '',
      id: row.command,
    })),
  }))

  const button = new ButtonV2(conn)
    .setBody(' ') .setFooter(footerLong)

  const thumbnailPath = './assets/image/habibih.jpg'
  if (fs.existsSync(thumbnailPath)) {
    button.setThumbnail(fs.readFileSync(thumbnailPath))
  } else {
    console.log(`  \x1b[31m✗\x1b[0m  Thumbnail tidak ditemukan: ${thumbnailPath}`)
  }

  button.addButton('♕ OWNER BOT', `${usedPrefix}owner`)

  button.addRawButton({
    buttonText: { displayText: '☰ LIST MENU' },
    buttonId: 'menu',
    type: 1,
    nativeFlowInfo: {
      name: 'single_select',
      paramsJson: JSON.stringify({
        title: `${settings.botName} Menu`,
        sections: sections,
      }),
    },
  })

  await button.send(m.chat, { quoted: m.raw })

  // Audio dikirim SESUDAH tombol menu, bukan sebelumnya.
  // Dulu audio dikirim lebih dulu sehingga suara/menu muncul di atas
  // dan menutupi tombol; sekarang audio ada di bawahnya.
  const audioPath = './assets/audio/habibih.mp3'
  if (fs.existsSync(audioPath)) {
    await conn.sendMessage(
      m.chat,
      {
        audio: fs.readFileSync(audioPath),
        mimetype: 'audio/mp4',
        ptt: false,
      },
      { quoted: m.raw }
    )
  }
}

handler.command = /^menu$/i
handler.help = ['menu']
handler.tags = ['main']
handler.description = 'Menampilkan menu utama bot'

export default handler