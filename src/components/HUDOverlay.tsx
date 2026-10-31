import React from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Flame,
  Pause,
  Shield,
  Sparkles,
  Zap
} from 'lucide-react';
import { ActivePowerUps, GameMode, GameRunStats, WorldTheme } from '../types/game';
import { WORLD_CONFIGS } from '../game/meta/gameStorage';

interface HUDOverlayProps {
  stats: GameRunStats;
  powerUps: ActivePowerUps;
  bossHp?: { current: number; max: number };
  mode: GameMode;
  world: WorldTheme;
  touchControlMode: 'buttons' | 'joystick' | 'swipes';
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onJump: () => void;
  onSlide: () => void;
  onDash: () => void;
  onPause: () => void;
}

export const HUDOverlay: React.FC<HUDOverlayProps> = ({
  stats,
  powerUps,
  bossHp,
  mode,
  world,
  touchControlMode,
  onMoveLeft,
  onMoveRight,
  onJump,
  onSlide,
  onDash,
  onPause,
}) => {
  const worldConfig = WORLD_CONFIGS[world];

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none font-sans overflow-hidden">
      {/* TOP PERIMETER STATUS HUD */}
      <div className="flex items-start justify-between w-full z-20">
        {/* Top Left: Score, Distance & Combo */}
        <div className="flex flex-col gap-1.5 pointer-events-auto">
          {/* Main Score readout with tabular-nums */}
          <div className="bg-black/60 border border-white/10 px-3.5 py-1.5 rounded-xl shadow-lg flex items-baseline gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">SCORE</span>
            <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white tabular-nums drop-shadow">
              {stats.score.toLocaleString()}
            </span>
          </div>

          {/* Distance & Multiplier Cluster */}
          <div className="flex items-center gap-2">
            <div className="bg-black/50 border border-white/10 px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-cyan-400 tabular-nums">
              {Math.floor(stats.distance)}m
            </div>

            {stats.combos > 2 && (
              <div className="bg-gradient-to-r from-amber-500/80 to-red-500/80 border border-amber-400/40 px-2.5 py-1 rounded-lg text-xs font-black tracking-wider text-white shadow-lg animate-bounce">
                {stats.combos}x COMBO!
              </div>
            )}
          </div>
        </div>

        {/* Top Center: Boss Health Bar or Time Attack Countdown */}
        {bossHp && (
          <div className="flex flex-col items-center pointer-events-auto w-48 sm:w-64 animate-fade-in">
            <div className="text-xs font-black tracking-widest text-red-400 uppercase drop-shadow mb-1 flex items-center gap-1.5">
              <span>{worldConfig.bossName}</span>
            </div>
            <div className="w-full bg-black/70 border border-red-500/40 h-3.5 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full transition-all duration-150"
                style={{ width: `${Math.max(0, (bossHp.current / bossHp.max) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {mode === 'time_attack' && stats.timeRemaining !== undefined && !bossHp && (
          <div className="flex flex-col items-center pointer-events-auto animate-fade-in">
            <div className="bg-black/70 border border-emerald-500/40 px-4 py-1.5 rounded-xl flex items-center gap-2 font-mono text-base font-black text-emerald-400 tabular-nums shadow-lg">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>{Math.ceil(stats.timeRemaining)}s</span>
            </div>
          </div>
        )}

        {/* Top Right: Collectibles & Pause Button */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Coins */}
          <div className="flex items-center gap-1 bg-black/60 border border-yellow-500/30 px-2.5 py-1 rounded-lg font-mono text-xs font-bold text-yellow-400 tabular-nums">
            <span>●</span>
            <span>{stats.coins}</span>
          </div>

          {/* Diamonds */}
          <div className="flex items-center gap-1 bg-black/60 border border-pink-500/30 px-2.5 py-1 rounded-lg font-mono text-xs font-bold text-pink-400 tabular-nums">
            <span>◆</span>
            <span>{stats.diamonds}</span>
          </div>

          {/* Pause Button */}
          <button
            onClick={onPause}
            className="w-8 h-8 rounded-lg bg-black/60 border border-white/10 hover:bg-white/20 text-white flex items-center justify-center transition shadow-lg"
            title="Pause Game"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MIDDLE: ACTIVE POWER-UP TIMERS (LOW OCCLUSION) */}
      <div className="flex items-center justify-center gap-2 pointer-events-none my-auto">
        {powerUps.shield > 0 && (
          <div className="bg-cyan-500/20 border border-cyan-400/50 px-3 py-1 rounded-full text-xs font-bold text-cyan-300 flex items-center gap-1.5 shadow-lg">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>SHIELD x{powerUps.shield}</span>
          </div>
        )}

        {powerUps.speedBoost > 0 && (
          <div className="bg-emerald-500/20 border border-emerald-400/50 px-3 py-1 rounded-full text-xs font-bold text-emerald-300 flex items-center gap-1.5 shadow-lg">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>SPEED {Math.ceil(powerUps.speedBoost)}s</span>
          </div>
        )}

        {powerUps.magnet > 0 && (
          <div className="bg-yellow-500/20 border border-yellow-400/50 px-3 py-1 rounded-full text-xs font-bold text-yellow-300 flex items-center gap-1.5 shadow-lg">
            <span>🧲</span>
            <span>MAGNET {Math.ceil(powerUps.magnet)}s</span>
          </div>
        )}

        {powerUps.doubleCoins > 0 && (
          <div className="bg-pink-500/20 border border-pink-400/50 px-3 py-1 rounded-full text-xs font-bold text-pink-300 flex items-center gap-1.5 shadow-lg">
            <span>★</span>
            <span>2X COINS {Math.ceil(powerUps.doubleCoins)}s</span>
          </div>
        )}

        {powerUps.phaseShift > 0 && (
          <div className="bg-purple-500/20 border border-purple-400/50 px-3 py-1 rounded-full text-xs font-bold text-purple-300 flex items-center gap-1.5 shadow-lg">
            <span>👁</span>
            <span>PHASE {Math.ceil(powerUps.phaseShift)}s</span>
          </div>
        )}
      </div>

      {/* BOTTOM: TOUCH CONTROLS (OPTIMIZED FOR MOBILE THUMB REACH) */}
      <div className="w-full flex items-end justify-between z-20 pb-2 sm:pb-4">
        {/* Left Hand: Lane Switch Steering Buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onMoveLeft();
            }}
            onClick={onMoveLeft}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-black/60 border border-white/20 active:bg-cyan-500/30 active:border-cyan-400 flex items-center justify-center text-white shadow-xl transition-transform active:scale-90"
            title="Move Left (A / Left Arrow)"
          >
            <ArrowLeft className="w-7 h-7 sm:w-8 sm:h-8" />
          </button>

          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onMoveRight();
            }}
            onClick={onMoveRight}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-black/60 border border-white/20 active:bg-cyan-500/30 active:border-cyan-400 flex items-center justify-center text-white shadow-xl transition-transform active:scale-90"
            title="Move Right (D / Right Arrow)"
          >
            <ArrowRight className="w-7 h-7 sm:w-8 sm:h-8" />
          </button>
        </div>

        {/* Right Hand: Action Buttons (Jump, Slide, Dash) */}
        <div className="flex items-center gap-2.5 pointer-events-auto">
          {/* Dash / Warp Burst Button */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onDash();
            }}
            onClick={onDash}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-purple-600/70 to-indigo-600/70 border border-purple-400/40 active:scale-90 flex items-center justify-center text-white shadow-xl transition-transform"
            title="Warp Dash (Shift / E)"
          >
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-purple-200 fill-current" />
          </button>

          {/* Slide Button */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onSlide();
            }}
            onClick={onSlide}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-black/60 border border-white/20 active:bg-amber-500/30 active:border-amber-400 flex items-center justify-center text-white shadow-xl transition-transform active:scale-90"
            title="Slide Down (S / Down Arrow)"
          >
            <ArrowDown className="w-7 h-7 sm:w-8 sm:h-8" />
          </button>

          {/* Jump Button */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onJump();
            }}
            onClick={onJump}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-emerald-500/80 to-teal-500/80 border border-emerald-400/60 active:scale-90 flex items-center justify-center text-black shadow-2xl transition-transform font-black"
            title="Jump (Space / W / Up Arrow)"
          >
            <ArrowUp className="w-8 h-8 sm:w-10 sm:h-10 text-black stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
