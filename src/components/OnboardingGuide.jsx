import React, { useState, useEffect } from 'react';
import { Calendar, Settings, List, Inbox, ChevronRight, X, Sparkles } from 'lucide-react';

const ONBOARDING_KEY = 'kuliahplanner_onboarding_seen';

const steps = [
  {
    icon: Sparkles,
    title: 'Selamat datang di KuliahPlanner! 🎓',
    content: 'KuliahPlanner membantu kamu mengatur jadwal kuliah, mengelola tugas, dan menangani perubahan jadwal mendadak. Yuk kenali fitur-fiturnya!',
    color: 'from-indigo-500 to-cyan-500',
  },
  {
    icon: Settings,
    title: '1. Config & Data',
    content: 'Mulai di sini! Atur tanggal mulai semester, durasi SKS, target pertemuan, dan jadwal UTS/UAS. Lalu tambahkan data mata kuliah seperti nama, hari, jam, SKS, dan lokasi ruang.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: Calendar,
    title: '2. Kalender',
    content: 'Lihat jadwal di berbagai mode: Month, Week, Day, atau Agenda. Klik area kosong untuk zoom in (Month→Week→Day). Klik matkul untuk detail & aksi. Tugas tampil sebagai banner di atas grid.',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    icon: List,
    title: '3. Tugas',
    content: 'Kelola semua tugas dan deadline. Tambah tugas manual atau langsung dari modal matkul di kalender. Setiap tugas bisa punya deskripsi. Deadline yang mendekat akan ditandai otomatis.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Inbox,
    title: '4. Stash',
    content: 'Dosen ghosting? Stash kelas yang batal langsung dari kalender. Nanti atur jadwal penggantinya di tab Stash kapan pun siap. Kelas yang di-reschedule akan muncul di kalender dengan badge "Reschedule".',
    color: 'from-amber-500 to-orange-500',
  },
];

const OnboardingGuide = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (isOpen) setStep(0);
  }, [isOpen]);

  if (!isOpen) return null;

  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress */}
        <div className="flex gap-1 px-6 pt-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= step ? 'bg-indigo-500' : 'bg-slate-700'
                }`}
            />
          ))}
        </div>

        {/* Icon & Content */}
        <div className="p-8 text-center">
          <div className={`w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br ${current.color} flex items-center justify-center shadow-lg`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-3">{current.title}</h2>
          <p className="text-slate-300 text-sm leading-relaxed max-w-sm mx-auto">
            {current.content}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-6 pb-6">
          <button
            onClick={onClose}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            Lewati
          </button>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                Kembali
              </button>
            )}
            <button
              onClick={() => {
                if (isLast) {
                  localStorage.setItem(ONBOARDING_KEY, 'true');
                  onClose();
                } else {
                  setStep(step + 1);
                }
              }}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center gap-1.5"
            >
              {isLast ? 'Mulai Pakai! 🚀' : 'Lanjut'}
              {!isLast && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ONBOARDING_KEY };
export default OnboardingGuide;
