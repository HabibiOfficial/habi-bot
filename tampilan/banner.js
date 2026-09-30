/**
 * ╔══════════════
 * ║  ------ HABI AI --------
 * ║ WA Bot • by Habibih Cloud Official ID
 * ╚══════════════
 *
 * @author Habibih Cloud Official ID
 * @website habibicloud.web.id
 * @wa  wa.me/6285181576338
 * @source Habibih Cloud ID - No Comot, No Ganti Nama
 */

import chalk from 'chalk'
import gradient from 'gradient-string'
import { settings } from '../config/settings.js'

const width = 38

function clean(value, limit = 120) {
  const text = String(value ?? '')
    .replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return text.length > limit
    ? `${text.slice(0, Math.max(0, limit - 1))}…`
    : text
}

function fit(value, size = width) {
  const text = clean(value, size)
  return text + ' '.repeat(Math.max(0, size - text.length))
}

function jidToNumber(jid) {
  return clean(jid).replace(/@.+$/, '').replace(/:\d+$/, '') || '-'
}

export async function printBanner() {
  const bot = clean(settings.botName || 'Habibih Cloud ID', 22)
  const version = clean(`v${settings.botVersion || '1.0.0'}`, 10)
  const title = fit(`  ${bot} • ${version}`)
  const owner = fit(`  WA Bot • ${settings.ownerName || 'Habibih Official'}`)

  console.log('')
  console.log(chalk.cyan(`╭${'─'.repeat(width)}╮`))
  console.log(chalk.cyan('│') + chalk.bold.cyan(fit('          H A B I B I H  C L O U D  I D')) + chalk.cyan('│'))
  console.log(chalk.cyan('├' + '─'.repeat(width) + '┤'))
  console.log(chalk.cyan('│') + gradient(['#00E5FF', '#7C4DFF', '#FF4FD8'])(title) + chalk.cyan('│'))
  console.log(chalk.cyan('│') + chalk.gray(owner) + chalk.cyan('│'))
  console.log(
    chalk.cyan('│') +
    chalk.green(' ● ONLINE') +
    chalk.gray('  •  ') +
    chalk.yellow(clean(settings.botMode || 'Public', 12).toUpperCase()) +
    ' '.repeat(Math.max(0, width - 20 - clean(settings.botMode || 'Public', 12).length)) +
    chalk.cyan('│')
  )
  console.log(chalk.cyan(`╰${'─'.repeat(width)}╯`))
}

export function printStatus(message, type = 'info') {
  const styles = {
    info: { icon: chalk.cyan('●'), label: chalk.cyan('INFO') },
    success: { icon: chalk.green('●'), label: chalk.green('OK') },
    warn: { icon: chalk.yellow('●'), label: chalk.yellow('WARN') },
    error: { icon: chalk.red('●'), label: chalk.red('ERROR') },
    loading: { icon: chalk.blue('●'), label: chalk.blue('LOAD') },
  }

  const style = styles[type] || styles.info
  console.log(`${chalk.gray('│')} ${style.icon} ${style.label} ${chalk.gray('›')} ${clean(message, 160)}`)
}

export function printSection(title) {
  const text = clean(title, 28).toUpperCase()
  console.log('')
  console.log(chalk.magenta(`╭─ ${chalk.bold.white(text)} ${chalk.magenta('─'.repeat(Math.max(0, width - text.length - 5)))}╮`))
}

export function printCommandLog({ pushName, sender, message, command, isGroup, chat }) {
  const name = clean(pushName || 'Unknown', 24)
  const number = jidToNumber(sender)
  const commandName = clean(command || '-', 20)
  const content = clean(message || '-', 28)
  const location = isGroup
    ? `GROUP • ${jidToNumber(chat)}`
    : 'PRIVATE'
  const time = new Intl.DateTimeFormat('id-ID', {
    timeZone: settings.timezone || 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date())

  const line = (label, value, color = chalk.white) => {
    const prefix = `${label} `
    const available = width - prefix.length
    return chalk.blue('│') +
      chalk.gray(prefix) +
      color(fit(clean(value, available), available)) +
      chalk.blue('│')
  }

  console.log('')
  console.log(chalk.blue(`╭${'─'.repeat(width)}╮`))
  console.log(
    chalk.blue('│') +
    chalk.bold.cyan(fit(' ⚡ COMMAND DETECTED', 22)) +
    chalk.gray(fit(time, width - 22)) +
    chalk.blue('│')
  )
  console.log(chalk.blue(`├${'─'.repeat(width)}┤`))
  console.log(line('👤', `${name} • ${number}`, chalk.white))
  console.log(line('💬', content, chalk.cyan))
  console.log(line('⚙', `/${commandName} • ${location}`, chalk.yellow))
  console.log(chalk.blue(`╰${'─'.repeat(width)}╯`))
}

export default { printBanner, printStatus, printSection, printCommandLog }
