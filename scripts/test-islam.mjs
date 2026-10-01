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


/* ---------- ADZAN: SETTING KOTA ---------- */
const adzanMod = await import('../plugins/islam/adzan.js')
{
  const chat = '628999@s.whatsapp.net'
  const out = []
  const conn = buatConn(out)
  const msg = (args) => m(args)

  await plug.adzan(msg(['on', 'serang']), { conn, usedPrefix: '.' })
  let t = out.join('')
  cek('adzan on serang: konfirmasi aktif', t.includes('AKTIF'), t.slice(0, 70))
  cek('adzan on serang: kota tersimpan', t.includes('Serang'), t.slice(0, 70))
  cek('adzan on serang: zona WIB', t.includes('WIB'))
  cek('adzan on serang: tampil waktu maghrib', t.includes('Maghrib'))
}

{
  const chat = '628998@s.whatsapp.net'
  const out = []
  const conn = buatConn(out)
  await plug.adzan(m(['on', 'makassar']), { conn, usedPrefix: '.' })
  cek('adzan on makassar: zona WITA', out.join('').includes('WITA'), out.join('').slice(0, 70))
}

{
  const out = []
  await plug.adzan(m(['on', 'kota ngawur']), { conn: buatConn(out), usedPrefix: '.' })
  cek('adzan on kota ngawur: pesan error', out.join('').includes('tidak ditemukan'), out.join('').slice(0, 70))
}

{
  const out = []
  await plug.adzan(m(['status']), { conn: buatConn(out), usedPrefix: '.' })
  const t = out.join('')
  cek('adzan status: tampil pengaturan', t.includes('Pengaturan adzan') && t.includes('Kota'))
}

{
  const out = []
  await plug.adzan(m(['off']), { conn: buatConn(out), usedPrefix: '.' })
  cek('adzan off: konfirmasi nonaktif', out.join('').includes('NONAKTIF'))
}

/* ---------- SCHOLAT: SERANG ---------- */
{
  const out = []
  await plug.sholat(m(['serang']), { conn: buatConn(out), usedPrefix: '.' })
  const t = out.join('\n')
  cek('sholat serang: nama kota', t.includes('Serang'))
  cek('sholat serang: zona WIB', t.includes('WIB'))
  cek('sholat serang: 8 waktu', ['Imsak','Subuh','Terbit','Dhuha','Dzuhur','Ashar','Maghrib','Isya'].every((w) => t.includes(w)))
}

/* ---------- SCHEDULER ---------- */
{
  const { adzanTerjadwal, resetCache } = await import('../lib/scheduler-adzan.js')
  const { hitungJadwal, cariKota, zonaKota } = await import('../lib/jadwal-sholat.js')

  const serang = cariKota('serang')
  const peng = new Map([['grup-tes', { aktif: true, kota: 'serang' }]])
  const j = hitungJadwal({ latitude: serang.lat, longitude: serang.lon, tanggal: new Date(2026, 9, 2), zonaWaktu: zonaKota(serang).jam })
  const [h, mn] = j.subuh.split('.').map(Number)
  const saatSubuh = new Date(Date.UTC(2026, 9, 2, h - 7, mn, 0))

  resetCache()
  const r1 = adzanTerjadwal(peng, saatSubuh)
  cek('scheduler: trigger saat subuh Serang', r1.length === 1 && r1[0].kota.nama === 'Serang', JSON.stringify(r1.map((x) => x.jam)))
  cek('scheduler: nama waktu benar', r1[0]?.nama === 'Subuh', r1[0]?.nama)

  const r2 = adzanTerjadwal(peng, saatSubuh)
  cek('scheduler: tidak kirim dobel', r2.length === 0, String(r2.length))

  resetCache()
  const nonaktif = new Map([['grup-x', { aktif: false, kota: 'serang' }]])
  cek('scheduler: hormat status nonaktif', adzanTerjadwal(nonaktif, saatSubuh).length === 0)

  resetCache()
  const lain = new Date(saatSubuh.getTime() + 3600_000)
  cek('scheduler: diam di luar waktu adzan', adzanTerjadwal(peng, lain).length === 0)
}


/* ---------- ADZAN: AUDIO & TEKS SUBUH ---------- */
{
  const adzanLib = await import('../lib/adzan.js')
  const files = await adzanLib.daftarAdzan()
  cek('adzan: berkas mp3 ada', files.length >= 5, String(files.length) + ' file: ' + files.join(','))

  for (const w of ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya']) {
    const f = await adzanLib.adzanLokal(w)
    cek('adzan audio ' + w + ': buffer valid', f && f.buffer.length > 100000,
      f ? f.nama + ' ' + f.buffer.length + 'b' : 'null')
  }

  // khusUS: adzan Subuh harus punya 3 takbir setelah shahada, non-Subuh 2
  const oS = [], oM = []
  await plug.adzan(m(['audio', 'subuh']), { conn: buatConn(oS), usedPrefix: '.' })
  await plug.adzan(m(['audio', 'maghrib']), { conn: buatConn(oM), usedPrefix: '.' })
  const tS = oS[0] || ''
  const tM = oM[0] || ''
  // baris setelah dua "la ilaha" (shahada)
  function takbirSetelahShahada(txt) {
    const baris = txt.split('\n')
    const idx = baris.findIndex((b) => b.includes('لَا إِلٰهَ إِلَّا') )
    if (idx < 0) return 0
    const setelah = baris.slice(idx + 1)
    for (const b of setelah) {
      const n = (b.match(/اَللّٰهُ أَكْبَرُ/g) || []).length
      if (n > 0) return n
    }
    return 0
  }
  cek('adzan: subuh punya 3 takbir setelah shahada', takbirSetelahShahada(tS) === 3, String(takbirSetelahShahada(tS)))
  cek('adzan: maghrib punya 2 takbir setelah shahada', takbirSetelahShahada(tM) === 2, String(takbirSetelahShahada(tM)))
  cek('adzan: teks subuh != maghrib', tS !== tM)
  cek('adzan: ada credit lisensi', tS.includes('Public Domain'))
}

console.log(`\n========== HASIL ADZAN: ${lulus} lulus, ${gagal} gagal ==========\n`)
process.exit(gagal ? 1 : 0)
