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

import { getUser } from '../../lib/rpg/database.js'
import { buildRpgContext } from '../../lib/rpg/context.js'
import { getRole } from '../../lib/rpg/level.js'
import { rupiah, number } from '../../lib/rpg/format.js'
import { getActiveBuffs } from '../../lib/rpg/buffs.js'
import { sendRpgCard } from '../../lib/rpg/ui.js'

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const target = m.targetJid || m.sender
  const user = getUser(target)
  const buffs = getActiveBuffs(user)
  const buffNames = Object.entries(buffs).map(([key, buff]) => `${key}: ${Math.ceil((buff.expiresAt - Date.now()) / 60000)}m`).filter(Boolean)
  let avatarUrl = null
  try {
    avatarUrl = await sock.profilePictureUrl(target, 'image')
  } catch {
  }
  const displayName = target === m.sender ? (m.pushName || 'Player') : `@${target.split('@')[0]}`
  const body = [
    `Pasangan: ${user.rpg.spouse ? '@' + String(user.rpg.spouse).split('@')[0] : 'Belum ada'}`,
    `Guild: ${user.rpg.guildId || 'Belum ada'}`,
    `Pet: ${user.rpg.pet?.name || 'Belum ada'}`,
    buffNames.length ? `Buff: ${buffNames.join(', ')}` : '',
  ].filter(Boolean).join(' · ')
  return sendRpgCard(sock, m, {
    type: 'profile',
    headerTitle: 'RPG PROFILE',
    headerSubtitle: displayName,
    data: {
      title: 'RPG PROFILE',
      name: displayName,
      role: getRole(user.level),
      level: user.level,
      exp: user.exp,
      koin: user.koin,
      health: user.rpg.health,
      maxHealth: user.rpg.maxHealth,
      mana: user.rpg.mana,
      maxMana: user.rpg.maxMana,
      stamina: user.rpg.stamina,
      maxStamina: user.rpg.maxStamina,
      attack: user.rpg.attack,
      defense: user.rpg.defense,
      speed: user.rpg.speed,
      luck: user.rpg.luck,
      avatarUrl,
    },
    body,
    mentions: target === m.sender ? [] : [target],
  })
}

handler.command = /^(rpgprofile|rpgstat|rpgstatus|profile)$/i
handler.help = ['rpgprofile', 'rpgstat']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Melihat profil dan statistik RPG'

export default handler
