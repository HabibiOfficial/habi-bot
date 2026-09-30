# Deploy ke Pterodactyl

Panduan menjalankan bot WhatsApp HABI di Pterodactyl.

## 1. Buat server

| Pengaturan | Nilai |
|---|---|
| Egg | **NodeJS** (atau **Linux** kalau mau kontrol penuh) |
| Versi Node | **20.x atau lebih baru** (butuh `--env-file`) |
| Startup | lihat bagian 3 |

> Node 20 ke atas wajib. Versi lama tidak punya `--env-file` sehingga `.env`
> tidak terbaca dan pairing gagal dengan pesan
> "Nomor pairing tidak ditemukan".

## 2. Environment variable

Isi di dashboard Pterodactyl (**Startup → Environment Variables**) atau di file `.env`:

```
PAIRING_NUMBER=6285181577625
HABI_API_URL=https://api.habibicloudserver.dpdns.org
HABI_API_KEY=APIKEY_KAMU
HABI_API_TIMEOUT_MS=90000
```

`HABI_API_KEY` wajib diisi. Kalau kosong, **semua 28 plugin API akan gagal**
dengan pesan `APIkey tidak valid. Daftar dulu: /api/register`.

Cara dapat key: buka `https://api.habibicloudserver.dpdns.org/api/register`,
balas JSON berisi `apikey`. Simpan di `.env`, **jangan** di-commit.

## 3. Startup command

Untuk egg NodeJS:

```bash
node --env-file=.env index.js
```

Kalau Pterodactyl otomatis melakukan `npm install` saat start, tidak perlu
menambahkannya. Kalau tidak, buat startup:

```bash
npm install --no-audit --no-fund && node --env-file=.env index.js
```

## 4. yt-dlp

Plugin downloader butuh `yt-dlp`. Di Pterodactyl biasanya tidak ada bawaan.
Jalankan sekali lewat SSH/console:

```bash
mkdir -p bin
curl -L -o bin/yt-dlp https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux
chmod +x bin/yt-dlp
bin/yt-dlp --version
```

Kalau `libwebp` atau `ffmpeg` dibutuhkan yt-dlp untuk merge audio+video,
pasang juga lewat apt (butuh akses root panel):

```bash
apt-get update && apt-get install -y ffmpeg
```

## 5. Sesi (pairing)

Sesi disimpan di `sessions/`. Kalau `sessions/auth.db` sudah ada, bot
otomatis nyambung tanpa pairing lagi. Kalau kosong:

1. Start server, cek log console
2. Kode pairing muncul dalam ~10 detik
3. Masukkan lewat **Settings → Linked devices → Link a device →
   Link with phone number**
4. Kode cuma hidup ~60 detik, tapi bot **otomatis meminta kode baru tiap
   45 detik** — tunggu saja sampai muncul yang baru

Kalau pairing gagal, hapus `sessions/` lalu start ulang untuk dapat sesi baru.

## 6. Backup sesi

`isikan backup` — kalau `sessions/auth.db` hilang, seluruh server harus
pairing ulang:

```bash
cp -r sessions/ backup-sesi-$(date +%F)
```

## Troubleshooting

| Gejala | Penyebab & solusi |
|---|---|
| `Nomor pairing tidak ditemukan` | `.env` tidak terbaca. Pastikan pakai `node --env-file=.env index.js` dan Node ≥ 20 |
| `APIkey tidak valid` | `HABI_API_KEY` kosong di `.env` |
| `Koneksi terputus (kode 440)` | Ada instance bot lain memakai sesi yang sama (mis. bot lokal). Matikan yang lain — dua bot satu nomor akan saling menendang |
| `Koneksi terputus (kode 515)` | Normal saat pairing. Bot otomatis meminta kode baru, tidak perlu panik |
| `.bratvid` gagal | `ffmpeg` belum ada di server. Pasang `ffmpeg`, atau pakai `.brat` (butuh `sharp` saja) |
| Semua plugin API gagal | Cek `HABI_API_KEY`, lalu `.apistatus` untuk memastikan |

Kode `440` adalah penyebab paling umum bot "tiba-tiba diam": dua instance
menggunakan satu sesi WhatsApp, saling menendang tiap beberapa detik.
