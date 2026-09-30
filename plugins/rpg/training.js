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
import { sendRpgCard } from '../../lib/rpg/ui.js'

const TRAINING_TYPES = {
  attack: { name: 'Attack Training', stat: 'attack', bonus: [1, 3], exp: 80, staminaCost: 20 },
  defense: { name: 'Defense Training', stat: 'defense', bonus: [1, 2], exp: 70, staminaCost: 15 },
  health: { name: 'Health Training', stat: 'health', bonus: [5, 15], exp: 90, staminaCost: 25 },
  speed: { name: 'Speed Training', stat: 'speed', bonus: [1, 2], exp: 75, staminaCost: 18 },
  luck: { name: 'Luck Training', stat: 'luck', bonus: [1, 2], exp: 85, staminaCost: 22 },
}

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)
  const trainType = (m.args || [])[0]?.toLowerCase()

  if (!trainType) {
    let txt = `🏋️ *Training System*\n\n`
    txt += `⚔️ Attack: *${user.rpg.attack}*\n🛡️ Defense: *${user.rpg.defense}*\n`
    txt += `❤️ Health: *${user.rpg.health}*\n💨 Speed: *${user.rpg.speed}*\n🍀 Luck: *${user.rpg.luck}*\n\n`
    for (const [key, t] of Object.entries(TRAINING_TYPES)) {
      txt += `${t.name} (⚡${t.staminaCost}) → \`${m.prefix}training ${key}\`\n`
    }
    return m.reply(txt)
  }

  const training = TRAINING_TYPES[trainType]
  if (!training) {
    return m.reply(`Jenis training tidak ditemukan. Ketik \`${m.prefix}training\` untuk daftar.`)
  }

  if (user.rpg.stamina < training.staminaCost) {
    return m.reply(`⚡ Stamina kurang. Butuh *${training.staminaCost}*, punya *${user.rpg.stamina}*.`)
  }

  if (await enforceCooldown(m, 'training', 180_000)) return

  user.rpg.stamina -= training.staminaCost

  await m.react('🏋️')
  await m.reply(`🏋️ Latihan ${training.name}...`)
  await new Promise((r) => setTimeout(r, 2500))

  const statBonus = Math.floor(Math.random() * (training.bonus[1] - training.bonus[0] + 1)) + training.bonus[0]
  const currentStat = user.rpg[training.stat]
  user.rpg[training.stat] = currentStat + statBonus

  saveUser(m.sender, user)
  await addExpWithLevelCheck(sock, m, user, training.exp)

  await m.react('💪')
  return sendRpgCard(sock, m, { type: 'training', headerTitle: 'TRAINING', headerSubtitle: training.name, data: { title: 'TRAINING COMPLETE', subtitle: training.name, result: `${currentStat} → ${currentStat + statBonus} (+${statBonus})`, victory: true, stats: [{ label: training.stat, value: `+${statBonus}`, color: '#7765c8' }, { label: 'Stamina', value: `-${training.staminaCost}`, color: '#d25d76' }, { label: 'EXP', value: `+${training.exp}`, color: '#4d8fae' }] }, body: `${training.name}: ${currentStat} → ${currentStat + statBonus} · Stamina -${training.staminaCost} · EXP +${training.exp}` })
}

handler.command = /^(training|train|latihan|workout)$/i
handler.help = ['training', 'train', 'latihan', 'workout']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Latihan untuk meningkatkan stats'

export default handler
