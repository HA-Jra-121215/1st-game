import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowRight, Home, RotateCcw, Sparkles, Star, Trophy } from 'lucide-react';
import { GameRunStats, WorldTheme } from '../../types/game';
import { WORLD_CONFIGS } from '../../game/meta/gameStorage';
import { soundEngine } from '../../audio/soundEngine';

interface VictoryModalProps {
  stats: GameRunStats;
  currentWorld: WorldTheme;
  onNextAct: () => void;
  onRestart: () => void;
  onHome: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  stats,
  currentWorld,
  onNextAct,
  onRestart,
  onHome,
}) => {
  const worldConfig = WORLD_CONFIGS[currentWorld];

  useEffect(() => {
    // Confetti celebratory burst
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00f5d4', '#7928ca', '#ff0080', '#ffd700'],
      });
    } catch {
      // fallback
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-none animate-fade-in font-sans">
      <div className="w-full max-w-md bg-[#0d131f] border border-emerald-500/30 rounded-3xl p-6 sm:p-7 shadow-[0_0_60px_rgba(16,185,129,0.2)] flex flex-col items-center text-center">
        {/* Star Rating Banner */}
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-8 h-8 text-yellow-400 fill-current drop-shadow-[0_0_12px_rgba(250,204,21,0.8)] animate-bounce" />
          <Star className="w-10 h-10 text-yellow-400 fill-current drop-shadow-[0_0_16px_rgba(250,204,21,0.9)] animate-bounce delay-100" />
          <Star className="w-8 h-8 text-yellow-400 fill-current drop-shadow-[0_0_12px_rgba(250,204,21,0.8)] animate-bounce delay-200" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black tracking-wider uppercase text-emerald-300 drop-shadow">
          WORLD CONQUERED!
        </h2>
        <p className="text-xs text-white/70 mb-5">
          You survived {worldConfig.name} and escaped the impossible
        </p>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-2.5 mb-6">
          <div className="bg-black/50 border border-white/5 p-3 rounded-2xl">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">TOTAL SCORE</div>
            <div className="text-xl font-black font-mono text-white tabular-nums">
              {stats.score.toLocaleString()}
            </div>
          </div>

          <div className="bg-black/50 border border-white/5 p-3 rounded-2xl">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">ACT REWARD</div>
            <div className="text-xl font-black font-mono text-yellow-400 tabular-nums">
              +500 COINS
            </div>
          </div>

          <div className="bg-black/50 border border-white/5 p-3 rounded-2xl">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">DIAMONDS</div>
            <div className="text-lg font-black font-mono text-pink-400 tabular-nums">
              ◆ +{stats.diamonds + 5}
            </div>
          </div>

          <div className="bg-black/50 border border-white/5 p-3 rounded-2xl">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">MAX COMBO</div>
            <div className="text-lg font-black font-mono text-cyan-400 tabular-nums">
              {stats.maxCombo}x Streak
            </div>
          </div>
        </div>

        {/* Primary Actions */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onNextAct();
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-black font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,245,212,0.4)] hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
          >
            <span>NEXT WORLD</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="w-full flex items-center gap-2.5">
            <button
              onClick={() => {
                soundEngine.playButtonClick();
                onHome();
              }}
              className="flex-1 py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>MENU</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playButtonClick();
                onRestart();
              }}
              className="flex-1 py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>REPLAY</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
