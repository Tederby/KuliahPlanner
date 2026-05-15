# KuliahPlanner 📚

Aplikasi web untuk manage jadwal kuliah, tugas, dan deadline semester dengan UI yang modern dan fitur powerful.

Demo online tersedia di: https://kuliah-planner.vercel.app/

## ✨ Features

- **📅 Multiple Calendar Views**: Month, Week, Day, dan Agenda view
- **🔄 Smart Meeting Generation**: Otomatis generate semua jadwal untuk satu semester
- **✅ Task Management**: Manage tugas dengan deadline, urgency, dan course tracking
- **💾 Local Storage**: Data tersimpan otomatis di browser, tidak hilang saat refresh
- **🏗️ Course Management**: Kelola data matkul (nama, SKS, jadwal, lokasi)
- **📌 Stash System**: "Ghosting" dosen? Stash kelas, restore, atau reschedule ketika jadwal berubah
- **⚡ Form Validation**: Input validation untuk mencegah data error
- **🎨 Modern UI**: Dark theme dengan Tailwind CSS dan Lucide icons

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

## 📁 Project Structure

```
KuliahPlanner/
├── src/
│   ├── App.jsx          # Main component with modular components/hooks/utils
│   ├── components/      # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Shared utility functions
│   ├── main.jsx         # React entry point
│   └── index.css        # Tailwind directives
├── index.html           # HTML entry
├── package.json         # Dependencies
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
└── postcss.config.js    # PostCSS configuration
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

### 3. Lihat Kalender
Tab **Full Kalender** dengan beberapa view:
- **Month**: Lihat sebulan penuh
- **Week**: Lihat minggu dengan timeline
- **Day**: Fokus satu hari dengan timeline detail
- **Agenda**: List semua event upcoming

### 4. Manage Tugas
Tab **Tugas (X)** untuk:
- Tambah tugas dengan deadline & urgency
- Mark complete/incomplete
- Delete tugas
- Tugas juga muncul di kalender!

### 5. Stash Kelas
Kalau dosen ghosting:
- Klik event di kalender
- Klik "Dosen Ghosting? Stash Kelas Ini"
- Kelas akan masuk ke Limbo
- Reschedule kelas dengan tanggal/jam baru dari tab **Stash**
- Restore kapan saja via tab **Config & Data**

## 💾 Data Persistence

Semua data otomatis tersimpan di **localStorage** browser:
- Courses
- Tasks
- Config
- Stashes

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

## 🐛 Known Issues / TODO

- [ ] No user authentication (semua data public per browser)
- [ ] No export/import feature
- [ ] No notification/reminder
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
