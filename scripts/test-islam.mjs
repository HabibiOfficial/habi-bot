/**
 * Harness uji plugin Islam (sholat / doa / adzan) tanpa koneksi WA.
 * Mengganti conn & m dengan mock, lalu mencetak output nyata.
 */

const buatConn = (kotak) => ({
  sendMessage: async (jid, content) => {
    const t = typeof content === 'string' ? content : content?.text || content?.caption || '[media]'
    kotak.push(t)
  },
  ev: { on() {} },
  sendPresenceUpdate: async () => {},
  user: { id: '6285181577625' },
})

function m(args = [], dari = 's.whatsapp.net') {
  return {
    args,
    from: `6289999999999@${dari}`,
    chat: '6289999999999@' + dari,
    sender: '6289999999999@' + dari,
    text: '.' + (args[0] || ''),
    quoted: null,
    reply: async () => {},
  }
}

let lulus = 0
let gagal = 0

function cek(nama, syarat, info = '') {
  if (syarat) {
    console.log('  OK   ' + nama)
    lulus++
  } else {
    console.log('  GAGAL ' + nama + ' ' + info)
    gagal++
  }
}

const plug = {
  sholat: (await import('../plugins/islam/sholat.js')).default,
  doa: (await import('../plugins/islam/doa.js')).default,
  adzan: (await import('../plugins/islam/adzan.js')).default,
  dzikir: (await import('../plugins/islam/dzikir.js')).default,
}

console.log('\n========== UJI PLUGIN ISLAM ==========\n')

/* ---------- SHOLAT ---------- */
{
  const out = []
  await plug.sholat(m(['jakarta']), { conn: buatConn(out), usedPrefix: '.' })
  const t = out.join('\n')
  console.log(t)
  console.log('')
  cek('sholat: judul tampil', t.includes('JADWAL SHOLAT'))
  cek('sholat: nama kota', t.includes('Jakarta'))
  cek('sholat: zona WIB', t.includes('WIB'))
  cek('sholat: 8 waktu ada', ['Imsak','Subuh','Terbit','Dhuha','Dzuhur','Ashar','Maghrib','Isya'].every((w) => t.includes(w)))
  cek('sholat: jam format HH.MM', /\d{2}\.\d{2}/.test(t))
  cek('sholat: ada waktu berikutnya', t.includes('Berikutnya'))
  cek('sholat: tanggal hijriah utuh (bukan desimal)', /\d+ [A-Za-z]+(?: [A-Za-z]+)* \d+ H/.test(t))
}

{
  const out = []
  await plug.sholat(m(['makassar']), { conn: buatConn(out), usedPrefix: '.' })
  cek('sholat: kota lain -> WITA', out.join('').includes('WITA'), out.join('').slice(0, 90))
}

{
  const out = []
  await plug.sholat(m(['jayapura']), { conn: buatConn(out), usedPrefix: '.' })
  cek('sholat: kota lain -> WIT', out.join('').includes('WIT'), out.join('').slice(0, 90))
}

{
  const out = []
  await plug.sholat(m(['kota ngawur xyz']), { conn: buatConn(out), usedPrefix: '.' })
  cek('sholat: kota tak dikenal -> fallback Jakarta', out.join('').includes('Jakarta'))
}

/* ---------- DOA ---------- */
{
  const out = []
  await plug.doa(m([]), { conn: buatConn(out), usedPrefix: '.' })
  const t = out.join('\n')
  console.log(t)
  console.log('')
  cek('doa random: teks arab', /[\u0600-\u06FF]/.test(t))
  cek('doa random: ada latin', t.includes('_'))
  cek('doa random: ada arti', t.includes('\uD83D\uDCAC'))
  cek('doa random: ada sumber', t.includes('\uD83D\uDCDB') || t.includes('HR.') || t.includes('QS.'))
}

{
  const out = []
  await plug.doa(m(['rezeki']), { conn: buatConn(out), usedPrefix: '.' })
  const t = out.join('\n')
  cek('doa topik: beberapa hasil', (t.match(/━━━/g) || []).length >= 2, 'hanya ' + (t.match(/━━━/g) || []).length)
  cek('doa topik: judul terindeks', t.includes('*1.'))
}

{
  const out = []
  await plug.doa(m(['makan']), { conn: buatConn(out), usedPrefix: '.' })
  cek('doa pencarian: kata makan ketemu', out.join('').includes('Makan'))
}

{
  const out = []
  await plug.doa(m(['zzzztidakada']), { conn: buatConn(out), usedPrefix: '.' })
  const t = out.join('\n')
  cek('doa tidak ditemukan: pesan + daftar kategori', t.includes('tidak ditemukan') && t.includes('Kategori tersedia'))
}

/* ---------- ADZAN ---------- */
{
  const out = []
  await plug.adzan(m([]), { conn: buatConn(out), usedPrefix: '.' })
  const t = out.join('\n')
  console.log(t.slice(0, 300))
  console.log('')
  cek('adzan: teks arab', /[\u0600-\u06FF]/.test(t))
  cek('adzan: menyebut waktu sholat', t.includes('Maghrib') && t.includes('Isya'))
}

{
  const out = []
  await plug.adzan(m(['list']), { conn: buatConn(out), usedPrefix: '.' })
  cek('adzan list: jalan tanpa error', out.join('').length > 0)
}

{
  const out = []
  await plug.adzan(m(['on']), { conn: buatConn(out), usedPrefix: '.' })
  cek('adzan on: konfirmasi aktif', out.join('').includes('AKTIF'))
}

{
  const out = []
  await plug.adzan(m(['audio']), { conn: buatConn(out), usedPrefix: '.' })
  const t = out.join('\n')
  cek('adzan audio: fallback teks bila file tak ada', t.includes('belum tersedia') || t.includes('ADZAN'), t.slice(0, 90))
}


/* ---------- DZIKIR ---------- */
{
  const out = []
  await plug.dzikir(m([]), { conn: buatConn(out), usedPrefix: '.' })
  const t = out.join('\n')
  cek('dzikir: tanpa argumen -> daftar target', t.includes('DZIKIR') && t.includes('•'))
  cek('dzikir: target subuh tersedia', t.includes('Subuh'))
}

{
  const out = []
  await plug.dzikir(m(['subuh']), { conn: buatConn(out), usedPrefix: '.' })
  const t = out.join('\n')
  cek('dzikir: target subuh -> arab istighfar', /[\u0600-\u06FF]/.test(t))
  cek('dzikir: ada hitungan target', t.includes('Target: 100x'))
}

{
  const out = []
  await plug.dzikir(m(['setelah', 'maghrib']), { conn: buatConn(out), usedPrefix: '.' })
  cek('dzikir: dua kata dikenali', out.join('').includes('Maghrib'), out.join('').slice(0, 90))
}

{
  const out = []
  await plug.dzikir(m(['ngawurxyz']), { conn: buatConn(out), usedPrefix: '.' })
  cek('dzikir: target tak dikenal -> pesan error', out.join('').includes('tidak dikenal'))
}

console.log(`\n========== HASIL AKHIR: ${lulus} lulus, ${gagal} gagal ==========\n`)
process.exit(gagal ? 1 : 0)
