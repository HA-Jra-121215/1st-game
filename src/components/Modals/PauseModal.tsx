import React from 'react';
import { Home, Play, RotateCcw, Settings, Volume2, VolumeX } from 'lucide-react';
import { soundEngine } from '../../audio/soundEngine';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  onOpenSettings: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onHome,
  onOpenSettings,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-none animate-fade-in font-sans">
      <div className="w-full max-w-xs sm:max-w-sm bg-[#0d111d] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        <h2 className="text-xl sm:text-2xl font-black tracking-widest uppercase text-white drop-shadow mb-1">
          GAME PAUSED
        </h2>
        <p className="text-xs text-white/50 mb-6">Take a breath, Shadow Runner</p>

        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onResume();
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>RESUME</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onRestart();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/90 font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESTART RUN</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onOpenSettings();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/90 font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>SETTINGS</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onHome();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>EXIT TO TITLE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
