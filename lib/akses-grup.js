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

import { normalizeNumber, resolvePhoneNumber } from './cek-akses.js'

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function candidateJids(participant) {
  if (!participant || typeof participant !== 'object') return []
  return [participant.id, participant.jid, participant.lid, participant.pn, participant.phoneNumber]
    .map(text)
    .filter(Boolean)
}

export function sameParticipant(a, b) {
  const left = text(a)
  const right = text(b)
  if (!left || !right) return false
  if (left === right) return true
  const leftNumber = normalizeNumber(left)
  const rightNumber = normalizeNumber(right)
  return Boolean(leftNumber && rightNumber && leftNumber === rightNumber)
}

export function findParticipant(metadata, jid) {
  const participants = metadata?.participants || []
  return participants.find((participant) => candidateJids(participant).some((candidate) => sameParticipant(candidate, jid))) || null
}

export function participantIsAdmin(participant) {
  return Boolean(
    participant?.admin === 'admin' ||
    participant?.admin === 'superadmin' ||
    participant?.isAdmin ||
    participant?.isSuperAdmin
  )
}

export async function getGroupParticipant(conn, groupId, jid, metadata = null) {
  if (!groupId?.endsWith('@g.us') || !jid) return null
  const data = metadata || await conn.groupMetadata(groupId)
  const direct = findParticipant(data, jid)
  if (direct) return direct

  let resolved = ''
  try {
    resolved = await resolvePhoneNumber(jid, conn)
  } catch {
  }

  if (!resolved) return null
  const resolvedJid = `${resolved}@s.whatsapp.net`
  const resolvedDirect = findParticipant(data, resolvedJid)
  if (resolvedDirect) return resolvedDirect

  for (const participant of data?.participants || []) {
    for (const candidate of candidateJids(participant)) {
      if (!candidate.endsWith('@lid')) continue
      try {
        const candidateNumber = await resolvePhoneNumber(candidate, conn)
        if (candidateNumber && candidateNumber === resolved) return participant
      } catch {
      }
    }
  }

  return null
}

export async function isGroupAdmin(conn, groupId, jid, metadata = null) {
  try {
    const participant = await getGroupParticipant(conn, groupId, jid, metadata)
    return participantIsAdmin(participant)
  } catch {
    return false
  }
}

export async function getBotParticipant(conn, groupId, metadata = null) {
  const botJid = text(conn?.user?.id)
  if (!botJid) return null
  return getGroupParticipant(conn, groupId, botJid, metadata)
}

export async function isBotAdmin(conn, groupId, metadata = null) {
  try {
    const participant = await getBotParticipant(conn, groupId, metadata)
    return participantIsAdmin(participant)
  } catch {
    return false
  }
}

export function getParticipantJid(participant, fallback = '') {
  const candidates = candidateJids(participant)
  return candidates.find((value) => value.includes('@s.whatsapp.net')) || candidates[0] || text(fallback)
}

export default { sameParticipant, findParticipant, participantIsAdmin, getGroupParticipant, isGroupAdmin, getBotParticipant, isBotAdmin, getParticipantJid }
