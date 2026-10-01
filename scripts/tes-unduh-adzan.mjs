/**
 * Tes: bot mengunduh audio adzan sendiri dari GitHub Release.
 * Jalankan: node scripts/tes-unduh-adzan.mjs
 */
import { createHash } from 'node:crypto'
import { unduhAdzan, unduhSemuaAdzan, statusAdzan, bersihkanCacheAdzan } from '../lib/adzan-download.js'

const MB = 1048576
const cek = (b) => (b ? `✅ ${b.nama} ${(b.buffer.length / MB).toFixed(2)} MB dariCache=${b.dariCache}` : '❌ gagal')

console.log('=== STATUS SEBELUM ===')
for (const s of await statusAdzan()) {
  console.log(`  ${s.ada ? '✅' : '⬜'} ${s.waktu.padEnd(8)} ${s.ukuran ? (s.ukuran / MB).toFixed(2) + ' MB' : 'belum ada'}`)
}

console.log('\n=== UNDUH SATU (maghrib) ===')
const satu = await unduhAdzan('maghrib', {})
console.log('  ' + cek(satu))
if (satu) console.log('   sha256:', createHash('sha256').update(satu.buffer).digest('hex').slice(0, 16))

console.log('\n=== UNDUH SEMUA ===')
const { berhasil, gagal } = await unduhSemuaAdzan({})
console.log(`  ✅ berhasil: ${berhasil.length}  ❌ gagal: ${gagal.length ? gagal.join(',') : 'tidak ada'}`)

console.log('\n=== STATUS SESUDAH ===')
for (const s of await statusAdzan()) {
  console.log(`  ${s.ada ? '✅' : '⬜'} ${s.waktu.padEnd(8)} ${s.ukuran ? (s.ukuran / MB).toFixed(2) + ' MB' : 'belum ada'}`)
}

console.log('\n=== BERSIHKAN ===')
const hapus = await bersihkanCacheAdzan()
console.log('  dihapus:', hapus.length, 'berkas')
