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

import { settings } from '../../config/settings.js'
import { addDynamicOwner } from '../../core/database-owner.js'
import { normalizeNumber, resolvePhoneNumber, resolveTargetPhoneNumber, isOwner } from '../../lib/cek-akses.js'

function unwrapMessage(message) {
  let current = message || {}
  for (let i = 0; i < 8; i++) {
    const next =
      current?.ephemeralMessage?.message ||
      current?.viewOnceMessage?.message ||
      current?.viewOnceMessageV2?.message ||
      current?.viewOnceMessageV2Extension?.message ||
      current?.documentWithCaptionMessage?.message
    if (!next || next === current) break
    current = next
  }
  return current || {}
}

function getContextInfo(message) {
  const current = unwrapMessage(message)
  return (
    current?.extendedTextMessage?.contextInfo ||
    current?.imageMessage?.contextInfo ||
    current?.videoMessage?.contextInfo ||
    current?.documentMessage?.contextInfo ||
    current?.documentWithCaptionMessage?.message?.contextInfo ||
    current?.contextInfo ||
    null
  )
}

function cleanName(value) {
  return String(value ?? '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 64)
}

function extractName(text) {
  const raw = String(text ?? '')
  const separator = raw.indexOf('|')
  if (separator < 0) return ''
  return cleanName(raw.slice(separator + 1))
}

function extractNumber(text) {
  const raw = String(text ?? '').replace(/[,;]/g, ' ')
  const matches = raw.match(/\+?\d[\d\s().-]*\d/g) || []
  for (const candidate of matches) {
    const number = normalizeNumber(candidate)
    if (number.length >= 7 && number.length <= 15) return number
  }
  return null
}

async function resolveTargetJid(jid, conn, chat) {
  return resolveTargetPhoneNumber(jid, conn, chat)
}

async function resolveTargetFromMessage(m, conn) {
  const context = getContextInfo(m.raw?.message)
  const mentioned = Array.isArray(context?.mentionedJid) ? context.mentionedJid.filter(Boolean) : []
  const name = extractName(m.text)

  if (mentioned.length) {
    for (const jid of mentioned) {
      const number = await resolveTargetJid(jid, conn, m.chat)
      if (number) return { number, source: 'mention', name }
    }
  }

  if (context?.participant) {
    const number = await resolveTargetJid(context.participant, conn, m.chat)
    if (number) return { number, source: 'reply', name }
  }

  const number = extractNumber(m.text)
  if (number) return { number, source: 'number', name }

  return null
}

function getConfiguredOwners() {
  return (Array.isArray(settings.ownerNumbers) ? settings.ownerNumbers : [])
    .map(normalizeNumber)
    .filter(Boolean)
}

const handler = async (m, { conn, usedPrefix }) => {
  const target = await resolveTargetFromMessage(m, conn)
  if (!target || !target.name) {
    await conn.sendMessage(
      m.chat,
      { text: `Cara pakai:\n${usedPrefix}addowner @user | Nama Owner\n${usedPrefix}addowner <nomor> | Nama Owner\natau reply pesan user dengan ${usedPrefix}addowner | Nama Owner` },
      { quoted: m.raw }
    )
    return
  }

  const configuredOwners = getConfiguredOwners()
  if (configuredOwners.includes(target.number)) {
    await conn.sendMessage(
      m.chat,
      { text: `Nomor *${target.number}* adalah owner utama dengan nama *${settings.ownerName || 'Owner'}*.` },
      { quoted: m.raw }
    )
    return
  }

  const botNumber = normalizeNumber(conn?.user?.id || '')
  if (botNumber && botNumber === target.number) {
    await conn.sendMessage(
      m.chat,
      { text: 'Nomor bot tidak perlu ditambahkan sebagai owner.' },
      { quoted: m.raw }
    )
    return
  }

  const result = addDynamicOwner(target.number, target.name, await resolvePhoneNumber(m.sender, conn))

  if (result.reason === 'exists') {
    await conn.sendMessage(
      m.chat,
      { text: `Nomor *${result.number}* sudah menjadi owner dengan nama *${result.name}*.` },
      { quoted: m.raw }
    )
    return
  }

  if (result.reason === 'name_required') {
    await conn.sendMessage(
      m.chat,
      { text: `Nama owner wajib diisi setelah tanda *|*.` },
      { quoted: m.raw }
    )
    return
  }

  if (!result.added && !result.updated) {
    await conn.sendMessage(
      m.chat,
      { text: 'Nomor target tidak valid atau tidak dapat diproses.' },
      { quoted: m.raw }
    )
    return
  }

  const verified = await isOwner(`${result.number}@s.whatsapp.net`, conn)
  const action = result.updated ? 'diperbarui' : 'ditambahkan'
  await conn.sendMessage(
    m.chat,
    {
      text:
        `✅ *Owner berhasil ${action}*\n\n` +
        `Nama: *${result.name}*\n` +
        `Nomor: *${result.number}*\n` +
        `Status: *${verified ? 'Owner aktif' : 'Owner tersimpan'}*\n` +
        `Sumber: *${target.source}*`,
    },
    { quoted: m.raw }
  )
}

handler.command = /^addowner$/i
handler.help = ['addowner']
handler.tags = ['owner']
handler.description = 'Menambahkan owner baru melalui mention, reply, atau nomor'
handler.ownerOnly = true

export default handler
