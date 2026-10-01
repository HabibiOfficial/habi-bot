/**
 * Scan command bot: deteksi tabrakan nama command antar plugin.
 *
 * Memakai loader resmi (core/pemuat-plugin.js) agar hasilnya sama persis
 * dengan cara bot mencocokkan command saat runtime.
 *
 * Menjalankan: node scripts/scan-commands.mjs
 */
import { loadAllPlugins, getCommandEntries, pluginStore } from '../core/pemuat-plugin.js'

/** petakan handler -> relative path plugin */
const namaPlugin = new Map()
for (const [rel, h] of pluginStore) namaPlugin.set(h, rel)

const { total, loaded } = await loadAllPlugins()

console.log('  plugin dimuat :', loaded, '/', total)
console.log('  command unik  :', getCommandEntries().length)
console.log('')

const bank = new Map()
for (const e of getCommandEntries()) {
  if (!bank.has(e.command)) bank.set(e.command, [])
  bank.get(e.command).push((e.plugin.filePath || '').split('/').slice(-2).join('/') || 'plugin')
}

const dup = [...bank.entries()]
  .map(([k, v]) => [k, [...new Set(v)]])
  .filter(([, v]) => v.length > 1)
  .sort((a, b) => a[0].localeCompare(b[0]))

if (dup.length) {
  console.log('  BENTROK (' + dup.length + '):')
  for (const [k, v] of dup) {
    console.log('    .' + k.padEnd(22) + ' -> ' + v.join('   |   '))
  }
} else {
  console.log('  ✅ tidak ada command bentrok')
}

console.log('')
console.log('  command Islam terdaftar:')
const islam = ['sholat', 'salat', 'jadwalsholat', 'doa', 'adzan', 'adzhan', 'dzikir', 'zikir']
let hilang = 0
for (const k of islam) {
  const v = bank.get(k)
  console.log('    .' + k.padEnd(16) + (v ? '-> ' + v.join(', ') : 'TIDAK ADA'))
  if (!v) hilang++
}

const belum = pluginStore.size
console.log('')
console.log('  total plugin aktif:', belum)
process.exit(dup.length ? 1 : 0)
