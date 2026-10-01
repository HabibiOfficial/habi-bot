/**
 * ╔══════════════
 * ║  ------ HABI AI --------
 * ║ WA Bot • by Habibih Official ID
 * ╚══════════════
 *
 * @author Habibih Official ID
 * @website habibi-store.pages.dev
 * @wa  wa.me/6285181576338
 */

import { getUser, saveUser } from '../../lib/rpg/database.js'
import { buildRpgContext } from '../../lib/rpg/context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/level.js'
import { enforceCooldown } from '../../lib/rpg/cooldown.js'
import { rupiah } from '../../lib/rpg/format.js'
import { trackQuestProgress } from '../../lib/rpg/quest-progress.js'

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)

  if (await enforceCooldown(m, 'freelance', 200_000)) return

  const user = getUser(m.sender)
  const staminaCost = 25

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`⚡ Stamina tidak cukup. Butuh *${staminaCost}*, sisa *${user.rpg.stamina}*. Istirahat dulu ya.`)
  }

  user.rpg.stamina -= staminaCost
  await m.react('💻')
  await m.reply('💻 Mengerjakan project untuk klien...')
  await new Promise((r) => setTimeout(r, 4000))

  const gacha = Math.random()

  if (gacha < 0.2) {
    saveUser(m.sender, user)
    await m.react('📉')
    return m.reply(`Klien menghilang tanpa bayar. Project sudah dikerjakan, hasilnya nihil.\n⚡ Stamina: -${staminaCost}`)
  }

  if (gacha > 0.85) {
    const dollarRate = 16000
    const payment = Math.floor(Math.random() * 10) + 5
    const totalRupiah = payment * dollarRate

    user.koin += totalRupiah
  trackQuestProgress(user, 'earn', totalRupiah)
    const expGain = Math.floor(totalRupiah / 30)
    saveUser(m.sender, user)
    await addExpWithLevelCheck(sock, m, user, expGain)

    await m.react('💸')
    return m.reply(
      `💸 *Klien Luar Negeri Puas!*\n\nDibayar $${payment}.\n💵 Bayaran: +${rupiah(totalRupiah)}\n📈 EXP: +${expGain}\n⚡ Stamina: -${staminaCost}`
    )
  }

  const earning = Math.floor(Math.random() * 40000) + 15000
  user.koin += earning
  trackQuestProgress(user, 'earn', earning)
  const expGain = Math.floor(earning / 20)
  saveUser(m.sender, user)

  await addExpWithLevelCheck(sock, m, user, expGain)

  await m.react('✅')
  await m.reply(`✅ *Project Selesai*\n\n💵 Bayaran: +${rupiah(earning)}\n📈 EXP: +${expGain}\n⚡ Stamina: -${staminaCost}`)
}

handler.command = /^freelance$/i
handler.help = ['freelance', 'koding']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Mengerjakan project freelance online'

export default handler
