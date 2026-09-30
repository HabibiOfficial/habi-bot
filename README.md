<div align="center">

# ✨ HABI AI ✨

**Simple Bot by Habibih, hasil gabutan 😁**

<br/>

[Node](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
[Baileys](https://img.shields.io/badge/Baileys-WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)
[Plugins](https://img.shields.io/badge/Plugins-Auto-7c3aed?style=for-the-badge)
[No Ribet](https://img.shields.io/badge/Type-No_Ribet_Club-0ea5e9?style=for-the-badge)

Bot WA Gua Bikin Dari Nol. Kecuali Fiturnya
Sebagian Fitur Gua Dapet Dari Sc Lain 😁
Project Ini Hasil Gabutan Gua Doang 🗿

</div>

-----------------------------------------

<div align="center">

### 👋 APAAN SIH HABI AI?

</div>

> Habibih Ai ini Bot Multi Fungsi.
> Sistemnya Simple, Rapi, Enak Di Oprek.
> Buat Pemula Masuk, Buat Sepuh Juga Masuk.

Habibih Ai gue bangun pakai Baileys,
sistem plugin auto kebaca sendiri.
Lu tinggal taruh file di folder,
gak perlu otak-atik inti bot lagi.

-----------------------------------------

<div align="center">

### 🔥 FITUR GACOR

</div>

| IKON | FITUR & DESKRIPSI |
| :--- | :--- | :--- |
| 📦 | **AUTO PLUGIN** - Taruh `.js` di `plugins/`, auto aktif 
| 📁 | **AUTO KATEGORI** - Nama folder jadi kategori menu 
| 🗄️ | **SQLITE** - Data user & prefix tersimpan rapi, gak pake JSON lagi 
| ⚡ | **HOT RELOAD** - Edit file, langsung jalan lagi 
| 🔑 | **PAIRING CODE** - Login pakai kode, no QR ribet 
| 🔤 | **CUSTOM PREFIX** - Beda chat beda prefix, bisa 
| ⚙️ | **ONE CONFIG** - Semua di `config/settings.js` 
| 🚀 | **ANTI DELAY** - Ada antrian biar gak numpuk 
| 🖼️ | **IMAGE HEADER** - Support gambar di menu 

-----------------------------------------

<div align="center">

### 📦 CARA PASANG

</div>

**Yang Dibutuhin :**
- Node.js v18+ 
- npm / yarn

**Langkah Gas :**

```bash
# 1. Masuk ke folder
cd qiro-ai

# 2. Install bahan
npm install

# 3. Salin env buat panel
cp .env.example .env

# 4. Edit settings.js
nano config/settings.js

# 5. Jalankan bot
npm start
```

-----------------------------------------

<div align="center">

### 🔗 CARA KONEK WA

</div>

> Pas awal jalan, bot minta pairing code.

**Di Laptop / Termux :**
> Ketik nomor WA di terminal langsung.

**Di Panel Hosting :**
> Isi `PAIRING_NUMBER` di `.env`
> atau `pairingNumber` di `settings.js`.

Buka WA lu :

```
WA > Perangkat Tertaut > Tautkan
> Tautkan Dengan Nomor Telepon
```

Masukin kode dari console, langsung konek.

-----------------------------------------

<div align="center">

### 📂 STRUKTUR DALEMAN SEMPAK 😂🗿

</div>

```
qiro-ai/
├── index.js           → entry point bot
├── config/            → ⭐ LU EDIT DISINI
│   └── settings.js    → nama bot & owner
├── core/                → mesin utama
│   ├── connection.js   → koneksi WA
│   ├── router-pesan.js → baca & arahin pesan
│   ├── pemuat-plugin.js → loader auto
│   ├── antrian-pesan.js. → anti delay
│   ├── prefix.js         → prefix per chat (SQLite)
│   ├── database-user.js  → data user (SQLite)
│   ├── sqlite.js          → koneksi & migrasi database
│   └── identitas.js.    → watermark otomatis
├── lib/                 → helper
│   ├── rpg           → sistem rpg di sini
│   ├── menu.js        → builder menu
│   ├── tombol.js      → tombol interaktif
│   └── cek-akses.js   → cek owner
├── plugins/            → ⭐ TARUH FITUR
│   ├── main/          → menu, ping
│   ├── owner/         → owner only
│   └── group/         → group only dll
├── sessions/          → JANGAN DI SHARE
├── data/database/     → database SQLite (auto-migrasi dari JSON lama)
└── assets/image/      → gambar header
```

> Taruh gambar di `assets/image/`,
> panggil `image: 'habibih.jpg'`,

> Identitas otomatis dari `settings.js`,
> jadi gak perlu edit satu-satu plugin.

-----------------------------------------

<div align="center">

### 🧩 TAMBAH FITUR BARU

</div>

**1.** Bikin folder di `plugins/`  
**2.** Bikin file `.js` baru  
**3.** Tempel template ini :

```js
const handler = async (m, { conn }) => {
  await conn.sendMessage(m.chat,
    { text: 'Halo Habibih!' },
    { quoted: m.raw }
  )
}

handler.command = /^halo$/i
handler.help = ['halo']
handler.description = 'Sapa simple'
handler.ownerOnly = false
handler.groupOnly = false

export default handler
```

**4.** Simpan, langsung aktif.

> Kategori auto dari nama folder,
> jangan set `handler.category` manual.
> Untuk credit & lisensi cek `CREDITS.md`.

-----------------------------------------

<div align="center">

### ❓ FAQ

</div>

**Q: Bot delay?**
> Cek RAM & antrian di `core/antrian-pesan.js`.

**Q: Plugin gak kebaca?**
> Pastikan `export default handler` & regex bener.

**Q: Gambar gak muncul?**
> Pastikan file ada di `assets/image/`.

**Q: `npm install` error soal better-sqlite3?**
> Butuh compiler native (`build-essential` di Linux,
> Xcode Command Line Tools di Mac). Biasanya udah
> ada, kalo belum tinggal install itu duluan.

**Q: Data user/prefix lama ilang gak abis update?**
> Enggak. Sekali jalan, `users.json` & `prefix.json`
> lama otomatis kepindah ke SQLite, filenya jadi
> `.migrated` (bukan kehapus, aman buat cadangan).

------------------------------------------

<div align="center">

### 💜 MAKASIH UDAH PAKE HABI AI 💜

**LU HARGAI GUE, GUE HARGAI LU.**

© 2026 HABI AI — HABI AI

<br/>

[[Website](https://img.shields.io/badge/Website-habibi-store.pages.dev-0ea5e9?style=flat-square&logo=googlechrome)](https://habibi-store.pages.dev)
[[WA](https://img.shields.io/badge/WhatsApp-Chat-25D366?style=flat-square&logo=whatsapp)](https://wa.me/6285181576338)

</div>

---

## 🌐 Integrasi REST API Habibih Cloud ID

Bot ini sudah terhubung ke REST API HABI. Kalau API-nya hidup, bot dapat
fitur image maker & downloader **tanpa perlu nulis logika render sendiri**.

### Cara pakai

| Perintah | Hasil |
|---|---|
| `%iqc Halo dunia` | Screenshot chat iPhone lengkap dengan context menu |
| `%quote Halo` | Sama seperti `%iqc` |
| `%reply Jalan crur` | Fake balasan chat WhatsApp |
| `%welcome Budi` | Kartu sambutan member grup |
| `%meme Teks atas` | Meme |
| `%brat HAI` | Gambar brat |
| `.apiget <link>` | Ambil video TikTok / FB / IG / X lalu kirim ke chat |
| `.apistatus` | Cek koneksi ke API |

Prefix `.` ikut aturan bot — kalau prefix lu berbeda, sesuaikan.

### Konfigurasi

Semua opsional. Kalau `HABI_API_KEY` dikosongkan, bot otomatis ambil key
gratis lewat `/api/register` dan menyimpannya di memory.

```bash
# .env
HABI_API_URL=https://api.habibicloudserver.dpdns.org
HABI_API_KEY=
HABI_API_TIMEOUT_MS=60000
```

### Keamanan

Semua API key untuk downloader (TikTok, Facebook, YouTube MP3) **wajib
diisi lewat `.env`** — tidak ada lagi key yang ditulis langsung di dalam
kode. Kalau key kosong, plugin itu otomatis pakai jalur fallback lain.
