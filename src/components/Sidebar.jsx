import React from 'react';
import { Calendar, List, Settings, Inbox, HelpCircle, Cloud, RefreshCw, LogOut, User } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';

const Sidebar = ({ activeTab, setActiveTab, config, tasks, stashes, courses = [], onShowGuide, theme, cloudSync }) => {
  const tabs = [
    { id: 'schedule', icon: Calendar, label: 'Kalender' },
    { id: 'tasks', icon: List, label: `Tugas & Acara (${tasks.filter((t) => !t.completed).length})` },
    { id: 'stash', icon: Inbox, label: `Stash (${stashes.length})` },
    { id: 'matkul', icon: Settings, label: 'Config & Data' },
  ];

  const totalSks = (courses || []).reduce((sum, c) => sum + (Number(c.sks) || 0), 0);

  return (
    <div className="md:w-60 shrink-0 space-y-2">
      <div className="mb-5 px-2 py-1">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-accent text-accent-contrast flex items-center justify-center font-bold text-xs shadow-sm">
            KP
          </div>
          <div>
            <h1 className="text-base font-bold text-theme-text tracking-tight leading-none">
              KuliahPlanner
            </h1>
            <span className="text-[11px] text-theme-muted font-medium">Academic Workspace</span>
          </div>
        </div>
      </div>

      <nav className="space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-theme-surface-subtle text-theme-text border border-theme shadow-sm'
                : 'text-theme-muted hover:bg-theme-surface hover:text-theme-text border border-transparent'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-accent' : 'text-theme-muted'}`} /> {tab.label}
          </button>
        ))}
      </nav>

      {/* Theme & Custom Color Switcher */}
      {theme && (
        <div className="pt-2">
          <ThemeSwitcher
            themeMode={theme.themeMode}
            setThemeMode={theme.setThemeMode}
            accentColor={theme.accentColor}
            setAccentColor={theme.setAccentColor}
            isMonochrome={theme.isMonochrome}
            setMonochrome={theme.setMonochrome}
            COLOR_PRESETS={theme.COLOR_PRESETS}
          />
        </div>
      )}

      {/* Supabase Cloud Sync / User Profile Widget */}
      {cloudSync && (
        <div className="pt-1">
          {!cloudSync.userProfile ? (
            <button
              onClick={cloudSync.onLogin}
              disabled={cloudSync.isSyncing}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-theme-surface hover:bg-theme-surface-subtle text-theme-text border border-theme font-medium text-xs shadow-sm transition-all hover:border-accent/40 active:scale-[0.99]"
            >
              <Cloud className="w-4 h-4 shrink-0 text-accent" />
              <span>{cloudSync.isSyncing ? 'Menghubungkan...' : 'Masuk / Akun Cloud'}</span>
            </button>
          ) : (
            <div className="p-2.5 bg-theme-surface rounded-lg border border-theme flex items-center justify-between gap-2 shadow-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-accent text-accent-contrast font-bold text-xs flex items-center justify-center shrink-0">
                  {(cloudSync.userProfile.name || cloudSync.userProfile.username || 'U')[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-theme-text truncate leading-tight">
                    @{cloudSync.userProfile.name || cloudSync.userProfile.username}
                  </p>
                  <p className="text-[10px] text-theme-muted flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        cloudSync.isSyncing
                          ? 'bg-amber-500 animate-pulse'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <span className="truncate">
                      {cloudSync.isSyncing
                        ? 'Menyinkronkan...'
                        : cloudSync.lastSyncTime
                        ? `Sync ${new Date(cloudSync.lastSyncTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
                        : 'Supabase Aktif'}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={cloudSync.onSync}
                  disabled={cloudSync.isSyncing}
                  title="Sinkronkan Sekarang"
                  className="p-1.5 rounded text-theme-muted hover:text-accent hover:bg-theme-surface-subtle transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${cloudSync.isSyncing ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={cloudSync.onLogout}
                  title="Keluar dari Akun"
                  className="p-1.5 rounded text-theme-muted hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div>
        <div className="p-3 bg-theme-surface rounded-md border border-theme">
          <div className="text-[11px] font-semibold text-theme-muted uppercase tracking-wider mb-2">Engine Info</div>
          <div className="text-[11px] text-theme-text space-y-1">
            <p className="flex justify-between"><span className="text-theme-muted">Total SKS:</span> <span className="font-semibold text-accent">{totalSks} SKS</span></p>
            <p className="flex justify-between"><span className="text-theme-muted">Mulai:</span> <span>{config.semesterStart}</span></p>
            <p className="flex justify-between"><span className="text-theme-muted">Pertemuan:</span> <span>{config.totalMeetings}</span></p>
            <p className="flex justify-between"><span className="text-theme-muted">UTS:</span> <span>P-{config.meetingsBeforeUTS} ({config.utsWeeks}m)</span></p>
            <p className="flex justify-between"><span className="text-theme-muted">UAS:</span> <span>P-{config.meetingsBeforeUAS} ({config.uasWeeks}m)</span></p>
          </div>
        </div>
      </div>

      {/* Guide button */}
      <button
        onClick={onShowGuide}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-theme-muted hover:text-theme-text hover:bg-theme-surface transition-colors text-xs font-medium border border-transparent"
      >
        <HelpCircle className="w-4 h-4 text-theme-muted" />
        Panduan Penggunaan
      </button>

      {/* Legal Links */}
      <div className="pt-2 px-2 flex items-center justify-center gap-2.5 text-[11px] text-theme-muted border-t border-theme">
        <a
          href="privacy.html"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-theme-text transition-colors"
        >
          Kebijakan Privasi
        </a>
        <span>•</span>
        <a
          href="terms.html"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-theme-text transition-colors"
        >
          Syarat & Ketentuan
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
