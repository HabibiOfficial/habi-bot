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

import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { generateWAMessageFromContent } from '@whiskeysockets/baileys'
import { settings } from '../config/settings.js'
import { sendInteractive } from './tombol.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const IMAGE_DIR = path.join(__dirname, '..', 'assets', 'image')
const VARIANT_FILE = path.join(__dirname, '..', 'storage', 'reply-variant.json')
const DEFAULT_VARIANT = 1
const ALLOWED_VARIANTS = new Set([1, 2, 3, 4, 5])
const VARIANT_ASSETS = {
  1: 'v1-pixel.svg',
  2: 'v2-pixel.svg',
  3: 'v3-pixel.svg',
  4: 'v4-pixel.svg',
  5: 'v5-pixel.svg',
}

let replyAssetCache = null
let replyVariantCache = null

const replyVariants = {
  1: { name: 'PREMIUM', desc: 'Quote dokumen · thumbnail · contact' },
  2: { name: 'PREVIEW', desc: 'Preview eksternal · URL tidak terlihat' },
  3: { name: 'ORDER', desc: 'Quote order card · thumbnail' },
  4: { name: 'DOCUMENT', desc: 'Dokumen ringan · quote asli' },
  5: { name: 'LOCATION', desc: 'Kartu lokasi · thumbnail interaktif' },
}

async function getReplyAsset(variant = 1) {
  const fileName = VARIANT_ASSETS[variant] || VARIANT_ASSETS[DEFAULT_VARIANT]
  const imagePath = path.join(__dirname, '..', 'assets', 'reply-assets', fileName)
  if (!(await fs.pathExists(imagePath))) return null
  try {
    const source = await fs.readFile(imagePath)
    const image = await sharp(source)
      .resize(1024, 1024, { fit: 'cover', position: 'centre' })
      .jpeg({ quality: 82, chromaSubsampling: '4:2:0' })
      .toBuffer()
    const thumbnail = await sharp(source)
      .resize(300, 300, { fit: 'cover', position: 'centre' })
      .jpeg({ quality: 78, chromaSubsampling: '4:2:0' })
      .toBuffer()
    return { image, thumbnail }
  } catch {
    return null
  }
}

async function normalizeStoredVariant(value) {
  const numeric = Number(value)
  return ALLOWED_VARIANTS.has(numeric) ? numeric : DEFAULT_VARIANT
}

async function getVariant() {
  if (ALLOWED_VARIANTS.has(replyVariantCache)) return replyVariantCache
  try {
    if (await fs.pathExists(VARIANT_FILE)) {
      const value = JSON.parse(await fs.readFile(VARIANT_FILE, 'utf8'))?.replyVariant
      if (ALLOWED_VARIANTS.has(Number(value))) {
        replyVariantCache = Number(value)
        return replyVariantCache
      }
    }
  } catch {}
  replyVariantCache = await normalizeStoredVariant(settings.replyVariant)
  return replyVariantCache
}

export async function getReplyVariant() {
  return getVariant()
}

export async function setReplyVariant(variant) {
  const value = Number(variant)
  if (!ALLOWED_VARIANTS.has(value)) throw new Error('Reply variant tidak valid')
  await fs.ensureDir(path.dirname(VARIANT_FILE))
  await fs.writeJson(VARIANT_FILE, { replyVariant: value }, { spaces: 2 })
  replyVariantCache = value
  settings.replyVariant = value
  return value
}

async function getThumbnail(asset) {
  return asset?.thumbnail || null
}

async function getPackageBuffer() {
  const packagePath = path.join(__dirname, '..', 'package.json')
  if (await fs.pathExists(packagePath)) return fs.readFile(packagePath)
  return Buffer.from('Habibih Cloud ID')
}

function getQuoted(options, fallback) {
  if (options?.quoted === false) return undefined
  return options?.originalMessage || fallback
}

function getContextInfo(options, mentions = []) {
  return {
    mentionedJid: options?.mentions || mentions,
    ...(options?.contextInfo || {}),
  }
}

async function sendVariant2(conn, jid, text, options, asset, fallbackQuoted) {
  const thumb = await getThumbnail(asset)
  const fakeQuoted = {
    key: {
      participant: '0@s.whatsapp.net',
      remoteJid: 'status@broadcast',
      fromMe: false,
    },
    message: {
      contactMessage: {
        displayName: settings.botName || 'Habibih ID',
        vcard: 'BEGIN:VCARD\nVERSION:3.0\nN:XL;Habibih Cloud ID;;;\nFN:Habibih Cloud ID\nitem1.TEL;waid=13135550002:+1 (313) 555-0002\nitem1.X-ABLabel:Ponsel\nEND:VCARD',
        sendEphemeral: true,
      },
    },
  }
  return conn.sendMessage(
    jid,
    {
      document: await getPackageBuffer(),
      mimetype: 'image/png',
      fileName: settings.botName || 'Habibih ID',
      fileLength: 99999999999999,
      jpegThumbnail: thumb,
      caption: text,
      contextInfo: getContextInfo(options),
    },
    { quoted: fakeQuoted || getQuoted(options, fallbackQuoted) }
  )
}

async function sendVariant4(conn, jid, text, options, asset, fallbackQuoted) {
  const thumbnail = await getThumbnail(asset)
  const sourceUrl = settings.links?.githubLink || ''
  const description = settings.footerText || 'WhatsApp Bot'
  return conn.sendMessage(
    jid,
    {
      text,
      contextInfo: {
        ...getContextInfo(options),
        externalAdReply: {
          title: settings.botName || 'Habibih ID',
          body: description,
          mediaType: 1,
          renderLargerThumbnail: false,
          showAdAttribution: false,
          thumbnail,
          ...(sourceUrl ? { sourceUrl } : {}),
        },
      },
    },
    { quoted: getQuoted(options, fallbackQuoted) }
  )
}

async function sendVariant5(conn, jid, text, options, asset) {
  const thumbnail = await getThumbnail(asset)
  const fakeOrder = {
    key: {
      participant: '0@s.whatsapp.net',
      remoteJid: jid,
      fromMe: false,
    },
    message: {
      orderMessage: {
        orderId: '123456',
        itemCount: 999,
        status: 1,
        surface: 1,
        message: settings.botName || 'Habibih ID',
        orderTitle: 'System Notification',
        sellerJid: '0@s.whatsapp.net',
        token: 'HABI1+',
        totalAmount1000: '1000000',
        totalCurrencyCode: 'IDR',
        thumbnail,
      },
    },
  }
  return conn.sendMessage(
    jid,
    {
      text,
      mentions: options?.mentions || [],
      contextInfo: options?.contextInfo || {},
    },
    { quoted: fakeOrder }
  )
}

async function sendVariant6(conn, jid, text, options, asset, fallbackQuoted) {
  const thumb = await getThumbnail(asset)
  return conn.sendMessage(
    jid,
    {
      document: await getPackageBuffer(),
      mimetype: 'image/png',
      fileName: settings.botName || 'Habibih ID',
      fileLength: 99999999999999,
      jpegThumbnail: thumb,
      caption: text,
      contextInfo: getContextInfo(options),
    },
    { quoted: getQuoted(options, fallbackQuoted) }
  )
}

async function sendVariant7(conn, jid, text, options, asset, fallbackQuoted) {
  const thumbnail = await getThumbnail(asset)
  const generated = generateWAMessageFromContent(
    jid,
    {
      viewOnceMessage: {
        message: {
          messageContextInfo: {},
          interactiveMessage: {
            header: {
              hasMediaAttachment: true,
              locationMessage: {
                degreesLatitude: 0,
                degreesLongitude: 0,
                name: settings.botName || 'Habibih ID',
                address: 'WhatsApp Bot Multi Device',
                jpegThumbnail: thumbnail,
              },
            },
            body: { text: 'Habibih System' },
            footer: { text },
            contextInfo: {
              ...getContextInfo(options),
            },
            nativeFlowMessage: { buttons: [] },
          },
        },
      },
    },
    { quoted: getQuoted(options, fallbackQuoted), userJid: conn.user?.id || jid }
  )
  return conn.relayMessage(jid, generated.message, { messageId: generated.key.id })
}

async function sendSelectedVariant(conn, jid, text, options = {}, fallbackQuoted = null) {
  if (!text && text !== 0) return null
  const variant = await getVariant()
  const asset = options.asset || await getReplyAsset(variant)
  if (variant === 1) return sendVariant2(conn, jid, text, options, asset, fallbackQuoted)
  if (variant === 2) return sendVariant4(conn, jid, text, options, asset, fallbackQuoted)
  if (variant === 3) return sendVariant5(conn, jid, text, options, asset)
  if (variant === 4) return sendVariant6(conn, jid, text, options, asset, fallbackQuoted)
  if (variant === 5) return sendVariant7(conn, jid, text, options, asset, fallbackQuoted)
  return sendVariant2(conn, jid, text, options, asset, fallbackQuoted)
}

export async function sendStyledReply(conn, jid, text, options = {}) {
  return sendSelectedVariant(conn, jid, text, options, options.originalMessage || null)
}

function shouldStyleTextMessage(content) {
  if (!content || typeof content !== 'object') return false
  if (typeof content.text !== 'string' || !content.text.trim()) return false
  if (content.linkPreview) return false
  if (content.react) return false
  const excluded = [
    'image',
    'video',
    'audio',
    'sticker',
    'document',
    'contacts',
    'location',
    'buttons',
    'templateButtons',
    'sections',
    'listMessage',
    'buttonsMessage',
    'interactiveMessage',
    'nativeFlowMessage',
    'poll',
    'product',
    'productMessage',
    'groupInvite',
    'payment',
  ]
  return !excluded.some((key) => key in content)
}

export function createStyledConnection(conn, message) {
  if (!conn || conn.__qiroStyledConnection) return conn
  return new Proxy(conn, {
    get(target, property, receiver) {
      if (property === '__qiroStyledConnection') return true
      if (property === 'sendMessage') {
        return async (jid, content, sendOptions = {}) => {
          if (!shouldStyleTextMessage(content)) {
            return target.sendMessage(jid, content, sendOptions)
          }
          const originalMessage = sendOptions?.quoted || message?.raw || null
          return sendSelectedVariant(
            target,
            jid,
            content.text,
            {
              originalMessage,
              mentions: content.mentions || [],
              contextInfo: content.contextInfo || {},
              quoted: sendOptions?.quoted === false ? false : true,
            },
            originalMessage
          )
        }
      }
      const value = Reflect.get(target, property, receiver)
      if (typeof value === 'function') return value.bind(target)
      return value
    },
  })
}

export async function sendGroupOnlyReply(conn, jid, text, originalMessage = null) {
  return sendStyledReply(conn, jid, text, { originalMessage })
}

export const replyVariantIds = Object.freeze(Object.keys(replyVariants).map(Number))

export { replyVariants }

export default {
  sendStyledReply,
  sendGroupOnlyReply,
  createStyledConnection,
  getReplyVariant,
  setReplyVariant,
  replyVariants,
}
