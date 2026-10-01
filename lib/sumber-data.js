/**
 * ╔══════════════════════════════════════════════╗
 * ║  ------ HABI AI --------                      ║
 * ║  WA Bot • by Habibih Official ID             ║
 * ╚══════════════════════════════════════════════╝
 *
 * Sumber data resmi untuk fitur berita, cuaca, dan gempa.
 *
 * GEMPA  -> BMKG Data Gempabumi Terbuka (gratis, tanpa API key)
 * CUACA  -> BMKG Prakiraan Cuaca Terbuka (gratis, tanpa API key)
 * BERITA -> RSS feed publik
 *
 * Semua data BMKG wajib dicantumkan sumbernya sesuai ketentuan BMKG.
 *
 * @author Habibih Official ID
 * @source Habibih Cloud ID
 */

import { createHash } from 'node:crypto'

/* ────────────────────────── CACHE ────────────────────────── */

const cache = new Map()

/**
 * Ambil dari cache, atau jalankan pemuat lalu simpan.
 * @param {string} kunci
 * @param {number} ttlDetik
 * @param {Function} pemuat async () => nilai
 */
export async function ambilCache(kunci, ttlDetik, pemuat) {
  const sekarang = Date.now()
  const item = cache.get(kunci)
  if (item && sekarang - item.waktu < ttlDetik * 1000) return item.nilai

  try {
    const nilai = await pemuat()
    cache.set(kunci, { nilai, waktu: sekarang })
    return nilai
  } catch (err) {
    // Kalau gagal tapi ada data lama, lebih baik pakai data lama daripada kosong
    if (item) {
      cache.set(kunci, { nilai: item.nilai, waktu: item.waktu })
      return item.nilai
    }
    throw err
  }
}

export function bersihkanCache() {
  cache.clear()
}

/* ────────────────────────── HTTP ────────────────────────── */

const UA = 'HabibiCloudBot/1.3 (WhatsApp bot; +6285181576338)'

/**
 * Fetch JSON dengan timeout dan validasi.
 * @param {string} url
 * @param {object} [opts] { headers, timeoutMs }
 */
export async function ambilJSON(url, opts = {}) {
  const { headers = {}, timeoutMs = 20_000 } = opts
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'application/json', ...headers },
      signal: ctrl.signal,
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Fetch teks/HTML dengan timeout.
 * @param {string} url
 * @param {object} [opts] { timeoutMs }
 */
export async function ambilTeks(url, opts = {}) {
  const { timeoutMs = 20_000 } = opts
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA },
      signal: ctrl.signal,
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.text()
  } finally {
    clearTimeout(timer)
  }
}

/* ────────────────────────── GEMPA ────────────────────────── */

const GEMPA = {
  terbaru: 'https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json',
  terkini: 'https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json',
  dirasakan: 'https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json',
  shakemap: (nama) => `https://data.bmkg.go.id/DataMKG/TEWS/${nama}`,
  CAP: 'https://www.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json',
}

/** Ubah "1.60 LS" -> -1.60, "138.88 BT" -> 138.88 */
export function koordinatAngka(bujur, lintang) {
  let Latitude = parseFloat(String(lintang || '').replace(/[^0-9.-]/g, ''))
  let Bujur = parseFloat(String(bujur || '').replace(/[^0-9.-]/g, ''))
  if (String(lintang || '').includes('LS')) Latitude = -Math.abs(Latitude)
  if (String(bujur || '').includes('BB')) Bujur = -Math.abs(Bujur)
  return { Latitude, Bujur }
}

/**
 * Normalisasi satu objek gempa.
 * Mirip bentuk API BMKG.
 */
function rapikanGempa(g) {
  if (!g || typeof g !== 'object') return null
  const Magnitude = parseFloat(g.Magnitude)
  if (Number.isNaN(Magnitude)) return null

  const tanggal = String(g.Tanggal || '').trim()
  const jam = String(g.Jam || '').trim()

  return {
    tanggal,
    jam,
    tanggalWaktu: `${tanggal} ${jam}`.trim(),
    magnitudo: Magnitude,
    kedalaman: g.Kedalaman || '-',
    wilayah: g.Wilayah || '-',
    potensi: g.Potensi || '-',
    dirasakan: g.Dirasakan || '',
    lintang: g.Lintang || '-',
    bujur: g.Bujur || '-',
    koordinat: g.Coordinates || '-',
    shakemap: g.Shakemap || null,
    koordinatAngka: koordinatAngka(g.Bujur, g.Lintang),
  }
}

/**
 * Gempa terbaru.
 * CATATAN: autogempa.json mengembalikan `gempa` sebagai OBJECT,
 * sedangkan gempaterkini.json mengembalikannya sebagai ARRAY.
 * Keduanya harus ditangani.
 */
export async function gempaTerbaru() {
  return ambilCache('gempa:terbaru', 60, async () => {
    const d = await ambilJSON(GEMPA.terbaru)
    const g = d?.Infogempa?.gempa
    const obj = Array.isArray(g) ? g[0] : g
    const rapi = rapikanGempa(obj)
    if (!rapi) throw new Error('Format data BMKG tidak dikenali')
    return rapi
  })
}

/** Gempa M5.0+ terakhir. */
export async function gempaTerkini(jumlah = 15) {
  return ambilCache('gempa:terkini', 120, async () => {
    const d = await ambilJSON(GEMPA.terkini)
    const arr = d?.Infogempa?.gempa
    if (!Array.isArray(arr)) throw new Error('Format data BMKG tidak dikenali')
    return arr.map(rapikanGempa).filter(Boolean)
  }).then((list) => list.slice(0, jumlah))
}

/** Gempa yang dirasakan masyarakat. */
export async function gempaDirasakan(jumlah = 15) {
  return ambilCache('gempa:dirasakan', 120, async () => {
    const d = await ambilJSON(GEMPA.dirasakan)
    const arr = d?.Infogempa?.gempa
    if (!Array.isArray(arr)) throw new Error('Format data BMKG tidak dikenali')
    return arr.map(rapikanGempa).filter(Boolean)
  }).then((list) => list.slice(0, jumlah))
}

/** Ambil gambar shakemap (MMI) dan kembalikan sebagai buffer. */
export async function ambilShakemap(namaFile) {
  if (!namaFile || !/^[\w.-]+\.jpg$/i.test(String(namaFile))) return null
  const url = GEMPA.shakemap(namaFile)
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 20_000)
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: ctrl.signal })
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    return buf.length ? buf : null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

/* ────────────────────────── CUACA ────────────────────────── */

const CUACA = 'https://api.bmkg.go.id/publik/prakiraan-cuaca'

/**
 * Ambil prakiraan cuaca 3 hari untuk satu kode wilayah ADM4.
 * @param {string} adm4 contoh '36.73.01.1001'
 */
export async function cuacaADM4(adm4, ttlDetik = 1800) {
  const kode = String(adm4 || '').trim()
  if (!/^\d{2}\.\d{2}\.\d{2}\.\d{4}$/.test(kode)) {
    throw new Error('Kode wilayah tidak valid (contoh: 36.73.01.1001)')
  }

  return ambilCache(`cuaca:${kode}`, ttlDetik, async () => {
    const d = await ambilJSON(`${CUACA}?adm4=${kode}`)
    const blok = d?.data?.[0]
    if (!blok) throw new Error('Data cuaca tidak ditemukan')

    const lokasi = blok.lokasi || {}
    const hari = Array.isArray(blok.cuaca) ? blok.cuaca : []

    const harian = hari.map((periode) => {
      const p = periode[0] || {}
      const suhu = periode.map((x) => Number(x.t)).filter((n) => !Number.isNaN(n))
      return {
        tanggal: String(p.local_datetime || '').slice(0, 10),
        suhuMin: suhu.length ? Math.min(...suhu) : null,
        suhuMax: suhu.length ? Math.max(...suhu) : null,
        periode: periode.map((x) => ({
          jam: String(x.local_datetime || '').slice(11, 16),
          cuaca: x.weather_desc || '-',
          suhu: Number(x.t),
          kelembapan: Number(x.hu),
          angin: Number(x.ws),
          arahAngin: x.wd || '-',
          hujan: Number(x.tp) || 0,
        })),
      }
    })

    return {
      adm4: kode,
      provinsi: lokasi.provinsi || '-',
      kotkab: lokasi.kotkab || '-',
      kecamatan: lokasi.kecamatan || '-',
      desa: lokasi.desa || '-',
      lat: Number(lokasi.lat),
      lon: Number(lokasi.lon),
      harian,
      diaperbarui: new Date().toISOString(),
    }
  })
}

/* ────────────────────────── BERITA ────────────────────────── */

/**
 * Feed berita.
 *
 * Hanya feed yang benar-benar dapat diakses tanpa API key dan tanpa
 * pemblokir anti-bot yang sudah diuji:
 *   - Antara News  : per kategori, 20-50 judul
 *   - CNN Indonesia: 100 judul, dipakai sebagai cadangan saat kategori kosong
 *
 * Kompas/Tempo/Tirto mengembalikan HTTP 202/403 atau 0 byte sehingga
 * tidak dipakai.
 */
export const FEED = {
  indonesia:   { nama: 'Indonesia',    sumber: 'Antara News',        url: 'https://www.antaranews.com/rss/terkini.xml' },
  nasional:    { nama: 'Nasional',     sumber: 'Antara News',        url: 'https://www.antaranews.com/rss/terkini.xml' },
  politik:     { nama: 'Politik',      sumber: 'Antara News',        url: 'https://www.antaranews.com/rss/politik.xml' },
  ekonomi:     { nama: 'Ekonomi',      sumber: 'Antara News',        url: 'https://www.antaranews.com/rss/ekonomi.xml' },
  bisnis:      { nama: 'Bisnis',       sumber: 'Antara News',        url: 'https://www.antaranews.com/rss/ekonomi.xml' },
  metro:       { nama: 'Metro',        sumber: 'Antara News',        url: 'https://www.antaranews.com/rss/metro.xml' },
  lifestyle:   { nama: 'Lifestyle',    sumber: 'Antara News',        url: 'https://www.antaranews.com/rss/lifestyle.xml' },
  hiburan:      { nama: 'Hiburan',      sumber: 'Antara News',        url: 'https://www.antaranews.com/rss/hiburan.xml' },
  bola:        { nama: 'Olahraga',     sumber: 'Antara News',        url: 'https://www.antaranews.com/rss/olahraga.xml' },
  olahraga:    { nama: 'Olahraga',     sumber: 'Antara News',        url: 'https://www.antaranews.com/rss/olahraga.xml' },
  cadangan:    { nama: 'Indonesia',    sumber: 'CNN Indonesia',      url: 'https://www.cnnindonesia.com/rss' },
}

export const KATEGORI_BERITA = Object.keys(FEED).filter((k) => FEED[k])

/** Buang tag HTML dari judul/ringkasan RSS. */
export function bersihkanTeks(s) {
  return String(s || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Ambil dan parse RSS/Atom.
 * Tanpa dependensi XML eksternal.
 * @returns {Array<{judul, ringkasan, link, tanggal}>}
 */
export function parseRSS(xml) {
  const hasil = []
  const blok = String(xml || '').match(/<(item|entry)\b[\s\S]*?<\/\1>/gi) || []

  for (const b of blok) {
    const ambil = (tag) => {
      const m = b.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))
      return m ? bersihkanTeks(m[1]) : ''
    }
    const judul = ambil('title')
    if (!judul) continue

    let link = ambil('link')
    if (!link) {
      const m = b.match(/<link[^>]*href=["']([^"']+)["']/i)
      link = m ? m[1] : ''
    }

    const tanggal = ambil('pubDate') || ambil('published') || ambil('updated')

    hasil.push({
      judul,
      ringkasan: ambil('description') || ambil('summary') || ambil('content'),
      link,
      tanggal,
    })
  }
  return hasil
}

/**
 * Ambil berita terbaru dari sebuah feed.
 * @param {string} kategori kunci dari FEED
 * @param {number} jumlah
 */
export async function berita(kategori = 'indonesia', jumlah = 8) {
  const f = FEED[kategori] || FEED.indonesia
  const hasil = await ambilCache(`berita:${kategori}`, 900, async () =>
    parseRSS(await ambilTeks(f.url))
  )
  return hasil.slice(0, jumlah)
}

/** Cari judul berita di semua kategori. */
export async function cariBerita(kunci, jumlah = 5) {
  const kata = String(kunci || '').toLowerCase().trim()
  if (!kata) return []
  const semua = await berita('indonesia', 20)
  return semua
    .filter((b) => b.judul.toLowerCase().includes(kata))
    .slice(0, jumlah)
}

export default {
  ambilCache,
  bersihkanCache,
  ambilJSON,
  ambilTeks,
  gempaTerbaru,
  gempaTerkini,
  gempaDirasakan,
  ambilShakemap,
  cuacaADM4,
  berita,
  cariBerita,
  parseRSS,
  bersihkanTeks,
  FEED,
  KATEGORI_BERITA,
}
