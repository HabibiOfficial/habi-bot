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

  if (await enforceCooldown(m, 'parkir', 120_000)) return

  const user = getUser(m.sender)
  const staminaCost = 12

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`⚡ Stamina tidak cukup. Butuh *${staminaCost}*, sisa *${user.rpg.stamina}*. Istirahat dulu ya.`)
  }

  user.rpg.stamina -= staminaCost
  await m.react('🅿️')
  await m.reply('🅿️ Mulai narik uang parkir di minimarket...')
  await new Promise((r) => setTimeout(r, 3000))

  const gacha = Math.random()

  if (gacha < 0.1) {
    const denda = Math.floor(Math.random() * 5000) + 1000
    user.koin = Math.max(0, user.koin - denda)
    saveUser(m.sender, user)
    await m.react('🚨')
    return m.reply(`🚨 *Razia Satpol PP!*\n\nUang recehanmu jatuh senilai ${rupiah(denda)}.\n⚡ Stamina: -${staminaCost}`)
  }

  if (gacha > 0.9) {
    const jackpot = Math.floor(Math.random() * 50000) + 20000
    user.koin += jackpot
  trackQuestProgress(user, 'earn', jackpot)
    const expGain = Math.floor(jackpot / 20)
    saveUser(m.sender, user)
    await addExpWithLevelCheck(sock, m, user, expGain)
    await m.react('🤑')
    return m.reply(`🤑 *Jackpot!*\n\nDapat tips besar dari pengunjung.\n💵 Pendapatan: +${rupiah(jackpot)}\n📈 EXP: +${expGain}\n⚡ Stamina: -${staminaCost}`)
  }

  const earning = Math.floor(Math.random() * 8000) + 2000
  user.koin += earning
  trackQuestProgress(user, 'earn', earning)
  const expGain = Math.floor(earning / 20)
  saveUser(m.sender, user)

  await addExpWithLevelCheck(sock, m, user, expGain)

  await m.react('✅')
  await m.reply(`🅿️ *Hasil Markir*\n\n💵 Pendapatan: +${rupiah(earning)}\n📈 EXP: +${expGain}\n⚡ Stamina: -${staminaCost}`)
}

handler.command = /^parkir$/i
handler.help = ['parkir', 'kangparkir', 'markir']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Jadi tukang parkir minimarket'

export default handler
