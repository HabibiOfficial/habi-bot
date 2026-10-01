# Audio Adzan — HABI AI

Folder ini adalah **cache audio adzan**, bukan penyimpanan permanen.

## Cara kerja

File MP3 **tidak disimpan di dalam repo GitHub** — supaya unduhan ZIP
tetap ramping (± 2 MB). Sebagai gantinya, berkas audio disimpan sebagai
asset di GitHub Release, lalu diunduh bot ke folder ini saat runtime
pada saat pertama kali dibutuhkan.

```
repo (2 MB)  →  bot jalan  →  butuh adzan  →  unduh dari Release  →  cache di sini
```

Kalau tidak ada koneksi, bot tetap jalan normal — hanya bagian audio
yang dilewati, teks adzan tetap dikirim.

## Format nama

- `adzan-nasional.mp3` — fallback utama
- `adzan-{kota}.mp3` — khusus kota, contoh: `adzan-jakarta.mp3`
- `adzan-{waktu}.mp3` — per waktu: `subuh`, `dzuhur`, `ashar`, `maghrib`, `isya`

## Prioritas

1. File lokal di folder ini (dipakai lebih dulu)
2. Unduhan otomatis dari GitHub Release
3. Fallback: kirim teks adzan saja tanpa audio

## Memakai rekaman sendiri

Kalau punya rekaman sendiri, letakkan di folder ini — bot langsung
memakainya dan tidak perlu mengunduh yang bawaan:

```
assets/adzan/adzan-subuh.mp3
assets/adzan/adzan-dzuhur.mp3
...
```

Bisa juga spesifik per kota, misal `adzan-serang.mp3`.

## Command

- `.adzan unduh` — unduh semua audio sekaligus
- `.adzan status` — cek berkas mana yang sudah ada di cache
- `.adzan bersihkan` — hapus cache, supaya diunduh ulang

## Credit berkas bawaan

> Rekaman: Doha Adhan Recordings — Public Domain Mark 1.0 (Internet Archive)
> https://archive.org/details/adhan.recordings.from.doha.qatar

## Hak penggunaan

Hanya masukkan file audio yang Anda miliki haknya atau berlisensi bebas
(public domain / creative commons). Jangan masukkan rekaman dari sumber
yang hak ciptanya dilindungi — misalnya cuplikan siaran TV.
