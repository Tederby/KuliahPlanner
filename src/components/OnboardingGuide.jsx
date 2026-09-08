import React, { useState, useEffect } from 'react';
import { Calendar, Settings, List, Inbox, ChevronRight, X, Sparkles } from 'lucide-react';

const ONBOARDING_KEY = 'kuliahplanner_onboarding_seen';

const steps = [
  {
    icon: Sparkles,
    title: 'Selamat datang di KuliahPlanner!',
    content: 'KuliahPlanner membantu kamu mengatur jadwal kuliah, mengelola tugas, dan menangani perubahan jadwal mendadak. Yuk kenali fitur-fiturnya!',
  },
  {
    icon: Settings,
    title: '1. Config & Data',
    content: 'Mulai di sini! Atur tanggal mulai semester, durasi SKS, target pertemuan, dan jadwal UTS/UAS. Lalu tambahkan data mata kuliah seperti nama, hari, jam, SKS, dan lokasi ruang.',
  },
  {
    icon: Calendar,
    title: '2. Kalender',
    content: 'Lihat jadwal di berbagai mode: Month, Week, Day, atau Agenda. Klik area kosong untuk zoom in (Month→Week→Day). Klik matkul untuk detail & aksi. Tugas tampil sebagai banner di atas grid.',
  },
  {
    icon: List,
    title: '3. Tugas',
    content: 'Kelola semua tugas dan deadline. Tambah tugas manual atau langsung dari modal matkul di kalender. Setiap tugas bisa punya deskripsi. Deadline yang mendekat akan ditandai otomatis.',
  },
  {
    icon: Inbox,
    title: '4. Stash',
    content: 'Dosen berhalangan? Stash kelas yang batal langsung dari kalender. Nanti atur jadwal penggantinya di tab Stash kapan pun siap. Kelas yang di-reschedule akan muncul di kalender dengan badge "Reschedule".',
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
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4"
      onClick={onClose}
    >
      <div
        className="bg-theme-surface rounded-lg border border-theme shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress */}
        <div className="flex gap-1 px-5 pt-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-sm transition-colors duration-200 ${
                i <= step ? 'bg-accent' : 'bg-theme-surface-subtle border border-theme-subtle'
              }`}
            />
          ))}
        </div>

        {/* Icon & Content */}
        <div className="p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-md bg-theme-surface-subtle border border-theme flex items-center justify-center text-accent">
            <Icon className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-theme-text mb-2">{current.title}</h2>
          <p className="text-theme-muted text-xs leading-relaxed max-w-sm mx-auto">
            {current.content}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-5 pb-5 pt-2 border-t border-theme">
          <button
            onClick={onClose}
            className="text-xs text-theme-muted hover:text-theme-text transition-colors"
          >
            Lewati
          </button>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-3 py-1.5 text-xs text-theme-muted hover:text-theme-text transition-colors"
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
              className="px-3.5 py-1.5 bg-accent hover:bg-accent-hover text-accent-contrast rounded-md font-medium text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              {isLast ? 'Mulai Pakai' : 'Lanjut'}
              {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ONBOARDING_KEY };
export default OnboardingGuide;
