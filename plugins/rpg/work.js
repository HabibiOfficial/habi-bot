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
import { trackQuestProgress } from '../../lib/rpg/quest-progress.js'
import { rupiah } from '../../lib/rpg/format.js'
import { sendRpgCard } from '../../lib/rpg/ui.js'

const JOBS = [
  { name: 'Petani', min: 1000, max: 3000 },
  { name: 'Cleaning Service', min: 2000, max: 5000 },
  { name: 'Kurir', min: 3000, max: 7000 },
  { name: 'Koki', min: 4000, max: 10000 },
  { name: 'Programmer', min: 8000, max: 20000 },
  { name: 'Dokter', min: 15000, max: 30000 },
]

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)

  if (await enforceCooldown(m, 'work', 180_000)) return

  const user = getUser(m.sender)
  const staminaCost = 10

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`⚡ Stamina tidak cukup. Butuh *${staminaCost}*, sisa *${user.rpg.stamina}*. Istirahat dulu ya.`)
  }

  user.rpg.stamina -= staminaCost

  const job = JOBS[Math.floor(Math.random() * JOBS.length)]
  const salary = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min
  const expGain = Math.floor(salary / 10)

  await m.reply(`💼 Berangkat kerja jadi *${job.name}*...`)
  await new Promise((r) => setTimeout(r, 3000))

  user.koin += salary
  trackQuestProgress(user, 'earn', salary)
  trackQuestProgress(user, 'work')
  saveUser(m.sender, user)

  await addExpWithLevelCheck(sock, m, user, expGain)

  const txt = `Profesi: ${job.name}\nGaji: +${rupiah(salary)}\nEXP: +${expGain}\nStamina: -${staminaCost}`

  return sendRpgCard(sock, m, {
    type: 'work',
    headerTitle: 'WORK',
    headerSubtitle: 'Shift selesai',
    data: {
      title: 'SHIFT COMPLETE',
      subtitle: job.name,
      result: 'Pekerjaan selesai',
      victory: true,
      stats: [
        { label: 'Gaji', value: `+${rupiah(salary)}`, color: '#b88a32' },
        { label: 'EXP', value: `+${expGain}`, color: '#4d8fae' },
        { label: 'Stamina', value: `-${staminaCost}`, color: '#d35e74' },
      ],
    },
    body: txt,
  })
}

handler.command = /^(work|kerja|job)$/i
handler.help = ['work', 'kerja', 'job']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Bekerja untuk mendapatkan uang'

export default handler
