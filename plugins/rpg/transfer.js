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
import { rupiah } from '../../lib/rpg/format.js'

const handler = async (rawM, tools) => {
  const { m } = buildRpgContext(rawM, tools)
  const sender = getUser(m.sender)
  const args = m.args || []

  if (args.length < 2) {
    let txt = `🏦 *Transfer RPG*\n\n`
    txt += `\`${m.prefix}transfer money 10000 @user\`\n`
    txt += `\`${m.prefix}transfer potion 5 @user\``
    return m.reply(txt)
  }

  const type = args[0].toLowerCase()
  const amount = parseInt(args[1])
  const target = m.targetJid

  if (!target) {
    return m.reply(`Tag atau reply user yang mau dikirimi.`)
  }

  if (target === m.sender) {
    return m.reply(`Tidak bisa transfer ke diri sendiri.`)
  }

  if (!amount || amount <= 0) {
    return m.reply(`Jumlah harus lebih dari 0.`)
  }

  const recipient = getUser(target)

  if (type === 'money' || type === 'balance' || type === 'koin') {
    if (sender.koin < amount) {
      return m.reply(`Saldo tidak cukup. Saldo: ${rupiah(sender.koin)}, mau transfer: ${rupiah(amount)}.`)
    }

    sender.koin -= amount
    recipient.koin += amount
    saveUser(m.sender, sender)
    saveUser(target, recipient)

    return m.reply(`💸 *Transfer Berhasil*\n\nNominal: ${rupiah(amount)}\nPenerima: @${target.split('@')[0]}`, { mentions: [target] })
  }

  sender.inventory = sender.inventory || {}
  recipient.inventory = recipient.inventory || {}

  if ((sender.inventory[type] || 0) < amount) {
    return m.reply(`Item *${type}* kamu cuma ada ${sender.inventory[type] || 0}, tidak cukup untuk kirim ${amount}.`)
  }

  sender.inventory[type] -= amount
  if (sender.inventory[type] <= 0) delete sender.inventory[type]
  recipient.inventory[type] = (recipient.inventory[type] || 0) + amount
  saveUser(m.sender, sender)
  saveUser(target, recipient)

  return m.reply(`📦 *Paket Terkirim*\n\nIsi: ${type} x${amount}\nPenerima: @${target.split('@')[0]}`, { mentions: [target] })
}

handler.command = /^(transfer|tf|kirim|pay)$/i
handler.help = ['transfer', 'tf', 'kirim', 'pay']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.description = 'Transfer uang atau item ke user lain'
handler.groupOnly = true

export default handler
