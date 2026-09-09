# KuliahPlanner

Aplikasi all-in-one untuk mahasiswa dalam mengelola jadwal kuliah satu semester penuh, tugas, deadline, presensi kelas, dan pengingat notifikasi Android.

[![Release v1.0.0](https://img.shields.io/badge/Release-v1.0.0-6366f1?style=for-the-badge&logo=android&logoColor=white)](https://github.com/tederby/KuliahPlanner/releases)
[![Demo Online](https://img.shields.io/badge/Web%20App-Live%20Demo-10b981?style=for-the-badge&logo=vercel&logoColor=white)](https://kuliah-planner.vercel.app/)

---

## 📱 Download APK Android (Rilis Resmi v1.0.0)

File installer Android (`.apk`) versi resmi **v1.0.0** dapat diunduh langsung melalui:
- **[Halaman GitHub Releases (Unduh .apk)](https://github.com/tederby/KuliahPlanner/releases)**
- File: `KuliahPlanner-v1.0.0.apk`

### Cara Install di HP Android:
1. Unduh file `KuliahPlanner-v1.0.0.apk` di smartphone kamu.
2. Buka file yang telah diunduh. Jika muncul peringatan *"Install unknown apps"* / *"Sumber tidak dikenal"*, izinkan browser atau file manager untuk menginstal.
3. Buka aplikasi **KuliahPlanner** dan aktifkan izin notifikasi saat diminta agar pengingat kelas dan tugas dapat berdering tepat waktu secara offline.

---

## Features

- **Multiple Calendar Views**: Month, Week, Day, dan Agenda view
- **Smart Meeting Generation**: Otomatis generate semua jadwal untuk satu semester
- **Task & Event Management**: Manage tugas kuliah serta kegiatan/acara non-akademik (seminar, workshop, rapat) dengan deadline/waktu acara
- **Tagging Tugas Individu & Kelompok**: Opsi penandaan tugas individu atau kelompok (nama/nomor kelompok dan daftar anggota opsional)
- **Acara / Kegiatan**: Pencatatan acara dengan opsi waktu mulai-selesai dan lokasi tanpa harus terikat ke mata kuliah
- **Highlight "Hari Ini" di Kalender**: Penandaan visual yang kontras untuk hari ini di Month view dan Week view
- **Task & Event Editing**: Edit tugas maupun acara langsung dari form re-populate otomatis
- **Course Editing**: Edit data matkul induk (nama, hari, jam, SKS, ruangan, warna) tanpa kehilangan relasi tugas atau stash
- **Course Color Coding**: Penandaan warna unik per matkul (smart auto-assign + swatch custom) di seluruh kalender dan tugas
- **Multi-Filter Tugas & Acara**: Filter instan berdasarkan status (Aktif, Semua, Selesai), tipe (Tugas, Acara), serta dropdown filter per-matkul
- **Live End Time & Clash Warning**: Estimasi jam selesai otomatis di form matkul & peringatan visual jika ada jadwal bentrok
- **Total SKS Summary**: Ringkasan beban SKS semester yang diambil di Sidebar dan header Data Matkul
- **Task Descriptions**: Deskripsi tugas dengan dukungan format **Markdown** (bold, italic, code, list, heading)
- **Task Detail Modal**: Klik tugas di kalender untuk lihat detail lengkap + countdown deadline real-time + shortcut edit tugas
- **Deadline Countdown**: Badge countdown otomatis (jam/hari tersisa, overdue, dsb.)
- **Local Storage**: Data tersimpan otomatis di browser, tidak hilang saat refresh
- **Local Undo System**: Ring buffer snapshot lokal (hingga 10 riwayat) dengan tombol "Urungkan" interaktif pada toast saat hapus matkul/tugas dan menu riwayat snapshot
- **Supabase Cloud Sync**: Sinkronisasi data multi-device (laptop & HP) ke cloud Supabase dengan autentikasi Username & Password (tanpa perlu verifikasi email), dilengkapi deteksi & penyelesaian konflik
- **Course Management**: Kelola data matkul (nama, SKS, jadwal, lokasi)
- **Stash System**: "Ghosting" dosen? Stash kelas, restore, atau reschedule ketika jadwal berubah
- **Calendar Drill-Down**: Klik area kosong di Month view untuk masuk Week view; klik kolom hari di Week view untuk masuk Day view
- **Breadcrumb Navigation**: History navigasi kalender dengan breadcrumb clickable
- **Quick-Add Task**: Tombol `+` di setiap kolom hari di Week/Day view untuk tambah tugas cepat
- **Task Banners di Kalender**: Tugas dengan deadline muncul sebagai banner di atas grid Week/Day view
- **Onboarding Guide**: Panduan interaktif step-by-step untuk user pertama kali
- **Confirm Dialog**: Konfirmasi sebelum hapus course atau tugas
- **Toast Notifications**: Pop-up notifikasi aksi di kanan bawah
- **Backup & Restore**: Export/import data JSON langsung dari UI
- **Form Validation**: Input validation untuk mencegah data error
- **Light & Dark Theme**: Deteksi otomatis tema sistem OS (`Auto`), opsi paksa mode Terang atau Gelap, serta proteksi anti-FOUC
- **Dynamic Full-Color Palette & Presets**: Mengubah seluruh palet warna aplikasi secara dinamis (background, card, border, text, dan tombol) menyesuaikan warna pilihan (Oranye, Hijau, Merah, Indigo, Cyan, Violet, Monochrome) atau warna custom bebas via Color Picker (HEX)
- **Mobile Responsive & Adaptive Shell**: Tata letak otomatis beradaptasi antara desktop (Sidebar samping) dan smartphone/Android (Mobile Header ringkas + Bottom Navigation Bar ramah jempol)
- **Native Android Experience**: Terintegrasi penuh dengan Capacitor 8, mendukung gesture/hardware Back Button Android (menutup modal/kembali), sinkronisasi tema SystemBars, safe-area insets (notch & gesture bar), serta modal bertipe Bottom Sheet
- **Native Android Support**: Build menjadi aplikasi Android native menggunakan Capacitor.js
- **Offline Local Notifications**: Pengingat kelas H-x menit sebelum mulai (bisa diatur), Daily Briefing jadwal & deadline tiap jam 07:00 pagi, dan pengingat deadline tugas H-3 jam via `@capacitor/local-notifications` (100% offline di Android native)
- **Attendance Tracker & Kalkulator "Jatah Bolos"**: Pencatatan presensi per pertemuan (Hadir, Izin, Alpa) lengkap dengan kalkulator sisa jatah tidak hadir agar tidak terkena sanksi larangan UAS (standar toleransi 25% atau kustom)
- **Quick Glance "Next Class" Card**: Kartu pintar di tab Kalender/Jadwal yang menampilkan kelas yang sedang berlangsung (dengan live timer progress) atau kelas berikutnya hari ini secara real-time


## Quick Start

### Prerequisites
- Node.js 16+ dan npm

### Installation

```bash
cd KuliahPlanner
npm install
npm run dev
```

Aplikasi akan terbuka di `http://localhost:3000/`

## Production Build

```bash
npm run build
npm run preview
```

File yang di-build akan berada di folder `dist/`

## Android Build

Aplikasi ini mendukung build ke mobile (Android) menggunakan Capacitor.js.

### Cara 1: Otomatis via GitHub Actions (Rekomendasi — Tanpa Install Android Studio)
Repositori ini telah dilengkapi dengan workflow CI/CD GitHub Actions di `.github/workflows/build-android.yml`.
1. Setiap kali melakukan push ke branch `main`, atau memicu manual via tab **Actions** > **Build Android APK** > **Run workflow** di GitHub.
2. Tunggu proses build selesai (~2–4 menit).
3. Unduh file `.apk` siap pakai langsung dari bagian **Artifacts** (`KuliahPlanner-Debug-APK`).

> **Catatan Supabase:** Jika ingin sinkronisasi Supabase aktif di APK hasil build GitHub Actions, tambahkan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` ke **Settings > Secrets and variables > Actions** di repositori GitHub kamu.

### Cara 2: Build Lokal (Memerlukan Android Studio / Android SDK)
```bash
npm run build
npx cap sync android
npx cap open android
```
Di Android Studio, pilih menu **Build > Build Bundle(s) / APK(s) > Build APK(s)** untuk menghasilkan file debug `.apk`.

## Project Structure

```
KuliahPlanner/
├── public/
│   ├── privacy.html              # Kebijakan Privasi
│   └── terms.html                # Syarat & Ketentuan Layanan
├── src/
│   ├── App.jsx                   # Main component
│   ├── components/
│   │   ├── AuthModal.jsx         # Modal autentikasi Username & Password Supabase
│   │   ├── BottomNav.jsx         # Bilah navigasi bawah untuk mobile / Android
│   │   ├── ConfirmDialog.jsx     # Reusable confirm dialog
│   │   ├── EventModal.jsx        # Detail & aksi event matkul di kalender
│   │   ├── MatkulView.jsx        # Tab Config & Data (matkul, config, backup, sync, undo)
│   │   ├── MobileHeader.jsx      # Header ringkas atas untuk mobile / Android
│   │   ├── NextClassCard.jsx     # Kartu kelas hari ini & live time tracker
│   │   ├── OnboardingGuide.jsx   # Panduan interaktif untuk user baru
│   │   ├── ScheduleView.jsx      # Kalender (Month/Week/Day/Agenda) + drill-down
│   │   ├── Sidebar.jsx           # Navigasi tab sidebar & indikator cloud sync
│   │   ├── StashView.jsx         # Tab Stash (reschedule kelas)
│   │   ├── SyncConflictModal.jsx # Modal perbandingan & resolusi konflik versi sync
│   │   ├── TaskDetailModal.jsx   # Modal detail tugas + countdown deadline
│   │   ├── TaskView.jsx          # Tab Tugas + form tambah/edit tugas
│   │   ├── ThemeSwitcher.jsx     # Kontrol tema (Light/Dark/Auto) dan custom color picker/preset
│   │   └── ToastContainer.jsx    # Toast notification dengan dukungan action button
│   ├── hooks/
│   │   ├── useCalendarEvents.js  # Derive calendar events dari data
│   │   ├── useKuliahData.js      # State & logic utama (CRUD matkul, tugas, stash, undo)
│   │   ├── useSupabaseSync.js    # State autentikasi & siklus hidup sinkronisasi Supabase
│   │   ├── useTheme.js           # Pengelola tema sistem, mode light/dark, dan kalkulator palet warna dinamis
│   │   └── useToast.js           # Toast state management dengan dukungan tombol aksi
│   ├── utils/
│   │   ├── courseColors.js       # Palet warna matkul, auto-assign, dan deteksi bentrok jadwal
│   │   ├── dateUtils.js          # Helper format tanggal
│   │   ├── markdown.js           # Simple Markdown-to-HTML renderer
│   │   ├── notificationService.js# Pengelola notifikasi offline Android & web fallback
│   │   ├── storage.js            # localStorage read/write/export/import & metadata
│   │   ├── supabase.js           # Supabase client singleton & auth mapping helper
│   │   ├── undoHistory.js        # Ring buffer snapshot undo lokal
│   │   └── validators.js         # Form validation
│   ├── main.jsx                  # React entry point
│   └── index.css                 # Tailwind directives
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Tech Stack

- **React 18.2** - UI Framework
- **Vite 4.3** - Build tool (super fast)
- **Tailwind CSS 3.3** - Styling
- **Lucide React** - Icon library
- **@capacitor/local-notifications** - Native Offline Android Reminders
- **@supabase/supabase-js** - Backend-as-a-Service (Auth & Cloud Database)

## How to Use

### 1. Setup Semester
Buka tab **Config & Data** → Konfigurasi semester:
- Tanggal mulai semester
- Durasi 1 SKS (default 50 menit)
- Target pertemuan (default 14)
- Minggu UTS dan UAS

### 2. Tambah Matkul
Buka tab **Config & Data** → Klik "Tambah Matkul":
- Nama matkul
- Hari & jam mulai
- Lokasi ruangan
- Jumlah SKS

Jadwal akan otomatis di-generate untuk seluruh semester!

### 3. Backup & Restore Data
Buka tab **Config & Data** → cari section **Backup & Restore Data**:
- Export data untuk simpan di JSON file
- Import JSON untuk restore data atau pindah browser
- Aksi akan tampil notifikasi toast di kanan bawah

### 4. Lihat Kalender
Tab **Kalender** dengan beberapa view:
- **Month**: Lihat sebulan penuh. Klik area kosong di tanggal untuk masuk ke Week view.
- **Week**: Lihat minggu dengan timeline. Klik area kosong di kolom hari untuk masuk ke Day view.
- **Day**: Fokus satu hari dengan timeline detail.
- **Agenda**: List semua event upcoming.

Fitur tambahan di kalender:
- Klik matkul untuk membuka modal detail & aksi (stash, tambah tugas).
- Klik event tugas (banner atau chip) untuk melihat **Task Detail Modal** dengan countdown deadline.
- Hover kolom hari di Week/Day view → muncul tombol `+` untuk quick-add tugas di hari itu.
- Breadcrumb navigasi muncul saat drill-down; klik untuk jump ke level sebelumnya.

### 5. Manage Tugas & Acara
Tab **Tugas & Acara** untuk:
- Toggle tipe: **📋 Tugas Kuliah** atau **🎉 Acara / Kegiatan**
- **Tugas**: judul, matkul, deadline, urgency, kategori (Individu vs Kelompok), nomor kelompok, anggota, dan deskripsi Markdown
- **Acara**: judul agenda/kegiatan, tanggal, jam mulai & selesai (opsional), lokasi (opsional), dan catatan detail
- **Edit tugas & acara**: Klik ikon pensil di kartu — form akan ter-isi otomatis, tombol berubah jadi "Perbarui"
- Mark complete/incomplete & hapus (dengan konfirmasi)
- Filter terpadu: Status (Aktif/Semua/Selesai), Tipe (Semua Tipe/Tugas/Acara), dan Filter per Matkul
- Tugas & Acara otomatis terintegrasi ke kalender (tampil sebagai banner, chips, atau slot waktu di timeline)

### 6. Stash Kelas
Kalau dosen ghosting:
- Klik event di kalender
- Klik "Dosen Ghosting? Stash Kelas Ini"
- Kelas akan masuk ke Limbo
- Reschedule kelas dengan tanggal/jam baru dari tab **Stash**
- Restore kapan saja via tab **Config & Data**

### 7. Onboarding Guide
Saat pertama kali membuka aplikasi, panduan interaktif step-by-step akan muncul otomatis.
Bisa juga dibuka kembali kapan saja lewat tombol **?** di sidebar.

## Data Persistence

Semua data otomatis tersimpan di **localStorage** browser:
- Courses
- Tasks
- Config
- Stashes & Reschedules

Data akan bertahan meski:
- Browser ditutup & dibuka kembali
- Halaman di-refresh

**Note**: Data tersimpan per-browser, bukan cloud-synced.

## Improvements Implemented

**From original code:**
- Fixed: No data persistence → Added localStorage
- Fixed: Incomplete task form → Added course selector + urgency
- Fixed: No validation → Added form validation
- Fixed: No error handling → Added error alerts
- Fixed: Not production-ready → Full Vite project setup
- Improved: Mobile responsive
- Added: Task completion toggle

**Recent updates:**
- Added: Task edit mode (inline form re-populate, Perbarui/Simpan)
- Added: Task description field with Markdown support (`markdown.js` renderer)
- Added: `TaskDetailModal` — modal detail tugas + countdown deadline real-time
- Added: `OnboardingGuide` — panduan interaktif multi-step untuk user baru
- Added: Calendar breadcrumb navigation (history drill-down clickable)
- Added: Quick-add task button (`+`) per-hari di Week/Day view
- Added: Task banners di timeline kalender (Week & Day view)
- Added: Klik tugas di Agenda view membuka TaskDetailModal
- Added: `startEditTask` / `cancelEditTask` di `useKuliahData`
- Added: Course edit mode (edit nama, hari, jam, SKS, ruangan, warna tanpa hilang relasi tugas)
- Added: Course color coding (auto-assign warna harmonis + custom picker di kalender & tugas)
- Added: Task filtering (filter status Aktif/Semua/Selesai dan filter per-matkul)
- Added: Live end-time calculation & schedule clash warning di form matkul
- Added: Shortcut edit tugas langsung dari TaskDetailModal di kalender
- Added: Total SKS counter di Sidebar dan header Data Matkul
- Added: Support tipe "Acara / Kegiatan" (seminar, rapat, workshop) tanpa matkul, dengan waktu & lokasi
- Added: Tagging tugas "Kelompok" vs "Individu" (dengan nomor kelompok & daftar anggota kelompok)
- Added: Highlight visual tegas untuk "Hari Ini" di Kalender (Month view & Week view)
- Added: Integrasi visual Acara di Kalender (chips bulan, grid timeline jam mulai/selesai, agenda view)
- Added: Filter tipe kegiatan (Tugas / Acara / Semua) di tab Tugas & Acara

## Known Issues / TODO

- [x] No push notification/reminder -> Added offline Local Notifications via `@capacitor/local-notifications`
- [ ] No multi-semester archive / history
- [ ] Could optimize with TypeScript
- [ ] Could add tests

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (limited localStorage)
- Mobile browsers: ✅ Responsive

## License

Feel free to use, modify, dan share!

---

**Made with ❤️ for mahasiswa yang stress deadline**