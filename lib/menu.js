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

import os from 'os'
import { settings } from '../config/settings.js'
import { getAllCategories, getPluginsByCategory } from '../core/pemuat-plugin.js'
import { creatorWatermark } from '../core/identitas.js'

function formatCategoryName(categoryKey) {
  return categoryKey
    .split(/[-_]/)
    .map((word) => {
      const isAllUpper = word === word.toUpperCase() && word.length > 1
      return isAllUpper ? word : word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

function resolveCategoryMeta(categoryKey) {
  const name = formatCategoryName(categoryKey)

  return {
    title: `Menu ${name}`,
    description: `Kumpulan fitur ${name.toLowerCase()}`,
  }
}

export function getGreeting() {
  const hour = new Date().toLocaleString('en-US', { timeZone: settings.timezone, hour: 'numeric', hour12: false })
  const h = parseInt(hour, 10)

  if (h >= 4 && h < 11) return 'Selamat Pagi'
  if (h >= 11 && h < 15) return 'Selamat Siang'
  if (h >= 15 && h < 19) return 'Selamat Sore'
  return 'Selamat Malam'
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const parts = []
  if (d) parts.push(`${d}h`)
  parts.push(`${h}j ${m}m ${s}d`)
  return parts.join(' ')
}

function getSystemInfo() {
  const memUsage = process.memoryUsage()
  const memPercent = ((memUsage.rss / os.totalmem()) * 100).toFixed(1)

  return {
    uptime: formatUptime(process.uptime()),
    memory: memPercent,
    platform: os.platform(),
    nodeVersion: process.version,
  }
}

function buildInfoBlock({ botName, ownerName, botVersion, botMode, pushName, isOwnerUser, contactNumber, registeredAt }) {
  const statusLabel = isOwnerUser ? 'Owner' : 'User'
  const registerLabel = registeredAt
    ? new Date(registeredAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
    : 'Baru terdaftar'

  return [
    '╭ ┈──ׅ─┈─ׅ─┈─ׅ─┈─ׅ─',
    '│   ---- *⫹ INFO BOT ⫺* ----',
    '│╭ ┈──ׅ───ׅ──ׅ─┈─ׅ─',
    `││ *‎‎𖢷 ׁ 𖹭₊  Name  :* ${botName}`,
    `││ *‎‎𖢷 ׁ 𖹭₊  Owner  :* ${ownerName}`,
    `││ *𖢷 ׁ 𖹭₊  Versi   :* ${botVersion}`,
    `││ *‎‎𖢷 ׁ 𖹭₊  Mode   :* ${botMode}`,
    '│‎╰┈─ׅ──ֺ─ֺ──ׅ──ׅ─ֺ─ֺ',
    '‎╰┈─ׅ──ֺ─ֺ───ׅ─  ׅ ⏝ׅ︶ ׅ 𝅄',
    '',
    '╭ ┈──ׅ─┈─ׅ─┈─ׅ─┈─ׅ─',
    '│  ---- *⫹ INFO USER ⫺* ----',
    '│╭ ┈──ׅ─┈─ׅ─┈─ׅ──ׅ─',
    `││ *𖢷 ׁ 𖹭₊  Name    :* ${pushName}`,
    `││ *𖢷 ׁ 𖹭₊  Status   :* ${statusLabel}`,
    `││ *𖢷 ׁ 𖹭₊  Kontak  :* ${contactNumber}`,
    `││ *𖢷 ׁ 𖹭₊  Register  :* ${registerLabel}`,
    '│‎╰┈─ׅ──ֺ─ֺ──ׅ─ֺ─ֺ─ׅ─',
    '‎╰┈─ׅ──ֺ─ֺ───ׅ─  ׅ ⏝ׅ︶ ׅ 𝅄',
  ].join('\n')
}

function buildKategoriBlock(categoryTitle, commandList) {
  const lines = [`‎┇╭──•  *( ${categoryTitle.toUpperCase()} )*`, '‎┇‎├───────────']
  commandList.forEach((cmd) => lines.push(`‎┇│‎✎ ${cmd}`))
  lines.push('‎┇‎╰───────⌯⌲')
  return lines.join('\n')
}

export function buildMenuFooter({ prefix = settings.defaultPrefix, pushName = 'Kak', contactNumber = '-', isOwnerUser = false, registeredAt = null } = {}) {
  const lines = []

  lines.push(`┇👋 Hai welcome saya *${settings.botName}*`)
  lines.push('‎┇ WhatsApp Bot pintar & multifungsi')
  lines.push('‎┇ Dirancang untuk memudahkan harimu')
  lines.push('‎┇ Semua fitur sudah aktif dan lengkap')
  lines.push('')
  lines.push(
    buildInfoBlock({
      botName: settings.botName,
      ownerName: settings.ownerName,
      botVersion: settings.botVersion,
      botMode: settings.botMode,
      pushName,
      contactNumber,
      isOwnerUser,
      registeredAt,
    })
  )

  return lines.join('\n')
}

export function buildCategoryList({ prefix = settings.defaultPrefix } = {}) {
  const activeCategories = getAllCategories()
    .map((key) => ({ key, meta: resolveCategoryMeta(key) }))
    .filter(({ key }) => getPluginsByCategory(key).length > 0)
    .sort((a, b) => a.key.localeCompare(b.key))

  const categoryRows = activeCategories.map(({ key, meta }) => {
    const total = getPluginsByCategory(key).length
    return {
      title: `${meta.title} • ${total} fitur`,
      description: meta.description || `Kumpulan fitur ${meta.title.toLowerCase()}`,
      command: `${prefix}kategori ${key}`,
    }
  })

  return {
    listTitle: 'Pilih Kategori',
    sections: [
      {
        title: 'Menu Utama',
        highlightLabel: 'Rekomendasi',
        rows: [
          {
            header: '📖',
            title: 'Semua Fitur',
            description: 'Daftar lengkap seluruh perintah bot',
            command: `${prefix}allmenu`,
          },
          {
            header: '🫅',
            title: 'Owner Bot',
            description: 'Kirim kontak owner bot',
            command: `${prefix}owner`,
          },
        ],
      },
      {
        title: 'Kategori Tersedia',
        rows: categoryRows,
      },
      {
        title: 'Pusat Bantuan & Dukungan',
        highlightLabel: 'Support Kami',
        rows: [
          {
            header: '💝',
            title: 'Donasi',
            description: 'Dukung pengembangan dan operasional Habibih Cloud ID',
            command: `${prefix}donasi`,
          },
          {
            header: '📜',
            title: 'Peraturan Bot',
            description: 'Panduan penggunaan bot yang aman dan tertib',
            command: `${prefix}peraturan`,
          },
        ],
      },
    ],
  }
}

export function buildCategoryText(categoryKey, { prefix = settings.defaultPrefix, pushName = 'Kak', contactNumber = '-', isOwnerUser = false, registeredAt = null } = {}) {
  const meta = resolveCategoryMeta(categoryKey)

  const commandList = getPluginsByCategory(categoryKey)
    .flatMap((plugin) => {
      const names = Array.isArray(plugin.menuHelp) ? plugin.menuHelp : [Array.isArray(plugin.help) ? plugin.help[0] : plugin.help]
      return names.filter(Boolean).map((name) => `${prefix}${name}`)
    })
    .sort()

  return [
    `┇👋 Hai welcome saya *${settings.botName}!*`,
    '‎┇ WhatsApp Bot pintar & multifungsi',
    '‎┇ Dirancang untuk memudahkan harimu',
    '‎┇ Semua fitur sudah aktif dan lengkap',
    '',
    buildInfoBlock({
      botName: settings.botName,
      ownerName: settings.ownerName,
      botVersion: settings.botVersion,
      botMode: settings.botMode,
      pushName,
      contactNumber,
      isOwnerUser,
      registeredAt,
    }),
    '',
    '‎▭▬▭▬▭▬▭▬▭▬▭▬▭',
    '',
    buildKategoriBlock(meta.title, commandList.length ? commandList : ['Belum ada fitur di kategori ini']),
    '',
    creatorWatermark(),
  ].join('\n')
}

export function buildFullMenuText({ prefix = settings.defaultPrefix, pushName = 'Kak', contactNumber = '-', isOwnerUser = false, registeredAt = null } = {}) {
  const activeCategories = getAllCategories()
    .map((key) => ({ key, meta: resolveCategoryMeta(key) }))
    .filter(({ key }) => getPluginsByCategory(key).length > 0)
    .sort((a, b) => a.key.localeCompare(b.key))

  const blocks = activeCategories.map(({ key, meta }) => {
    const commandList = getPluginsByCategory(key)
      .flatMap((plugin) => {
        const names = Array.isArray(plugin.menuHelp) ? plugin.menuHelp : [Array.isArray(plugin.help) ? plugin.help[0] : plugin.help]
        return names.filter(Boolean).map((name) => `${prefix}${name}`)
      })
      .sort()

    return buildKategoriBlock(meta.title, commandList)
  })

  return [
    `┇👋 Hai welcome saya *${settings.botName}!*`,
    '‎┇ WhatsApp Bot pintar & multifungsi',
    '‎┇ Dirancang untuk memudahkan harimu',
    '‎┇ Semua fitur sudah aktif dan siap lengkap',
    '',
    buildInfoBlock({
      botName: settings.botName,
      ownerName: settings.ownerName,
      botVersion: settings.botVersion,
      botMode: settings.botMode,
      pushName,
      contactNumber,
      isOwnerUser,
      registeredAt,
    }),
    '',
    '‎▭▬▭▬▭▬▭▬▭▬▭▬▭',
    '',
    blocks.join('\n\n'),
    '',
    creatorWatermark(),
  ].join('\n')
}

export default { buildMenuFooter, buildCategoryList, buildCategoryText, buildFullMenuText, getSystemInfo, getGreeting }
