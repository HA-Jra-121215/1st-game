import React, { useState } from 'react';
import {
  Compass,
  Crown,
  Download,
  Flame,
  Gift,
  HelpCircle,
  Play,
  RotateCcw,
  Settings,
  Shield,
  ShoppingBag,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  Zap
} from 'lucide-react';
import { CharacterSkin, GameMode, WorldTheme } from '../types/game';
import { SaveData, WORLD_CONFIGS } from '../game/meta/gameStorage';
import { soundEngine } from '../audio/soundEngine';

interface TitleScreenProps {
  saveData: SaveData;
  selectedSkin: CharacterSkin;
  selectedWorld: WorldTheme;
  selectedMode: GameMode;
  onStartGame: () => void;
  onOpenModal: (
    modal:
      | 'locker'
      | 'missions'
      | 'rewards'
      | 'shop'
      | 'leaderboard'
      | 'settings'
      | 'android'
      | 'modes'
  ) => void;
  onSelectWorld: (world: WorldTheme) => void;
  canClaimDailyReward: boolean;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  saveData,
  selectedSkin,
  selectedWorld,
  selectedMode,
  onStartGame,
  onOpenModal,
  onSelectWorld,
  canClaimDailyReward,
}) => {
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  };

  const worldConfig = WORLD_CONFIGS[selectedWorld];

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 select-none overflow-hidden font-sans">
      {/* Top Perimeter Status Cluster */}
      <div className="flex items-center justify-between w-full z-20 pointer-events-auto">
        {/* Left: Player Profile & Active Skin */}
        <div className="flex items-center gap-3 bg-black/60 border border-white/10 px-3.5 py-2 rounded-xl backdrop-blur-none shadow-lg">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm border shadow-inner"
            style={{
              backgroundColor: selectedSkin.colors.suit ? `#${selectedSkin.colors.suit.toString(16).padStart(6, '0')}` : '#111827',
              borderColor: selectedSkin.colors.glow,
              color: selectedSkin.colors.glow,
            }}
          >
            {selectedSkin.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-white/70">
              <span>{selectedSkin.title}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                LVL {saveData.playerStats.speedLevel}
              </span>
            </div>
            <div className="text-sm font-bold text-white tracking-wide">
              {selectedSkin.name}
            </div>
          </div>
        </div>

        {/* Center: Current World Badge */}
        <button
          onClick={() => onOpenModal('modes')}
          className="hidden md:flex items-center gap-2 bg-black/60 border border-white/10 hover:border-cyan-500/50 px-4 py-2 rounded-xl transition text-xs font-semibold text-white/90"
        >
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: worldConfig.primaryColor }}
          />
          <span>{worldConfig.name}</span>
          <span className="text-white/40 uppercase tracking-widest text-[10px]">
            [{selectedMode.replace('_', ' ')}]
          </span>
        </button>

        {/* Right: Currency Readouts (Tabular Nums per Guidelines) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Coins */}
          <div className="flex items-center gap-1.5 bg-black/60 border border-yellow-500/20 px-3 py-1.5 rounded-lg text-yellow-400 font-mono text-sm font-bold tabular-nums">
            <div className="w-4 h-4 rounded-full bg-yellow-400/20 flex items-center justify-center text-xs">
              ●
            </div>
            <span>{saveData.coins.toLocaleString()}</span>
          </div>

          {/* Diamonds */}
          <div className="flex items-center gap-1.5 bg-black/60 border border-pink-500/20 px-3 py-1.5 rounded-lg text-pink-400 font-mono text-sm font-bold tabular-nums">
            <span className="text-xs">◆</span>
            <span>{saveData.diamonds.toLocaleString()}</span>
          </div>

          {/* Ancient Keys */}
          <div className="flex items-center gap-1.5 bg-black/60 border border-cyan-500/20 px-3 py-1.5 rounded-lg text-cyan-400 font-mono text-sm font-bold tabular-nums">
            <span className="text-xs">🗝</span>
            <span>{saveData.keys}</span>
          </div>

          {/* Mute Toggle */}
          <button
            onClick={toggleMute}
            className="p-2 rounded-lg bg-black/60 border border-white/10 hover:bg-white/10 text-white/80 transition"
            title="Toggle Audio"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Hero Centerpiece: Bespoke SVG Title Lockup with 30-40% Negative Space */}
      <div className="flex flex-col items-center justify-center my-auto z-10 select-none text-center">
        {/* Bespoke inline SVG Title Lockup */}
        <div className="w-full max-w-xl px-4 animate-fade-in">
          <svg viewBox="0 0 800 190" className="w-full h-auto drop-shadow-2xl">
            <defs>
              <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="45%" stopColor="#00f5d4" />
                <stop offset="80%" stopColor="#7928ca" />
                <stop offset="100%" stopColor="#ff0080" />
              </linearGradient>
              <filter id="titleGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Sub-label */}
            <text
              x="400"
              y="38"
              textAnchor="middle"
              fill="#00f5d4"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight="800"
              fontSize="20"
              letterSpacing="12"
            >
              ORIGINAL 3D SURVIVAL ADVENTURE
            </text>

            {/* Main Title */}
            <text
              x="400"
              y="120"
              textAnchor="middle"
              fill="url(#titleGrad)"
              filter="url(#titleGlow)"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight="900"
              fontSize="82"
              letterSpacing="6"
            >
              SHADOW ESCAPE
            </text>

            {/* Impossible World subtitle */}
            <text
              x="400"
              y="168"
              textAnchor="middle"
              fill="#ffffff"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight="700"
              fontSize="22"
              letterSpacing="14"
              opacity="0.9"
            >
              THE IMPOSSIBLE WORLD
            </text>
          </svg>
        </div>

        {/* Primary Start CTA Button */}
        <div className="mt-6 flex flex-col items-center gap-3 pointer-events-auto">
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onStartGame();
            }}
            className="group relative inline-flex items-center justify-center gap-3 px-8 sm:px-12 py-3.5 sm:py-4 font-black text-base sm:text-lg tracking-widest uppercase rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-black shadow-[0_0_40px_rgba(0,245,212,0.5)] hover:shadow-[0_0_60px_rgba(0,245,212,0.8)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current text-black group-hover:translate-x-0.5 transition-transform" />
            <span>PLAY NOW</span>
          </button>

          {/* Single Flat Control-Hint Line per Core Game Guidelines */}
          <div className="text-[11px] sm:text-xs font-mono font-medium tracking-wider text-white/60 bg-black/40 border border-white/5 px-4 py-1.5 rounded-full">
            WASD / Swipes Move · Space Jump · S Slide · Shift Dash · Esc Pause
          </div>
        </div>
      </div>

      {/* Unified Bottom Control Dock (Zero Viewport Occlusion & Collapsible per Guidelines) */}
      <div className="w-full flex flex-col items-center z-20 pointer-events-auto">
        {/* Collapsible Zen/Cinema Mode Toggle */}
        <button
          onClick={() => setIsDockCollapsed(!isDockCollapsed)}
          className="mb-1.5 text-[11px] font-semibold tracking-wider text-white/50 hover:text-white bg-black/70 border border-white/10 px-3 py-1 rounded-t-lg transition flex items-center gap-1.5"
        >
          <span>{isDockCollapsed ? '▴ Show Navigation Dock' : '▾ Cinema Mode (Hide Dock)'}</span>
        </button>

        {/* Bottom Dock Menu Bar */}
        <div
          className={`w-full max-w-4xl bg-black/80 border border-white/10 rounded-2xl p-2 sm:p-2.5 shadow-2xl transition-all duration-300 ${
            isDockCollapsed ? 'translate-y-28 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
          }`}
        >
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 sm:gap-2">
            {/* 1. Modes */}
            <button
              onClick={() => onOpenModal('modes')}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 hover:border-cyan-500/40 border border-transparent transition text-center group"
            >
              <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-[10px] font-bold tracking-tight text-white/90">MODES</span>
            </button>

            {/* 2. Character Locker */}
            <button
              onClick={() => onOpenModal('locker')}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 hover:border-purple-500/40 border border-transparent transition text-center group"
            >
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-[10px] font-bold tracking-tight text-white/90">LOCKER</span>
            </button>

            {/* 3. Daily Rewards */}
            <button
              onClick={() => onOpenModal('rewards')}
              className="relative flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 hover:border-yellow-500/40 border border-transparent transition text-center group"
            >
              {canClaimDailyReward && (
                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-yellow-400" />
              )}
              <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-[10px] font-bold tracking-tight text-white/90">REWARDS</span>
            </button>

            {/* 4. Missions */}
            <button
              onClick={() => onOpenModal('missions')}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 hover:border-emerald-500/40 border border-transparent transition text-center group"
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-[10px] font-bold tracking-tight text-white/90">QUESTS</span>
            </button>

            {/* 5. Shop & Chests */}
            <button
              onClick={() => onOpenModal('shop')}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 hover:border-pink-500/40 border border-transparent transition text-center group"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-[10px] font-bold tracking-tight text-white/90">CHESTS</span>
            </button>

            {/* 6. Leaderboards */}
            <button
              onClick={() => onOpenModal('leaderboard')}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 hover:border-amber-500/40 border border-transparent transition text-center group"
            >
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-[10px] font-bold tracking-tight text-white/90">RANKS</span>
            </button>

            {/* 7. Android APK & Install Hub */}
            <button
              onClick={() => onOpenModal('android')}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition text-center group"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-[10px] font-bold tracking-tight text-emerald-300">APK / APP</span>
            </button>

            {/* 8. Settings */}
            <button
              onClick={() => onOpenModal('settings')}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 hover:border-gray-400/40 border border-transparent transition text-center group"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-[10px] font-bold tracking-tight text-white/90">SETTINGS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
