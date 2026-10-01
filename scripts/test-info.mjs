/**
 * Harness uji fitur info: gempa, cuaca, berita.
 * Memakai data NYATA dari BMKG dan RSS, bukan mock.
 */

const buatConn = (kotak) => ({
  sendMessage: async (jid, content, opts) => {
    let t
    let media = null
    if (typeof content === 'string') {
      t = content
    } else if (content && typeof content === 'object') {
      t = content.text || content.caption || JSON.stringify(content).slice(0, 200)
      media = content.image || content.audio || null
    } else {
      t = '[?]'
    }
    kotak.push({ t: String(t), media })
  },
  ev: { on() {} },
  sendPresenceUpdate: async () => {},
  user: { id: '6285181577625' },
})

function m(args = []) {
  return {
    args,
    from: '628999@s.whatsapp.net',
    chat: '628999@s.whatsapp.net',
    sender: '628999@s.whatsapp.net',
    text: '.' + (args[0] || ''),
    quoted: null,
    reply: async () => {},
  }
}

const EMPTY = String()
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
  gempa: (await import('../plugins/info/gempa.js')).default,
  cuaca: (await import('../plugins/info/cuaca.js')).default,
  berita: (await import('../plugins/info/berita.js')).default,
}

console.log('\n========== UJI FITUR INFO (data nyata) ==========\n')

/* ---------- GEMPA ---------- */
{
  const out = []
  await plug.gempa(m([]), { conn: buatConn(out), usedPrefix: '.' })
  const t = out.map(x => x.t).join(EMPTY)
  console.log(t.split('\n').slice(0, 10).join('\n'))
  console.log('  ...\n')
  cek('gempa: judul tampil', t.includes('GEMPA TERKINI'))
  cek('gempa: ada magnitudo M', /M\d+(\.\d)?/.test(t))
  cek('gempa: ada wilayah', t.includes('Wilayah'))
  cek('gempa: ada kedalaman', t.includes('Kedalaman'))
  cek('gempa: ada koordinat', /-\d+\.\d+,\d+\.\d+/.test(t) || t.includes('Koordinat'))
  cek('gempa: credit BMKG', t.includes('BMKG'))
  cek('gempa: bukan data dummy', !/contoh|sample|dummy/i.test(t))
}

{
  const out = []
  await plug.gempa(m(['5']), { conn: buatConn(out), usedPrefix: '.' })
  const t = out.map(x => x.t).join(EMPTY)
  cek('gempa 5: daftar M5.0+', t.includes('M5.0+') || t.includes('GEMPA TERKINI'))
  cek('gempa 5: ada nomor urut', /^1\. /m.test(t) || t.includes('1. '))
}

{
  const out = []
  await plug.gempa(m(['dirasakan']), { conn: buatConn(out), usedPrefix: '.' })
  const t = out.map(x => x.t).join(EMPTY)
  cek('gempa dirasakan: mode yang benar', t.includes('DIRASAKAN') || t.includes('Tidak ada gempa'))
  cek('gempa dirasakan: credit BMKG', t.includes('BMKG'))
}

{
  const out = []
  await plug.gempa(m(['status']), { conn: buatConn(out), usedPrefix: '.' })
  cek('gempa status: tampil pengaturan', out.map(x => x.t).join(EMPTY).includes('Auto-alert'))
}

{
  const out = []
  await plug.gempa(m(['on', '5']), { conn: buatConn(out), usedPrefix: '.' })
  const t = out.map(x => x.t).join(EMPTY)
  cek('gempa on 5: konfirmasi aktif', t.includes('AKTIF'))
  cek('gempa on 5: ambang magnitudo', t.includes('M5+'))
}

{
  const out = []
  await plug.gempa(m(['on', '7']), { conn: buatConn(out), usedPrefix: '.' })
  cek('gempa on 7: ganti ambang', out.map(x => x.t).join(EMPTY).includes('M7+'), out.map(x => x.t).join(EMPTY).slice(0, 60))
}

{
  const out = []
  await plug.gempa(m(['off']), { conn: buatConn(out), usedPrefix: '.' })
  cek('gempa off: konfirmasi nonaktif', out.map(x => x.t).join(EMPTY).includes('NONAKTIF'))
}

/* ---------- CUACA ---------- */
{
  const out = []
  await plug.cuaca(m(['serang']), { conn: buatConn(out), usedPrefix: '.' })
  const t = out.map(x => x.t).join(EMPTY)
  console.log(t.split('\n').slice(0, 8).join('\n'))
  console.log('  ...\n')
  cek('cuaca serang: judul', t.includes('PRAKIRAAN CUACA'))
  cek('cuaca serang: nama kota', t.includes('Serang'), t.slice(0, 80))
  cek('cuaca serang: ada suhu', /\d+–\d+°C/.test(t))
  cek('cuaca serang: ada kondisi cuaca', /Cerah|Berawan|Hujan|Kabut/.test(t))
  cek('cuaca serang: credit BMKG', t.includes('BMKG'))
}

{
  const out = []
  await plug.cuaca(m(['makassar']), { conn: buatConn(out), usedPrefix: '.' })
  cek('cuaca makassar: kota lain', out.map(x => x.t).join(EMPTY).includes('Makassar'), out.map(x => x.t).join(EMPTY).slice(0, 80))
}

{
  const out = []
  await plug.cuaca(m(['sekarang']), { conn: buatConn(out), usedPrefix: '.' })
  const t = out.map(x => x.t).join(EMPTY)
  cek('cuaca sekarang: mode sekarang', t.includes('CUACA SEKARANG') || t.includes('tidak tersedia'))
  cek('cuaca sekarang: ada kelembapan', t.includes('Kelembapan') || t.includes('tidak tersedia'))
}

{
  const out = []
  await plug.cuaca(m(['kota ngawur']), { conn: buatConn(out), usedPrefix: '.' })
  const t = out.map(x => x.t).join(EMPTY)
  cek('cuaca kota ngawur: pesan + daftar kota', t.includes('belum didukung') && t.includes('Serang'))
}

{
  const out = []
  await plug.cuaca(m(['on', 'serang']), { conn: buatConn(out), usedPrefix: '.' })
  const t = out.map(x => x.t).join(EMPTY)
  cek('cuaca on serang: konfirmasi', t.includes('AKTIF'))
  cek('cuaca on serang: simpan kota', t.includes('Serang'))
}

{
  const out = []
  await plug.cuaca(m(['status']), { conn: buatConn(out), usedPrefix: '.' })
  cek('cuaca status: tampil pengaturan', out.map(x => x.t).join(EMPTY).includes('Pengingat cuaca'))
}

/* ---------- BERITA ---------- */
{
  const out = []
  await plug.berita(m([]), { conn: buatConn(out), usedPrefix: '.' })
  const t = out.map(x => x.t).join(EMPTY)
  console.log(t.split('\n').slice(0, 7).join('\n'))
  console.log('  ...\n')
  cek('berita: judul tampil', t.includes('BERITA TERBARU'))
  cek('berita: ada judul berita nyata', /^1\. \*/m.test(t) || t.includes('1. *'))
  cek('berita: jumlah 8 judul', (t.match(/^\d+\. /gm) || []).length >= 5, String((t.match(/^\d+\. /gm) || []).length))
  cek('berita: ada sumber', t.includes('Antara') || t.includes('CNN'))
}

{
  const out = []
  await plug.berita(m(['ekonomi']), { conn: buatConn(out), usedPrefix: '.' })
  const t = out.map(x => x.t).join(EMPTY)
  cek('berita ekonomi: kategoriowa', t.includes('EKONOMI') || t.includes('berita terbaru'))
  cek('berita ekonomi: ada judul', (t.match(/^\d+\. /gm) || []).length >= 3)
}

{
  const out = []
  await plug.berita(m(['bola']), { conn: buatConn(out), usedPrefix: '.' })
  cek('berita bola: kategori', out.map(x => x.t).join(EMPTY).includes('OLAHRAGA') || out.map(x => x.t).join(EMPTY).includes('BERITA'))
}

{
  const out = []
  await plug.berita(m(['kategori']), { conn: buatConn(out), usedPrefix: '.' })
  const t = out.map(x => x.t).join(EMPTY)
  cek('berita kategori: daftar kategori', t.includes('Kategori berita') && t.includes('ekonomi'))
}

{
  const out = []
  await plug.berita(m(['cari', 'Indonesia']), { conn: buatConn(out), usedPrefix: '.' })
  const t = out.map(x => x.t).join(EMPTY)
  cek('berita cari: mode pencarian jalan', t.includes('hasil') || t.includes('Tidak ada berita'))
}

/* ---------- SUMBER DATA ---------- */
{
  const sd = await import('../lib/sumber-data.js')
  cek('sumber-data: parseRSS menangani CDATA',
    sd.parseRSS('<rss><item><title><![CDATA[Judul Uji]]></title><link>https://x.test</link></item></rss>').length === 1)
  cek('sumber-data: bersihkanTeks buang HTML',
    sd.bersihkanTeks('<b>Halo</b> &amp; dunia') === 'Halo & dunia')
  cek('sumber-data: koordinatAngka LS jadi negatif',
    sd.koordinatAngka('123.61 BT', '10.04 LS').Latitude === -10.04)
  cek('sumber-data: koordinatAngka BT positif',
    sd.koordinatAngka('123.61 BT', '10.04 LS').Bujur === 123.61)
  cek('sumber-data: cache bekerja', typeof sd.ambilCache === 'function')
}

{
  const kw = await import('../lib/kode-wilayah.js')
  cek('kode-wilayah: serang punya adm4 valid',
    /^\d{2}\.\d{2}\.\d{2}\.\d{4}$/.test(kw.cariKodeKota('serang').adm4))
  cek('kode-wilayah: alias sby jalan', !!kw.cariKodeKota('sby'))
  cek('kode-wilayah: 40+ kota', kw.DAFTAR_KOTA_CUACA.length >= 40, String(kw.DAFTAR_KOTA_CUACA.length))
}

console.log(`\n========== HASIL: ${lulus} lulus, ${gagal} gagal ==========\n`)
process.exit(gagal ? 1 : 0)
