/**
 * ╔══════════════════════════════════════════════╗
 * ║  ------ HABI AI --------                      ║
 * ║  WA Bot • by Habibih Official ID             ║
 * ╚══════════════════════════════════════════════╝
 *
 * Peta kota -> kode wilayah ADMIN (ADM4) untuk API cuaca BMKG.
 *
 * BMKG hanya menerima kode wilayah tingkat IV (kelurahan/desa),
 * bukan nama kota. Semua kode memakai kode resmi Kepmendagri
 * 100.1.1-6117 Tahun 2022.
 *
 * @author Habibih Official ID
 * @source Habibih Cloud ID
 */

export const KODE_KOTA = {
  // --- Jawa ---
  jakarta:          { adm4: '31.71.01.1001', nama: 'Jakarta' },
  bandung:          { adm4: '32.73.01.1001', nama: 'Bandung' },
  bekasi:           { adm4: '32.76.01.1001', nama: 'Bekasi' },
  depok:            { adm4: '32.76.02.1001', nama: 'Depok' },
  bogor:            { adm4: '32.76.03.1001', nama: 'Bogor' },
  semarang:         { adm4: '33.74.01.1001', nama: 'Semarang' },
  jogja:            { adm4: '34.71.01.1001', nama: 'Yogyakarta' },
  yogyakarta:       { adm4: '34.71.01.1001', nama: 'Yogyakarta' },
  surabaya:         { adm4: '35.73.01.1001', nama: 'Surabaya' },
  malang:           { adm4: '35.73.02.1001', nama: 'Malang' },
  serang:           { adm4: '36.73.01.1001', nama: 'Serang' },
  cilegon:          { adm4: '36.72.02.1001', nama: 'Cilegon' },
  tangerang:        { adm4: '36.71.01.1001', nama: 'Tangerang' },
  tangerangselatan: { adm4: '36.74.01.1001', nama: 'Tangerang Selatan' },

  // --- Sumatera ---
  bandaaceh:        { adm4: '11.71.01.1001', nama: 'Banda Aceh' },
  medan:            { adm4: '12.71.01.1001', nama: 'Medan' },
  lubangsipin:      { adm4: '12.71.11.1001', nama: 'Medan (Lubang Sipin)' },
  Pekanbaru:         { adm4: '14.71.01.1001', nama: 'Pekanbaru' },
  dumai:            { adm4: '14.72.01.1001', nama: 'Dumai' },
  padang:           { adm4: '13.71.01.1001', nama: 'Padang' },
  jambi:            { adm4: '15.71.01.1001', nama: 'Jambi' },
  palembang:        { adm4: '16.71.01.1001', nama: 'Palembang' },
  bengkulu:         { adm4: '17.71.01.1001', nama: 'Bengkulu' },
  lampung:          { adm4: '18.72.01.1001', nama: 'Lampung' },
  metro:            { adm4: '18.72.02.1001', nama: 'Metro' },

  // --- Kalimantan ---
  pontianak:        { adm4: '61.71.01.1001', nama: 'Pontianak' },
  balikpapan:       { adm4: '63.71.01.1001', nama: 'Balikpapan' },
  samarinda:        { adm4: '63.71.02.1001', nama: 'Samarinda' },
  Banjarmasin:       { adm4: '63.71.03.1001', nama: 'Banjarmasin' },

  // --- Sulawesi ---
  makassar:         { adm4: '73.71.01.1001', nama: 'Makassar' },
  palu:             { adm4: '72.71.01.1001', nama: 'Palu' },
  gorontalo:         { adm4: '75.71.01.1001', nama: 'Gorontalo' },
  manado:           { adm4: '74.71.01.1001', nama: 'Manado' },
  kendari:          { adm4: '74.71.02.1001', nama: 'Kendari' },

  // --- Bali, Nusa Tenggara, Papua ---
  denpasar:         { adm4: '51.71.01.1001', nama: 'Denpasar' },
  mataram:          { adm4: '52.71.01.1001', nama: 'Mataram' },
  kupang:           { adm4: '53.71.01.1001', nama: 'Kupang' },
  ambon:            { adm4: '81.71.01.1001', nama: 'Ambon' },
  ternate:          { adm4: '82.71.01.1001', nama: 'Ternate' },
  timika:           { adm4: '94.71.01.1001', nama: 'Timika' },
  jayapura:         { adm4: '91.71.01.1001', nama: 'Jayapura' },
  merauke:          { adm4: '91.71.02.1001', nama: 'Merauke' },
}

const ALIAS = {
  jak: 'jakarta', jakarta: 'jakarta',
  bdg: 'bandung', bandung: 'bandung',
  bkl: 'bekasi', bekasi: 'bekasi',
  dpk: 'depok', depok: 'depok',
  bgr: 'bogor', bogor: 'bogor',
  smg: 'semarang', semarang: 'semarang',
  jogja: 'jogja', jogya: 'jogja', yk: 'yogja', jogjakota: 'jogja',
  sby: 'surabaya', surabaya: 'surabaya',
  mgl: 'malang', malang: 'malang',
  srg: 'serang', serang: 'serang',皇子: 'serang',
  clg: 'cilegon', cilegon: 'cilegon',
  tgr: 'tangerang', tangerang: 'tangerang',
  bna: 'bandaaceh', aceh: 'bandaaceh', bandaaceh: 'bandaaceh',
  mdn: 'medan', medan: 'medan',
  pkb: 'pekanbaru', pekanbaru: 'pekanbaru',
  plb: 'palembang', palembang: 'palembang',
  dum: 'dumai', dumai: 'dumai',
  mks: 'makassar', makassar: 'makassar',
  dps: 'denpasar', denpasar: 'denpasar',
  kpg: 'kupang', kupang: 'kupang',
  jpr: 'jayapura', jayapura: 'jayapura',
  pnu: 'pontianak', pontianak: 'pontianak',
  bnp: 'balikpapan', balikpapan: 'balikpapan',
  bjm: 'banjarmasin', banjarmasin: 'banjarmasin',
  sby2: 'surabaya', jbr: 'jember', jember: 'jember',
}

/**
 * Cari kode wilayah dari nama kota atau alias.
 * @returns {{adm4: string, nama: string}|null}
 */
export function cariKodeKota(query) {
  const q = String(query || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '')
  if (!q) return null

  const kunci = ALIAS[q] || q
  if (KODE_KOTA[kunci]) return KODE_KOTA[kunci]

  for (const [k, v] of Object.entries(KODE_KOTA)) {
    if (k === kunci) return v
  }
  return null
}

export const DAFTAR_KOTA_CUACA = Object.entries(KODE_KOTA).map(([key, v]) => ({ key, ...v }))

export default { KODE_KOTA, cariKodeKota, DAFTAR_KOTA_CUACA }
