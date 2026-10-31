import React from 'react';
import { RotateCcw, Settings, Smartphone, Volume2, Vibrate, X } from 'lucide-react';
import { GameSettings } from '../../types/game';
import { soundEngine } from '../../audio/soundEngine';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onResetData: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetData,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-none animate-fade-in font-sans">
      <div className="w-full max-w-md bg-[#0c101d] border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
              <Settings className="w-5 h-5 text-white/80" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-wider uppercase text-white">
                GAME SETTINGS
              </h2>
              <p className="text-xs text-white/50">Audio, graphics & mobile controls</p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 mt-4">
          {/* SFX Volume */}
          <div className="bg-black/40 border border-white/5 p-3.5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>Sound Effects (SFX)</span>
              </span>
              <span className="text-xs font-mono text-white/60">
                {Math.round(settings.sfxVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.sfxVolume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onUpdateSettings({ sfxVolume: val });
                soundEngine.setVolumes(val, settings.bgmVolume);
              }}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Music Volume */}
          <div className="bg-black/40 border border-white/5 p-3.5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>Background Music (BGM)</span>
              </span>
              <span className="text-xs font-mono text-white/60">
                {Math.round(settings.bgmVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.bgmVolume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onUpdateSettings({ bgmVolume: val });
                soundEngine.setVolumes(settings.sfxVolume, val);
              }}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Vibration Feedback */}
          <div className="bg-black/40 border border-white/5 p-3.5 rounded-2xl flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Vibrate className="w-4 h-4 text-purple-400" />
              <span>Haptic Vibration Feedback</span>
            </span>
            <button
              onClick={() => {
                soundEngine.playButtonClick();
                onUpdateSettings({ vibration: !settings.vibration });
              }}
              className={`w-12 h-6 rounded-full transition p-1 flex items-center ${
                settings.vibration ? 'bg-purple-600 justify-end' : 'bg-white/10 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
            </button>
          </div>

          {/* Touch Control Mode */}
          <div className="bg-black/40 border border-white/5 p-3.5 rounded-2xl">
            <div className="text-xs font-bold text-white mb-2 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-yellow-400" />
              <span>Mobile Touch Control Style</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(['buttons', 'swipes'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    soundEngine.playButtonClick();
                    onUpdateSettings({ touchControlMode: m });
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition ${
                    settings.touchControlMode === m
                      ? 'bg-yellow-500 text-black font-black'
                      : 'bg-white/5 text-white/60 hover:text-white'
                  }`}
                >
                  {m === 'buttons' ? 'Touch Buttons' : 'Swipe Gestures'}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Save Data */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to reset all game save progress?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Game Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
