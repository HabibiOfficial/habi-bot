
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
import { getActivePrefix } from './prefix.js'
import { findPluginByCommand } from './pemuat-plugin.js'
import { sendTypoSuggestion } from './deteksi-typo.js'
import { enqueue } from './antrian-pesan.js'
import { isOwner } from '../lib/cek-akses.js'
import { touchUser } from './database-user.js'
import { printCommandLog } from '../tampilan/banner.js'
import { handleAntiLinkMessage } from './antilink.js'
import { createStyledConnection, sendGroupOnlyReply, sendStyledReply } from '../lib/reply-style.js'

function unwrapMessage(message) {
  let current = message
  for (let i = 0; i < 6; i++) {
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

function extractText(message) {
  message = unwrapMessage(message)
  const nativeFlowResponse = message?.interactiveResponseMessage?.nativeFlowResponseMessage

  if (nativeFlowResponse?.paramsJson) {
    try {
      const params = JSON.parse(nativeFlowResponse.paramsJson)
      if (params?.id) return params.id
    } catch {

    }
  }

  return (
    message?.conversation ||
    message?.extendedTextMessage?.text ||
    message?.imageMessage?.caption ||
    message?.videoMessage?.caption ||
    message?.documentMessage?.caption ||
    message?.documentWithCaptionMessage?.message?.documentMessage?.caption ||
    message?.buttonsResponseMessage?.selectedButtonId ||
    message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
    message?.templateButtonReplyMessage?.selectedId ||
    ''
  )
}

function parseCommand(text, prefix) {
  if (!text.startsWith(prefix)) return null

  const withoutPrefix = text.slice(prefix.length).trim()
  const [command, ...rest] = withoutPrefix.split(/\s+/)

  return {
    command: (command || '').toLowerCase(),
    args: rest,
    text: rest.join(' '),
  }
}

export function attachMessageRouter(conn) {
  conn.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return

    for (const raw of messages) {
      if (!raw.message) continue
      const allowSelf = settings.messageRouting?.respondToSelf !== false
      if (raw.key.fromMe && !allowSelf) continue

      enqueue(raw.key.id, async () => {
        await handleIncomingMessage(conn, raw)
      })
    }
  })
}

async function handleIncomingMessage(conn, raw) {
  const chat = raw.key.remoteJid
  if (!chat || chat === 'status@broadcast') return
  const isSelf = Boolean(raw.key.fromMe)
  const sender = isSelf ? (conn.user?.id || raw.key.participant || raw.key.remoteJid) : (raw.key.participant || raw.key.remoteJid)
  const prefix = await getActivePrefix(chat)

  const messageContent = unwrapMessage(raw.message)
  const moderated = await handleAntiLinkMessage(conn, raw)
  if (moderated) return

  const text = extractText(messageContent)

  if (!text) return

  const parsed = parseCommand(text, prefix)
  if (!parsed) return

  const plugin = findPluginByCommand(parsed.command)
  if (!plugin) {
    try {
      const handled = await sendTypoSuggestion(conn, raw, chat, prefix, parsed.command)
      if (!handled) {
        console.log(`  \x1b[33m⚠\x1b[0m  Tidak ada saran typo untuk: ${parsed.command}`)
      }
    } catch (err) {
      console.log(`  \x1b[31m✗\x1b[0m  Deteksi typo gagal: ${err?.message || err}`)
    }
    return
  }

  const m = {
    key: raw.key,
    chat,
    sender,
    isGroup: chat.endsWith('@g.us'),
    text: parsed.text,
    args: parsed.args,
    command: parsed.command,
    pushName: raw.pushName || (isSelf ? 'Owner' : 'Kak'),
    isSelf,
    raw,
    currentMessage: messageContent,
    quoted: messageContent?.extendedTextMessage?.contextInfo?.quotedMessage || null,
    quotedMessage: messageContent?.extendedTextMessage?.contextInfo?.quotedMessage
      ? {
          key: {
            remoteJid: chat,
            fromMe: false,
            id: messageContent.extendedTextMessage.contextInfo.stanzaId,
            participant: messageContent.extendedTextMessage.contextInfo.participant || undefined,
          },
          message: messageContent.extendedTextMessage.contextInfo.quotedMessage,
        }
      : null,
  }

  m.reply = async (text, options = {}) => {
    const quoted = Object.prototype.hasOwnProperty.call(options, 'quoted')
      ? options.quoted
      : raw
    return sendStyledReply(conn, chat, text, {
      ...options,
      originalMessage: quoted === false ? null : quoted,
      mentions: options?.mentions || [],
    })
  }

  const styledConn = createStyledConnection(conn, m)

  await touchUser(sender, m.pushName)

  printCommandLog({
    pushName: m.pushName,
    sender,
    message: text,
    command: parsed.command,
    isGroup: m.isGroup,
    chat,
  })

  if (parsed.command === 'menu') {
    try {
      await conn.sendMessage(chat, { react: { text: '🤖', key: raw.key } })
    } catch (err) {
      console.log(`  \x1b[33m⚠\x1b[0m  Gagal mengirim reaction .menu: ${err.message}`)
    }
  }

  if (plugin.ownerOnly && !(await isOwner(sender, conn))) {
    await sendStyledReply(conn, chat, 'Perintah ini khusus untuk owner bot.', { originalMessage: raw })
    return
  }

  if ((plugin.groupOnly || plugin.category === 'rpg') && !m.isGroup) {
    await sendGroupOnlyReply(conn, chat, 'Perintah ini hanya bisa dipakai di dalam group.', raw)
    return
  }

  try {
    await plugin(m, { conn: styledConn, rawConn: conn, usedPrefix: prefix, settings })
  } catch (err) {
    console.log(`  \x1b[31m✗\x1b[0m  Error di plugin "${parsed.command}": ${err.message}`)
    await sendStyledReply(
      conn,
      chat,
      `Terjadi kesalahan saat menjalankan perintah ini.\n\n${err.message}`,
      { originalMessage: raw }
    )
  }
}

export default { attachMessageRouter }
