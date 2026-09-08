# KuliahPlanner 📚

Aplikasi web untuk manage jadwal kuliah, tugas, dan deadline semester dengan UI yang modern dan fitur powerful.

Demo online tersedia di: https://kuliah-planner.vercel.app/

## ✨ Features

- **📅 Multiple Calendar Views**: Month, Week, Day, dan Agenda view
- **🔄 Smart Meeting Generation**: Otomatis generate semua jadwal untuk satu semester
- **✅ Task Management**: Manage tugas dengan deadline, urgency, dan course tracking
- **✏️ Task Editing**: Edit tugas langsung dari tab Tugas — form re-populate otomatis
- **📝 Task Descriptions**: Deskripsi tugas dengan dukungan format **Markdown** (bold, italic, code, list, heading)
- **🔍 Task Detail Modal**: Klik tugas di kalender untuk lihat detail lengkap + countdown deadline real-time
- **⏰ Deadline Countdown**: Badge countdown otomatis (jam/hari tersisa, overdue, dsb.)
- **💾 Local Storage**: Data tersimpan otomatis di browser, tidak hilang saat refresh
- **🏗️ Course Management**: Kelola data matkul (nama, SKS, jadwal, lokasi)
- **📌 Stash System**: "Ghosting" dosen? Stash kelas, restore, atau reschedule ketika jadwal berubah
- **🗺️ Calendar Drill-Down**: Klik area kosong di Month view untuk masuk Week view; klik kolom hari di Week view untuk masuk Day view
- **🧭 Breadcrumb Navigation**: History navigasi kalender dengan breadcrumb clickable
- **⚡ Quick-Add Task**: Tombol `+` di setiap kolom hari di Week/Day view untuk tambah tugas cepat
- **📋 Task Banners di Kalender**: Tugas dengan deadline muncul sebagai banner di atas grid Week/Day view
- **🎓 Onboarding Guide**: Panduan interaktif step-by-step untuk user pertama kali
- **🛑 Confirm Dialog**: Konfirmasi sebelum hapus course atau tugas
- **🔔 Toast Notifications**: Pop-up notifikasi aksi di kanan bawah
- **💾 Backup & Restore**: Export/import data JSON langsung dari UI
- **⚡ Form Validation**: Input validation untuk mencegah data error
- **🌓 Light & Dark Theme**: Deteksi otomatis tema sistem OS (`Auto`), opsi paksa mode Terang atau Gelap, serta proteksi anti-FOUC
- **🎨 Dynamic Full-Color Palette & Presets**: Mengubah seluruh palet warna aplikasi secara dinamis (background, card, border, text, dan tombol) menyesuaikan warna pilihan (Oranye, Hijau, Merah, Indigo, Cyan, Violet, Monochrome) atau warna custom bebas via Color Picker (HEX)
- **✨ Clean & Functional UI**: Desain minimalis presisi tanpa sudut membulat berlebih ("less AI")
- **📱 Native Android Support**: Build menjadi aplikasi Android native menggunakan Capacitor.js

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ dan npm

### Installation

```bash
cd KuliahPlanner
npm install
npm run dev
```

Aplikasi akan terbuka di `http://localhost:3000/`

## 📦 Production Build

```bash
npm run build
npm run preview
```

File yang di-build akan berada di folder `dist/`

## 📱 Android Build

Aplikasi ini mendukung build ke mobile (Android) menggunakan Capacitor.js.

```bash
npm run build
npx cap sync android
npx cap open android
```

## 📁 Project Structure

```
KuliahPlanner/
├── src/
│   ├── App.jsx                   # Main component
│   ├── components/
│   │   ├── ConfirmDialog.jsx     # Reusable confirm dialog
│   │   ├── EventModal.jsx        # Detail & aksi event matkul di kalender
│   │   ├── MatkulView.jsx        # Tab Config & Data (matkul, config, backup)
│   │   ├── OnboardingGuide.jsx   # Panduan interaktif untuk user baru
│   │   ├── ScheduleView.jsx      # Kalender (Month/Week/Day/Agenda) + drill-down
│   │   ├── Sidebar.jsx           # Navigasi tab sidebar
│   │   ├── StashView.jsx         # Tab Stash (reschedule kelas)
│   │   ├── TaskDetailModal.jsx   # Modal detail tugas + countdown deadline
│   │   ├── TaskView.jsx          # Tab Tugas + form tambah/edit tugas
│   │   ├── ThemeSwitcher.jsx     # Kontrol tema (Light/Dark/Auto) dan custom color picker/preset
│   │   └── ToastContainer.jsx    # Toast notification
│   ├── hooks/
│   │   ├── useCalendarEvents.js  # Derive calendar events dari data
│   │   ├── useKuliahData.js      # State & logic utama (CRUD matkul, tugas, stash)
│   │   ├── useTheme.js           # Pengelola tema sistem, mode light/dark, dan kalkulator palet warna dinamis
│   │   └── useToast.js           # Toast state management
│   ├── utils/
│   │   ├── dateUtils.js          # Helper format tanggal
│   │   ├── markdown.js           # Simple Markdown-to-HTML renderer
│   │   ├── storage.js            # localStorage read/write/export/import
│   │   └── validators.js         # Form validation
│   ├── main.jsx                  # React entry point
│   └── index.css                 # Tailwind directives
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🛠️ Tech Stack

- **React 18.2** - UI Framework
- **Vite 4.3** - Build tool (super fast)
- **Tailwind CSS 3.3** - Styling
- **Lucide React** - Icon library

## 📝 How to Use

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

### 5. Manage Tugas
Tab **Tugas** untuk:
- Tambah tugas baru dengan judul, matkul, deadline (tanggal + jam opsional), urgency, dan deskripsi Markdown
- **Edit tugas**: Klik ikon pensil di kartu tugas — form akan ter-isi otomatis, tombol berubah jadi "Perbarui Tugas"
- Mark complete/incomplete
- Delete tugas (dengan konfirmasi)
- Tugas juga muncul di kalender sebagai banner deadline!

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

## 💾 Data Persistence

Semua data otomatis tersimpan di **localStorage** browser:
- Courses
- Tasks
- Config
- Stashes & Reschedules

Data akan bertahan meski:
- Browser ditutup & dibuka kembali
- Halaman di-refresh

**Note**: Data tersimpan per-browser, bukan cloud-synced.

## 🔧 Improvements Implemented

✅ **From original code:**
- Fixed: No data persistence → Added localStorage
- Fixed: Incomplete task form → Added course selector + urgency
- Fixed: No validation → Added form validation
- Fixed: No error handling → Added error alerts
- Fixed: Not production-ready → Full Vite project setup
- Improved: Mobile responsive
- Added: Task completion toggle

✅ **Recent updates:**
- Added: Task edit mode (inline form re-populate, Perbarui/Simpan)
- Added: Task description field with Markdown support (`markdown.js` renderer)
- Added: `TaskDetailModal` — modal detail tugas + countdown deadline real-time
- Added: `OnboardingGuide` — panduan interaktif multi-step untuk user baru
- Added: Calendar breadcrumb navigation (history drill-down clickable)
- Added: Quick-add task button (`+`) per-hari di Week/Day view
- Added: Task banners di timeline kalender (Week & Day view)
- Added: Klik tugas di Agenda view membuka TaskDetailModal
- Added: `startEditTask` / `cancelEditTask` di `useKuliahData`
- Improved: ScheduleView refactored (all-day task row, breadcrumb, quick-add)
- Fixed: Known issue "No export/import feature" → Backup & Restore sudah tersedia
- Added: Setup Capacitor.js for native Android builds

## 🐛 Known Issues / TODO

- [ ] No user authentication (semua data public per browser)
- [ ] No push notification/reminder
- [ ] No dark/light mode toggle (hardcoded dark)
- [ ] Could optimize with TypeScript
- [ ] Could add tests

## 📱 Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (limited localStorage)
- Mobile browsers: ✅ Responsive

## 📄 License

Feel free to use, modify, dan share!

---

**Made with ❤️ for mahasiswa yang stress deadline**
