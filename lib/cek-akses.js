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

import { settings } from '../config/settings.js'
import { getDynamicOwners } from '../core/database-owner.js'

export function normalizeNumber(jidOrNumber = '') {
  const withoutDomain = String(jidOrNumber).split('@')[0]
  const withoutDevice = withoutDomain.split(':')[0]
  return withoutDevice.replace(/\D/g, '')
}

export async function resolvePhoneNumber(senderJid, conn) {
  const value = String(senderJid || '').trim()
  if (!value) return ''
  if (!value.endsWith('@lid') || !conn?.signalRepository?.lidMapping) {
    return value.endsWith('@lid') ? '' : normalizeNumber(value)
  }

  try {
    const resolvedPn = await conn.signalRepository.lidMapping.getPNForLID(value)
    if (resolvedPn && !String(resolvedPn).endsWith('@lid')) {
      const number = normalizeNumber(resolvedPn)
      if (number.length >= 7 && number.length <= 15) return number
    }
  } catch {

  }

  return ''
}

function participantCandidates(participant) {
  if (!participant || typeof participant !== 'object') return []
  return [
    participant.id,
    participant.jid,
    participant.pn,
    participant.phoneNumber,
    participant.phone,
    participant.lid,
  ]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
}

function participantPhoneNumber(participant) {
  const candidates = participantCandidates(participant)
  const preferred = candidates.filter((value) => !value.endsWith('@lid'))
  for (const candidate of preferred) {
    const number = normalizeNumber(candidate)
    if (number.length >= 7 && number.length <= 15) return number
  }
  return ''
}

export async function resolveTargetPhoneNumber(jid, conn, groupId = '') {
  const value = String(jid || '').trim()
  if (!value) return ''

  if (!value.endsWith('@lid')) {
    const number = normalizeNumber(value)
    return number.length >= 7 && number.length <= 15 ? number : ''
  }

  const mapped = await resolvePhoneNumber(value, conn)
  if (mapped) return mapped

  if (!groupId?.endsWith('@g.us') || typeof conn?.groupMetadata !== 'function') return ''

  try {
    const metadata = await conn.groupMetadata(groupId)
    const participants = Array.isArray(metadata?.participants) ? metadata.participants : []

    for (const participant of participants) {
      const candidates = participantCandidates(participant)
      const matched = candidates.some((candidate) => candidate === value)
      if (!matched) continue

      const number = participantPhoneNumber(participant)
      if (number) return number
    }
  } catch {

  }

  return ''
}

export function getAllOwnerEntries() {
  const primary = Array.isArray(settings.ownerNumbers) ? settings.ownerNumbers : []
  const dynamic = getDynamicOwners()
  const entries = new Map()

  for (const owner of primary) {
    const number = normalizeNumber(owner)
    if (number) entries.set(number, { number, name: String(settings.ownerName || 'Owner').trim() || 'Owner', primary: true })
  }

  for (const owner of dynamic) {
    const number = normalizeNumber(owner.number)
    if (!number) continue
    entries.set(number, {
      number,
      name: String(owner.name || 'Owner').trim() || 'Owner',
      primary: false,
    })
  }

  return [...entries.values()]
}

export function getAllOwnerNumbers() {
  return getAllOwnerEntries().map((owner) => owner.number)
}

export async function isOwner(senderJid, conn) {
  const senderNumber = await resolvePhoneNumber(senderJid, conn)
  const owners = getAllOwnerNumbers()

  const selfNumber = normalizeNumber(conn?.user?.id || '')
  if (selfNumber && senderNumber && selfNumber === senderNumber) return true

  return owners.includes(senderNumber)
}

export default { isOwner, resolvePhoneNumber, resolveTargetPhoneNumber, normalizeNumber, getAllOwnerNumbers, getAllOwnerEntries }
