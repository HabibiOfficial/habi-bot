/**
 * ╔══════════════════════════════════════════════╗
 * ║  ------ HABI AI --------                      ║
 * ║  WA Bot • by Habibih Official ID             ║
 * ╚══════════════════════════════════════════════╝
 *
 * Perhitungan jadwalqjgwalsholat — implementasi sendiri
 * berbasis algoritma astral standar (posisi matahari).
 *
 * Tidak memanggil API pihak ketiga: seluruh perhitungan
 * dilakukan lokal dari koordinat dan tanggal.
 *
 * @author Habibih Official ID
 * @source Habibih Cloud ID
 */

const DEG = Math.PI / 180
const sin = (d) => Math.sin(d * DEG)
const cos = (d) => Math.cos(d * DEG)
const tan = (d) => Math.tan(d * DEG)
const asin = (x) => Math.asin(x) / DEG
const acos = (x) => Math.acos(x) / DEG
const acot = (x) => Math.atan(1 / x) / DEG
const atan2 = (y, x) => Math.atan2(y, x) / DEG

/**
 * Hari Julian dari tanggal.
 */
function julianDate(tanggal) {
  const y = tanggal.getFullYear()
  const m = tanggal.getMonth() + 1
  const d = tanggal.getDate()
  if (m <= 2) {
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d - 1524.5
  }
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m - 1)) + d - 1524.5
}

/** Hari ke-1..7: 0=Ahad, 1=Senin, ... 6=Jumat */
function hariKe(jd) {
  return Math.floor(jd + 0.5 + 0.5) % 7
}

/**
 * Posisi matahari.
 * @returns {{declination:number, equation:number}} deklinasi & persamaan waktu (derajat)
 */
function posisiMatahari(jd) {
  const D = jd - 2451545.0
  const g = 357.529 + 0.98560028 * D
  const q = 280.459 + 0.98564736 * D
  const L = (q + 1.915 * sin(g) + 0.020 * sin(2 * g)) % 360
  const e = 23.439 - 0.00000036 * D

  const RA = atan2(cos(e) * sin(L), cos(L)) / 15
  const declination = asin(sin(e) * sin(L))
  const equation = q / 15 - RA

  // rapikan ke rentang -15..15 derajat
  let eq = equation
  while (eq > 15) eq -= 24
  while (eq < -15) eq += 24

  return { declination, equation: eq }
}

/** sudut matahari di bawah/atas horizon */
function sudutMatahari(jd, lokasi, elevation, dir) {
  const { latitude, longitude } = lokasi
  const { declination, equation } = posisiMatahari(jd)

  // waktu sudut = (jam - 12) * 15
  const t = (dir === 'ccw' ? -1 : 1) * 1
  const noon = 12 - equation / 15
  const waktu = noon + t * (1 / 15) * acos(
    (-sin(0.833) - sin(declination) * sin(latitude)) /
    (cos(declination) * cos(latitude))
  )
  return waktu
}

/** konversi jam desimal → "HH:MM" */
function formatJam(jam) {
  if (!Number.isFinite(jam)) return '--:--'
  let total = Math.round(jam * 60)
  const h = Math.floor(total / 60) % 24
  const m = total % 60
  return `${String(h).padStart(2, '0')}.${String(m).padStart(2, '0')}`
}

/**
 * Hitung jadwalqjgwalsholat.
 *
 * @param {object} opts
 * @param {number} opts.latitude
 * @param {number} opts.longitude
 * @param {Date}   [opts.tanggal]
 * @param {string} [opts.metode] 'turban' | 'kemenag'
 * @param {number} [opts.ihtiyati] ihtiyati / ihtiyatiParent
 * @returns {object} jadwal
 */
export function hitungJadwal({
  latitude,
  longitude,
  tanggal = new Date(),
  metode = 'kemenag',
  ihtiyati = 0,
  zonaWaktu = 7,   // WIB 7 · WITA 8 · WIT 9
} = {}) {
  const jd = julianDate(tanggal)
  const { declination, equation } = posisiMatahari(jd)

  // Sudut matahari di bawah horizon.
  // 0.833° = refraksi atmosfer + radius matahari (terbit & terbenam).
  // 18°    = sudut Subuh & Isya (standar Kemenag Indonesia).
  const sudut = (derajat) =>
    acos((-sin(derajat) - sin(declination) * sin(latitude)) / (cos(declination) * cos(latitude)))

  // Meridian tengah zona waktu: WIB 105°BT, WITA 120°BT, WIT 135°BT.
  const meridian = zonaWaktu * 15
  // Koreksi longitude: wilayah di timur meridian → matahari lebih dulu terbit.
  const koreksiLon = (meridian - longitude) / 15

  const noon = 12 + koreksiLon - equation / 15
  const d1 = sudut(0.833)
  const dFajar = sudut(18)

  const subuh = noon - dFajar / 15
  const terbit = noon - d1 / 15
  const maghrib = noon + d1 / 15
  const dzuhur = noon

  // Asar: saat bayangan = faktor x tinggi benda.
  const asr = noon + acot(
    1 / (tan(Math.abs(latitude - declination)) + asrShadow(metode))
  ) / 15

  const jadwal = {
    imsak: subuh - 10 / 60,
    subuh,
    terbit,
    dhuha: terbit + 45 / 60,
    dzuhur,
    ashar: asr,
    maghrib,
    isya: noon + dFajar / 15,
  }

  // Ihtiyati maju (jarak ke tengah lokasi dari batas).
  if (ihtiyati) {
    jadwal.imsak -= ihtiyati / 60
    jadwal.subuh -= ihtiyati / 60
    jadwal.dzuhur += ihtiyati / 60
    jadwal.ashar += ihtiyati / 60
    jadwal.maghrib += ihtiyati / 60
    jadwal.isya += ihtiyati / 60
  }

  const hasil = {}
  for (const [k, v] of Object.entries(jadwal)) hasil[k] = formatJam(v)
  return hasil
}

/** Faktor bayangan Asr: 1 = Syafi'i (Indonesia), 2 = Hanafi/Turki */
function asrShadow(metode) {
  if (String(metode).toLowerCase() === 'turban') return 2
  return 1
}

/**
 * Daftar kota besar Indonesia + koordinat.
 * SUMBER: HABI, dipakai lokal tanpa API eksternal.
 */
export const KOTA = {
  // --- Jawa (WIB) ---
  jakarta:      { nama: 'Jakarta',      lat: -6.2088,  lon: 106.8456 },
  bandung:      { nama: 'Bandung',      lat: -6.9175,  lon: 107.6191 },
  surabaya:     { nama: 'Surabaya',     lat: -7.2575,  lon: 112.7521 },
  semarang:     { nama: 'Semarang',     lat: -6.9667,  lon: 110.4167 },
  jogja:        { nama: 'Yogyakarta',   lat: -7.7956,  lon: 110.3695 },
  yogyakarta:   { nama: 'Yogyakarta',   lat: -7.7956,  lon: 110.3695 },
  malang:       { nama: 'Malang',       lat: -7.9666,  lon: 112.6326 },
  jabal:        { nama: 'Jawa Barat',   lat: -6.9175,  lon: 107.6191 },
  serang:       { nama: 'Serang',       lat: -6.1200,  lon: 106.1503 },
  cilegon:      { nama: 'Cilegon',      lat: -5.9600,  lon: 106.0100 },
  tangerang:    { nama: 'Tangerang',    lat: -6.1783,  lon: 106.6319 },
  bekasi:       { nama: 'Bekasi',       lat: -6.2383,  lon: 106.9756 },
  depok:        { nama: 'Depok',        lat: -6.4025,  lon: 106.7942 },
  bogor:        { nama: 'Bogor',        lat: -6.5950,  lon: 106.8166 },
 aucheh:       { nama: 'Banda Aceh',   lat: 5.5483,   lon: 95.3238 },
  bandaaceh:    { nama: 'Banda Aceh',   lat: 5.5483,   lon: 95.3238 },
  banda:        { nama: 'Banda Aceh',   lat: 5.5483,   lon: 95.3238 },
  medan:        { nama: 'Medan',        lat: 3.5952,   lon: 98.6722 },
  lubangsinga:  { nama: 'Lubang Sipin', lat: -0.9500,  lon: 100.3900 },
  Pekanbaru:     { nama: 'Pekanbaru',    lat: 0.5071,   lon: 101.4478 },
  duma:         { nama: 'Dumai',        lat: 1.6800,   lon: 101.4500 },
  padang:       { nama: 'Padang',       lat: -0.9471,  lon: 100.4172 },
  padangsidimpuan: { nama: 'Padang Sidimun', lat: 0.6700, lon: 99.5400 },
  jambi:        { nama: 'Jambi',        lat: -1.6101,  lon: 103.6131 },
  palembang:    { nama: 'Palembang',    lat: -2.9761,  lon: 104.7754 },
  bengkulu:     { nama: 'Bengkulu',     lat: -3.7928,  lon: 102.2608 },
  lampung:      { nama: 'Bandar Lampung', lat: -5.4292, lon: 105.2610 },
  metro:        { nama: 'Metro',        lat: -5.1100,  lon: 105.2600 },

  // --- Kalimantan (WIB) ---
  pontianak:    { nama: 'Pontianak',    lat: -0.0263,  lon: 109.3425 },
  Balikpapan:   { nama: 'Balikpapan',   lat: -1.2379,  lon: 116.8529 },
  samarinda:    { nama: 'Samarinda',    lat: -0.5022,  lon: 117.1536 },
  banjarmasin:   { nama: 'Banjarmasin',   lat: -3.3194,  lon: 114.5908 },
  martapura:     { nama: 'Martapura',    lat: -3.4040,  lon: 114.8500 },

  // --- Sulawesi (WITA) ---
  makassar:     { nama: 'Makassar',     lat: -5.1477,  lon: 119.4327 },
  parepare:     { nama: 'Parepare',     lat: -4.0096,  lon: 119.6236 },
  palu:         { nama: 'Palu',         lat: -0.8917,  lon: 119.8707 },
  manado:       { nama: 'Manado',       lat: 1.4748,   lon: 124.8421 },
  gorontalo:     { nama: 'Gorontalo',    lat: 0.5435,   lon: 123.0568 },
  kendari:      { nama: 'Kendari',      lat: -3.9985,  lon: 122.5127 },

  // --- Nusa Tenggara + Papua (WITA/WIT) ---
  kupang:       { nama: 'Kupang',       lat: -10.1772, lon: 123.6070 },
  denpasar:     { nama: 'Denpasar',     lat: -8.6705,  lon: 115.2126 },
  mataram:      { nama: 'Mataram',      lat: -8.5833,  lon: 116.1167 },
  ambon:        { nama: 'Ambon',        lat: -3.6954,  lon: 128.1814 },
  ternate:      { nama: 'Ternate',      lat: 0.7900,   lon: 127.3800 },
  jayapura:     { nama: 'Jayapura',     lat: -2.5337,  lon: 140.7181 },
  merauke:      { nama: 'Merauke',      lat: -8.4667,  lon: 140.5167 },
  timika:       { nama: 'Timika',       lat: -4.0967,  lon: 136.5500 },
  sorong:       { nama: 'Sorong',       lat: -0.8762,  lon: 131.2558 },
  manokwari:    { nama: 'Manokwari',    lat: -0.8615,  lon: 134.0620 },

  // ---alkeeper lama agar tidak breaking ---
  batam:        { nama: 'Batam',        lat: 1.0456,   lon: 104.0305 },
}

/** Cari kota by nama (case-insensitive, substring). */

/**
 * Zona waktu berdasarkan bujur (menyerupai batas waktu resmi Indonesia).
 * Batas: WIB < 115E, WITA 115E-120E, WIT > 120E.
 * Menghindari tebakan dari nama kota.
 */
export function zonaDariLongitude(lon) {
  if (lon >= 120) return { jam: 9, nama: 'WIT' }
  if (lon >= 115) return { jam: 8, nama: 'WITA' }
  return { jam: 7, nama: 'WIB' }
}

/** Zona waktu + nama untuk sebuah kota terdaftar. */
export function zonaKota(kota) {
  return zonaDariLongitude(kota.lon)
}

export function cariKota(query) {
  const q = String(query || '').toLowerCase().trim()
  if (!q) return null
  if (KOTA[q]) return KOTA[q]
  for (const [key, v] of Object.entries(KOTA)) {
    if (v && key.includes(q)) return v
  }
  for (const v of Object.values(KOTA)) {
    if (v && v.nama.toLowerCase().includes(q)) return v
  }
  return null
}

/** Waktu menuju terdekat dari sebuah waktu jadual. */
export function waktuTerdekat(jadwal, sekarang = new Date()) {
  const now = sekarang.getHours() * 60 + sekarang.getMinutes()
  const urut = ['imsak', 'subuh', 'terbit', 'dzuhur', 'ashar', 'maghrib', 'isya']
  let sebelum = null
  let sesudah = null
  for (const k of urut) {
    const v = jadwal[k]
    if (!v || v === '--:--') continue
    const [h, m] = v.split('.').map(Number)
    const menit = h * 60 + m
    if (menit <= now) sebelum = { nama: k, menit }
    else if (!sesudah) sesudah = { nama: k, menit }
  }
  return { sebelum, sesudah }
}

export const NAMA_WAKTU = {
  imsak: 'Imsak', subuh: 'Subuh', terbit: 'Terbit (Syuruq)', dhuha: 'Dhuha',
  dzuhur: 'Dzuhur', ashar: 'Ashar', maghrib: 'Maghrib', isya: 'Isya',
}

export default {
  hitungJadwal,
  cariKota,
  waktuTerdekat,
  zonaDariLongitude,
  zonaKota,
  KOTA,
  NAMA_WAKTU,
}
