import React, { useState } from 'react';
import { Cloud, RefreshCw, Palette, HelpCircle, X } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';

const MobileHeader = ({ theme, cloudSync, onShowGuide }) => {
  const [showThemeModal, setShowThemeModal] = useState(false);

  return (
    <>
      <header className="md:hidden sticky top-0 z-30 bg-theme-surface border-b border-theme px-3.5 pt-[calc(var(--safe-area-top)+0.5rem)] pb-2.5 shadow-xs select-none">
        <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
          {/* Brand */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-md bg-accent text-accent-contrast flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
              KP
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-theme-text tracking-tight leading-none truncate">
                KuliahPlanner
              </h1>
              <span className="text-[10px] text-theme-muted font-medium block leading-tight truncate">
                Academic Workspace
              </span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Supabase Cloud Button / Avatar */}
            {cloudSync && (
              <>
                {cloudSync.userProfile ? (
                  <button
                    type="button"
                    onClick={cloudSync.onSync}
                    disabled={cloudSync.isSyncing}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-theme-surface-subtle border border-theme text-theme-text text-xs active:scale-95 transition-all"
                    title="Sinkronkan Cloud"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        cloudSync.isSyncing
                          ? 'bg-amber-500 animate-pulse'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <RefreshCw
                      className={`w-3 h-3 text-accent ${
                        cloudSync.isSyncing ? 'animate-spin' : ''
                      }`}
                    />
                    <span className="text-[10px] font-medium max-w-[60px] truncate">
                      @{cloudSync.userProfile.name || cloudSync.userProfile.username}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={cloudSync.onLogin}
                    className="flex items-center gap-1 px-2 py-1 rounded-full bg-theme-surface-subtle border border-theme text-theme-text text-[11px] font-medium active:scale-95 transition-all"
                    title="Masuk Akun Supabase"
                  >
                    <Cloud className="w-3.5 h-3.5 text-accent" />
                    <span className="text-[10px]">Cloud</span>
                  </button>
                )}
              </>
            )}

            {/* Theme & Color Palette Button */}
            {theme && (
              <button
                type="button"
                onClick={() => setShowThemeModal(true)}
                className="p-1.5 rounded-md text-theme-muted hover:text-theme-text hover:bg-theme-surface-subtle border border-transparent hover:border-theme transition-colors active:scale-95 flex items-center gap-1"
                title="Ganti Tema & Warna Tampilan"
              >
                <div
                  className="w-3.5 h-3.5 rounded-full border border-theme shadow-xs"
                  style={{ backgroundColor: theme.isMonochrome ? '#27272a' : theme.accentColor }}
                />
                <Palette className="w-3.5 h-3.5 text-theme-muted" />
              </button>
            )}

            {/* Guide Help Button */}
            {onShowGuide && (
              <button
                type="button"
                onClick={onShowGuide}
                className="p-1.5 rounded-md text-theme-muted hover:text-theme-text hover:bg-theme-surface-subtle border border-transparent hover:border-theme transition-colors active:scale-95"
                title="Panduan Penggunaan"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Theme & Palette Bottom Sheet Modal */}
      {showThemeModal && theme && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center p-0 animate-[fadeIn_0.15s_ease-out]"
          onClick={() => setShowThemeModal(false)}
        >
          <div
            className="bg-theme-surface rounded-t-2xl border-t border-theme shadow-2xl w-full max-w-md p-4 pb-[calc(var(--safe-area-bottom)+1.25rem)] flex flex-col overflow-hidden animate-[slideUp_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-theme-muted/30 rounded-full mx-auto mb-3 shrink-0" />
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-theme-text flex items-center gap-2">
                <Palette className="w-4 h-4 text-accent" /> Tema & Palet Warna
              </h3>
              <button
                onClick={() => setShowThemeModal(false)}
                className="p-1 rounded text-theme-muted hover:text-theme-text"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
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
        </div>
      )}
    </>
  );
};

export default MobileHeader;
