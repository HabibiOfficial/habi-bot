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
import { sendRpgCard } from '../../lib/rpg/ui.js'
import { trackQuestProgress } from '../../lib/rpg/quest-progress.js'

const ANIMALS = [
  { name: 'Kelinci', item: 'daging_kelinci', chance: 80, min: 1, max: 3, exp: 50, money: 500 },
  { name: 'Rusa', item: 'daging_rusa', chance: 50, min: 1, max: 2, exp: 100, money: 1500 },
  { name: 'Babi Hutan', item: 'daging_babi', chance: 40, min: 1, max: 2, exp: 150, money: 2000 },
  { name: 'Rubah', item: 'bulu_rubah', chance: 30, min: 1, max: 1, exp: 200, money: 3000 },
  { name: 'Beruang', item: 'cakar_beruang', chance: 15, min: 1, max: 1, exp: 500, money: 10000 },
  { name: 'Singa', item: 'taring_singa', chance: 5, min: 1, max: 1, exp: 1000, money: 25000 },
]

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)

  if (await enforceCooldown(m, 'berburu', 120_000)) return

  const user = getUser(m.sender)
  const staminaCost = 25

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`⚡ Stamina tidak cukup. Butuh *${staminaCost}*, sisa *${user.rpg.stamina}*. Istirahat dulu ya.`)
  }

  user.rpg.stamina -= staminaCost

  await m.react('🏹')
  await m.reply('🏹 Mengendap masuk hutan, membidik dengan teliti...')
  await new Promise((r) => setTimeout(r, 3000))

  const caught = ANIMALS.filter((a) => Math.random() * 100 <= a.chance)

  if (caught.length === 0) {
    saveUser(m.sender, user)
    await m.react('😢')
    return m.reply(`Buruannya kabur semua, tidak dapat apa-apa.\n⚡ Stamina tetap terpakai: -${staminaCost}`)
  }

  const results = []
  let totalExp = 0
  let totalMoney = 0

  for (const animal of caught.slice(0, 3)) {
    const qty = Math.floor(Math.random() * (animal.max - animal.min + 1)) + animal.min
    user.inventory[animal.item] = (user.inventory[animal.item] || 0) + qty
    totalExp += animal.exp * qty
    totalMoney += animal.money * qty
    results.push({ name: animal.name, qty, money: animal.money * qty })
  }

  user.koin += totalMoney
  trackQuestProgress(user, 'earn', totalMoney)
  saveUser(m.sender, user)

  await addExpWithLevelCheck(sock, m, user, totalExp)

  await m.react('✅')

  const loot = results.map((r) => `${r.name} ×${r.qty}`).join(', ')
  const txt = `Loot: ${loot}\nCoin: +${rupiah(totalMoney)}\nEXP: +${totalExp}\nStamina: -${staminaCost}`

  return sendRpgCard(sock, m, {
    type: 'berburu',
    headerTitle: 'HUNTING',
    headerSubtitle: 'Hasil perburuan',
    data: {
      title: 'HUNT COMPLETE',
      subtitle: 'Wild Grove',
      result: 'Perburuan berhasil',
      location: 'Wild Grove',
      victory: true,
      stats: [
        { label: 'Loot', value: loot, color: '#619b62' },
        { label: 'Coin', value: `+${rupiah(totalMoney)}`, color: '#b68a31' },
        { label: 'EXP', value: `+${totalExp}`, color: '#7c8ed2' },
        { label: 'Stamina', value: `-${staminaCost}`, color: '#d15f62' },
      ],
    },
    body: txt,
  })
}

handler.command = /^berburu$/i
handler.help = ['berburu', 'huntanimal', 'buru']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Berburu hewan untuk mendapat item dan uang'

export default handler
