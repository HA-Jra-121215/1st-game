import React from 'react';
import { Crown, Heart, Home, Key, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import { GameRunStats } from '../../types/game';
import { soundEngine } from '../../audio/soundEngine';

interface GameOverModalProps {
  stats: GameRunStats;
  isNewHighScore: boolean;
  canReviveWithKey: boolean;
  canReviveWithDiamonds: boolean;
  onRevive: () => void;
  onRestart: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  isNewHighScore,
  canReviveWithKey,
  canReviveWithDiamonds,
  onRevive,
  onRestart,
  onHome,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-none animate-fade-in font-sans">
      <div className="w-full max-w-md bg-[#0d111d] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col items-center text-center">
        {/* Banner */}
        <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center mb-3">
          <span className="text-3xl">💀</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black tracking-wider uppercase text-white drop-shadow">
          ESCAPE FAILED
        </h2>
        <p className="text-xs text-white/50 mb-5">You succumbed to the perilous shadows</p>

        {/* High Score Badge */}
        {isNewHighScore && (
          <div className="mb-4 flex items-center gap-2 bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 border border-amber-400/50 px-4 py-1.5 rounded-full text-amber-300 font-bold text-xs animate-bounce">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>NEW BEST RECORD!</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-2.5 mb-6">
          <div className="bg-black/40 border border-white/5 p-3 rounded-2xl">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">FINAL SCORE</div>
            <div className="text-xl font-black font-mono text-white tabular-nums">
              {stats.score.toLocaleString()}
            </div>
          </div>

          <div className="bg-black/40 border border-white/5 p-3 rounded-2xl">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">DISTANCE</div>
            <div className="text-xl font-black font-mono text-cyan-400 tabular-nums">
              {Math.floor(stats.distance)}m
            </div>
          </div>

          <div className="bg-black/40 border border-white/5 p-3 rounded-2xl">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">COINS EARNED</div>
            <div className="text-lg font-black font-mono text-yellow-400 tabular-nums flex items-center justify-center gap-1">
              <span>●</span>
              <span>+{stats.coins}</span>
            </div>
          </div>

          <div className="bg-black/40 border border-white/5 p-3 rounded-2xl">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">GEMS / KEYS</div>
            <div className="text-lg font-black font-mono text-pink-400 tabular-nums flex items-center justify-center gap-2">
              <span>◆ +{stats.diamonds}</span>
              <span className="text-cyan-400">🗝 +{stats.keys}</span>
            </div>
          </div>
        </div>

        {/* Revive Option */}
        {(canReviveWithKey || canReviveWithDiamonds) && (
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onRevive();
            }}
            className="w-full py-3 px-4 mb-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
          >
            <Heart className="w-4 h-4 fill-current text-white" />
            <span>REVIVE WITH {canReviveWithKey ? '1 KEY' : '5 DIAMONDS'}</span>
          </button>
        )}

        {/* Primary Actions */}
        <div className="w-full flex items-center gap-3">
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
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>TRY AGAIN</span>
          </button>
        </div>
      </div>
    </div>
  );
};
