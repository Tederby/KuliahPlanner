import React, { useRef } from 'react';
import { Sun, Moon, Monitor, Palette, Check } from 'lucide-react';

const ThemeSwitcher = ({
  themeMode,
  setThemeMode,
  accentColor,
  setAccentColor,
  isMonochrome,
  setMonochrome,
  COLOR_PRESETS,
}) => {
  const colorInputRef = useRef(null);

  const modeButtons = [
    { id: 'light', label: 'Terang', icon: Sun },
    { id: 'dark', label: 'Gelap', icon: Moon },
    { id: 'system', label: 'Auto', icon: Monitor },
  ];

  return (
    <div className="p-3 bg-theme-surface rounded-md border border-theme space-y-3">
      {/* Mode switcher */}
      <div>
        <div className="text-[11px] font-semibold text-theme-muted uppercase tracking-wider mb-1.5">
          Mode Tampilan
        </div>
        <div className="grid grid-cols-3 gap-1 bg-theme-surface-subtle p-0.5 rounded-md border border-theme">
          {modeButtons.map((btn) => {
            const Icon = btn.icon;
            const active = themeMode === btn.id;
            return (
              <button
                key={btn.id}
                type="button"
                onClick={() => setThemeMode(btn.id)}
                className={`flex items-center justify-center gap-1.5 py-1 px-1.5 rounded text-xs font-medium transition-colors ${
                  active
                    ? 'bg-theme-surface text-theme-text shadow-sm'
                    : 'text-theme-muted hover:text-theme-text'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Color switcher */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-theme-muted uppercase tracking-wider">
            Palet Warna
          </span>
          {!isMonochrome && (
            <span className="text-[10px] font-mono text-theme-muted uppercase">
              {accentColor}
            </span>
          )}
        </div>

        {/* Presets row */}
        <div className="flex items-center flex-wrap gap-1.5">
          {COLOR_PRESETS.map((preset) => {
            const isSelected =
              preset.id === 'monochrome'
                ? isMonochrome
                : !isMonochrome && accentColor.toLowerCase() === preset.hex.toLowerCase();

            return (
              <button
                key={preset.id}
                type="button"
                title={preset.name}
                onClick={() => {
                  if (preset.id === 'monochrome') {
                    setMonochrome();
                  } else {
                    setAccentColor(preset.hex);
                  }
                }}
                className={`w-5 h-5 rounded-full flex items-center justify-center transition-transform hover:scale-110 border ${
                  isSelected
                    ? 'ring-2 ring-offset-1 ring-offset-theme-surface ring-accent border-transparent'
                    : 'border-theme'
                }`}
                style={{
                  backgroundColor:
                    preset.id === 'monochrome' ? '#27272a' : preset.hex,
                }}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </button>
            );
          })}

          {/* Custom Color Picker Button */}
          <div className="relative">
            <button
              type="button"
              title="Pilih warna kustom bebas (HEX)"
              onClick={() => colorInputRef.current?.click()}
              className={`w-5 h-5 rounded-full flex items-center justify-center transition-transform hover:scale-110 border bg-gradient-to-tr from-rose-500 via-emerald-500 to-indigo-500 ${
                !isMonochrome &&
                !COLOR_PRESETS.some(
                  (p) => p.id !== 'monochrome' && p.hex.toLowerCase() === accentColor.toLowerCase()
                )
                  ? 'ring-2 ring-offset-1 ring-offset-theme-surface ring-accent border-transparent'
                  : 'border-theme'
              }`}
            >
              <Palette className="w-2.5 h-2.5 text-white drop-shadow-sm" />
            </button>
            <input
              ref={colorInputRef}
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="sr-only"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSwitcher;
