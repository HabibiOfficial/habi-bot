/**  
 * ╔══════════════  
 * ║  ------ HABI AI --------  
 * ║ WA Bot • by Habibih Official     
 * ╚══════════════  
 *   
 * @author Habibih Official  
 * @website habibi-store.pages.dev  
 * @wa  wa.me/6285181576338  
 * @source Habibih Cloud ID - No Comot, No Ganti Nama  
 */

function rupiah(amount) {
  return `Rp ${Math.max(0, Math.floor(amount)).toLocaleString('id-ID')}`
}

function number(amount) {
  return Math.max(0, Math.floor(amount)).toLocaleString('id-ID')
}

function formatTimer(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) return `${hours}j ${minutes}m`
  if (minutes > 0) return `${minutes}m ${seconds}d`
  return `${seconds}d`
}

function formatRpgText(value) {
  if (typeof value !== 'string') return value
  const source = value.replace(/\r/g, '').trim()
  if (!source || source.length < 24) return source
  const lines = source.split('\n').map((line) => line.trimEnd())
  const normalized = []
  let blanks = 0
  for (const line of lines) {
    const compact = line.replace(/[-_=]{8,}/g, '┄┄┄')
    if (!compact.trim()) {
      blanks++
      if (blanks <= 1) normalized.push('')
      continue
    }
    blanks = 0
    normalized.push(compact)
  }
  while (normalized[0] === '') normalized.shift()
  while (normalized.at(-1) === '') normalized.pop()
  if (normalized.length >= 4 && !normalized.some((line) => line.includes('┄┄┄'))) {
    const first = normalized[0]
    const rest = normalized.slice(1)
    if (rest.some((line) => /[💰📈⚡❤️💎🏆🎁🪙]/u.test(line))) {
      normalized.splice(1, 0, '┄┄┄')
    }
    if (first.length > 44) normalized[0] = first.slice(0, 43) + '…'
  }
  return normalized.join('\n')
}

export { rupiah, number, formatTimer, formatRpgText }

export default { rupiah, number, formatTimer, formatRpgText }
