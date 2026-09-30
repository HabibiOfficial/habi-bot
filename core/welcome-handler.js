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

import { isWelcomeEnabled } from './welcome.js'
import { normalizeNumber, resolvePhoneNumber } from '../lib/cek-akses.js'
import { settings } from '../config/settings.js'
import { getActivePrefix } from './prefix.js'
import { sendInteractive } from '../lib/tombol.js'
import { renderMemberCard } from './welcome-renderer.js'
import { getUser } from './database-user.js'

const memberNameCache = new Map()
const memberJidCache = new Map()
const contactNameCache = new Map()

function asString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export function extractParticipantJid(participant) {
  if (typeof participant === 'string') return participant.trim()
  if (!participant || typeof participant !== 'object') return ''

  const candidates = [
    participant.jid,
    participant.id,
    participant.phoneNumber,
    participant.phone,
    participant.pn,
    participant.lid,
  ]

  for (const candidate of candidates) {
    const value = asString(candidate)
    if (!value) continue
    if (value.includes('@')) return value
    if (/^\d{5,20}$/.test(value)) return `${value}@s.whatsapp.net`
  }

  return ''
}

function participantLid(participant) {
  if (!participant || typeof participant !== 'object') return ''
  const lid = asString(participant.lid)
  return lid && lid.includes('@lid') ? lid : ''
}

function cacheKey(groupId, jid) {
  const key = asString(jid)
  return `${groupId}:${normalizeNumber(key) || key}`
}

function participantNumber(jid) {
  const value = asString(jid)
  return normalizeNumber(value) || value.split('@')[0]
}

function looksLikePhoneName(value) {
  const text = asString(value)
  if (!text) return true
  const number = normalizeNumber(text)
  return number && text.replace(/[+\s().-]/g, '') === number
}

function participantName(participant, fallbackJid) {
  if (participant && typeof participant === 'object') {
    const candidates = [
      participant.name,
      participant.notify,
      participant.pushName,
      participant.shortName,
      participant.verifiedName,
      participant.displayName,
      participant.subject,
    ]

    for (const candidate of candidates) {
      const value = asString(candidate)
      if (value && !looksLikePhoneName(value)) return value
    }
  }

  return ''
}

function sameJid(a, b) {
  const left = normalizeNumber(asString(a))
  const right = normalizeNumber(asString(b))
  return Boolean(left && right && left === right)
}

async function resolveParticipantJid(participant, conn) {
  const rawJid = extractParticipantJid(participant)
  if (!rawJid) return ''
  if (rawJid.endsWith('@s.whatsapp.net')) return rawJid

  try {
    const resolved = await resolvePhoneNumber(rawJid, conn)
    if (resolved) return `${resolved}@s.whatsapp.net`
  } catch {

  }

  return rawJid
}

async function getGroupData(conn, groupId) {
  const metadata = await conn.groupMetadata(groupId)

  for (const participant of metadata?.participants || []) {
    const jid = extractParticipantJid(participant)
    if (!jid) continue

    const key = cacheKey(groupId, jid)
    const name = participantName(participant, jid)
    if (name) memberNameCache.set(key, name)

    const lid = participantLid(participant)
    if (lid && lid !== jid) {
      const lidKey = cacheKey(groupId, lid)
      if (name) memberNameCache.set(lidKey, name)
      memberJidCache.set(lidKey, jid)
    }
  }

  return metadata
}

function contactNameFromConnection(conn, jid) {
  const candidates = [
    conn?.store?.contacts?.[jid],
    conn?.contacts?.[jid],
  ]

  for (const contact of candidates) {
    const name = participantName(contact, jid)
    if (name) return name
  }

  return contactNameCache.get(jid) || ''
}

async function findKnownName(groupId, jid, participant = null, conn = null) {
  const direct = participantName(participant, jid)
  if (direct) return direct

  const connectionName = contactNameFromConnection(conn, jid)
  if (connectionName) return connectionName

  const cached = memberNameCache.get(cacheKey(groupId, jid))
  if (cached && !looksLikePhoneName(cached)) return cached

  const resolvedJid = memberJidCache.get(cacheKey(groupId, jid)) || jid
  const resolvedCached = memberNameCache.get(cacheKey(groupId, resolvedJid))
  if (resolvedCached && !looksLikePhoneName(resolvedCached)) return resolvedCached

  try {
    const user = await getUser(resolvedJid)
    const dbName = asString(user?.pushName)
    if (dbName && !looksLikePhoneName(dbName) && dbName.toLowerCase() !== 'kak') return dbName
  } catch {

  }

  return ''
}

function fallbackDisplayName(name, number) {
  return asString(name) || `Member +${number}`
}

function introText({ name, number, groupName }) {
  return [
    'INTRO MEMBER',
    '────────────────',
    '',
    `Nama   : ${name}`,
    `Nomor  : +${number}`,
    `Group  : ${groupName}`,
    '',
    'Halo, salam kenal.',
    'Senang bisa bergabung di sini.',
    'Semoga betah dan nyaman bersama.',
  ].join('\n')
}

function buildCaption({ action, name, number, groupName }) {
  const welcome = action === 'welcome'
  return [
    welcome ? '╭─〔 WELCOME 〕' : '╭─〔 GOODBYE 〕',
    '│',
    welcome ? `│ Selamat datang, *${name}*.` : `│ Sampai jumpa, *${name}*.`,
    '│',
    `│ Nomor  : +${number}`,
    `│ Group  : ${groupName}`,
    '│',
    welcome ? '│ Silakan kenalan dan baca peraturan' : '│ Terima kasih sudah menjadi bagian',
    welcome ? '│ group sebelum mulai beraktivitas.' : '│ dari group ini. Semoga sukses selalu.',
    '│',
    '╰──────────────',
  ].join('\n')
}

async function sendMemberEvent(conn, groupId, memberJid, action, groupName, name, usedPrefix) {
  const safeJid = asString(memberJid)
  if (!safeJid) throw new Error('JID participant tidak valid')

  let number = participantNumber(safeJid)
  try {
    const resolved = await resolvePhoneNumber(safeJid, conn)
    if (resolved) number = resolved
  } catch {
  }

  const safeName = fallbackDisplayName(name, number)
  const safeGroupName = asString(groupName) || 'Group'
  const intro = introText({ name: safeName, number, groupName: safeGroupName })
  const caption = buildCaption({ action, name: safeName, number, groupName: safeGroupName })

  let image = null
  try {
    image = await renderMemberCard({
      conn,
      memberJid: safeJid,
      memberNumber: number,
      groupName: safeGroupName,
      action,
      memberName: safeName,
    })
  } catch (err) {
    console.log(`  \x1b[33m⚠\x1b[0m  Canvas ${action} gagal, lanjut tanpa gambar: ${err.message}`)
  }

  const buttons = action === 'welcome'
    ? [
        { type: 'copy', label: 'SALIN INTRO', id: 'welcome_copy_intro', copyCode: intro },
        { label: 'PERATURAN', command: `${usedPrefix}peraturan` },
      ]
    : [{ type: 'noop', label: 'GOODBYE' }]

  await sendInteractive(
    conn,
    groupId,
    {
      title: '',
      subtitle: safeGroupName,
      body: caption,
      footer: 'Habibih Cloud ID  /  Group Assistant',
      image,
      buttons,
      mentions: [safeJid],
    },
    {}
  )
}

export function attachWelcomeHandler(conn) {
  if (!conn?.ev?.on) return conn

  conn.ev.on('contacts.upsert', (contacts = []) => {
    for (const contact of contacts) {
      const jid = asString(contact?.id || contact?.jid)
      const name = participantName(contact, jid)
      if (jid && name) contactNameCache.set(jid, name)
    }
  })

  conn.ev.on('contacts.update', (contacts = []) => {
    for (const contact of contacts) {
      const jid = asString(contact?.id || contact?.jid)
      const name = participantName(contact, jid)
      if (jid && name) contactNameCache.set(jid, name)
    }
  })

  conn.ev.on('group-participants.update', async (update) => {
    try {
      const groupId = asString(update?.id || update?.jid || update?.chatId)
      const action = asString(update?.action).toLowerCase()

      if (!groupId.endsWith('@g.us')) return
      if (!['add', 'remove', 'leave'].includes(action)) return
      if (!isWelcomeEnabled(groupId)) return

      const rawParticipants = Array.isArray(update?.participants) ? update.participants : []
      if (!rawParticipants.length) return

      let metadata = null
      try {
        metadata = await getGroupData(conn, groupId)
      } catch (err) {
        console.log(`  \x1b[33m⚠\x1b[0m  Metadata group tidak tersedia untuk ${groupId}: ${err.message}`)
      }

      const groupName = asString(metadata?.subject) || 'Group'
      let usedPrefix = settings.defaultPrefix
      try {
        usedPrefix = await getActivePrefix(groupId)
      } catch {
      }

      for (const rawParticipant of rawParticipants) {
        const originalJid = extractParticipantJid(rawParticipant)
        if (!originalJid) {
          console.log('  \x1b[33m⚠\x1b[0m  Event participant diabaikan: JID tidak ditemukan')
          continue
        }

        const cachedJid = memberJidCache.get(cacheKey(groupId, originalJid)) || originalJid
        const memberJid = await resolveParticipantJid(rawParticipant, conn) || cachedJid
        if (!memberJid || sameJid(memberJid, conn.user?.id)) continue

        const participant = (metadata?.participants || []).find((p) => {
          const pId = extractParticipantJid(p)
          const pLid = participantLid(p)
          return sameJid(pId, originalJid) || sameJid(pLid, originalJid) || sameJid(pId, memberJid)
        })

        const name = await findKnownName(groupId, originalJid, participant || rawParticipant, conn)
        const key = cacheKey(groupId, originalJid)
        if (name) memberNameCache.set(key, name)
        memberJidCache.set(key, memberJid)

        const displayName = fallbackDisplayName(name, participantNumber(memberJid))
        console.log(`  \x1b[36m›\x1b[0m  Group event: ${action} | ${memberJid} | ${displayName}`)

        try {
          await sendMemberEvent(
            conn,
            groupId,
            memberJid,
            action === 'add' ? 'welcome' : 'goodbye',
            groupName,
            displayName,
            usedPrefix
          )
          console.log(`  \x1b[32m✓\x1b[0m  ${action === 'add' ? 'Welcome' : 'Goodbye'} terkirim untuk ${memberJid}`)
        } catch (err) {
          const detail = err instanceof Error ? err.message : JSON.stringify(err)
          console.log(`  \x1b[33m⚠\x1b[0m  Gagal mengirim ${action === 'add' ? 'welcome' : 'goodbye'} ${memberJid}: ${detail}`)
        } finally {
          if (action !== 'add') {
            memberNameCache.delete(cacheKey(groupId, originalJid))
            memberJidCache.delete(cacheKey(groupId, originalJid))
          }
        }
      }
    } catch (err) {
      const detail = err instanceof Error ? err.stack || err.message : JSON.stringify(err)
      console.log(`  \x1b[31m✗\x1b[0m  Welcome handler error: ${detail}`)
    }
  })

  return conn
}

export default { attachWelcomeHandler, extractParticipantJid }
