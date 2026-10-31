import React from 'react';
import { Compass, Flame, ShieldAlert, Sparkles, Timer, Trophy, X, Zap } from 'lucide-react';
import { GameMode, WorldTheme } from '../../types/game';
import { SaveData, WORLD_CONFIGS } from '../../game/meta/gameStorage';
import { soundEngine } from '../../audio/soundEngine';

interface ModesModalProps {
  saveData: SaveData;
  selectedMode: GameMode;
  selectedWorld: WorldTheme;
  onSelectModeAndWorld: (mode: GameMode, world: WorldTheme) => void;
  onClose: () => void;
}

export const ModesModal: React.FC<ModesModalProps> = ({
  saveData,
  selectedMode,
  selectedWorld,
  onSelectModeAndWorld,
  onClose,
}) => {
  const modes: {
    id: GameMode;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    bestScore: number;
    bestDist: number;
  }[] = [
    {
      id: 'story',
      title: 'Story Mode',
      description: 'Journey across 5 mystifying world acts, avoid perils, and overcome the Titan Overlords.',
      icon: <Compass className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/30',
      bestScore: saveData.highScores.story,
      bestDist: saveData.bestDistances.story,
    },
    {
      id: 'survival',
      title: 'Endless Survival',
      description: 'Infinite procedural run with ever-increasing speed, hazard density, and combo multiplier scoring.',
      icon: <Zap className="w-5 h-5 text-cyan-400" />,
      color: 'border-cyan-500/30',
      bestScore: saveData.highScores.survival,
      bestDist: saveData.bestDistances.survival,
    },
    {
      id: 'time_attack',
      title: 'Time Attack',
      description: 'Race against the ticking clock! Collect green chrono gates to extend your survival time.',
      icon: <Timer className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-500/30',
      bestScore: saveData.highScores.time_attack,
      bestDist: saveData.bestDistances.time_attack,
    },
    {
      id: 'boss_challenge',
      title: 'Boss Challenge',
      description: 'Face off directly against the Obsidian Golem and colossal Titans with attack dodge cycles.',
      icon: <ShieldAlert className="w-5 h-5 text-red-400" />,
      color: 'border-red-500/30',
      bestScore: saveData.highScores.boss_challenge,
      bestDist: saveData.bestDistances.boss_challenge,
    },
    {
      id: 'daily_challenge',
      title: 'Daily Challenge',
      description: 'Daily curated trial with unique run mutators: Double Speed, Coin Storm, and Low Gravity.',
      icon: <Flame className="w-5 h-5 text-purple-400" />,
      color: 'border-purple-500/30',
      bestScore: saveData.highScores.daily_challenge,
      bestDist: saveData.bestDistances.daily_challenge,
    },
  ];

  const worlds: WorldTheme[] = ['forest', 'cyber', 'temple', 'lava', 'abyss'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-none animate-fade-in font-sans">
      <div className="w-full max-w-xl bg-[#0c101d] border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <Compass className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-wider uppercase text-white">
                SELECT GAME MODE
              </h2>
              <p className="text-xs text-white/50">Pick your trial and test your survival reflexes</p>
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

        {/* World Selection Pill Row */}
        <div className="mt-4 mb-2">
          <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">
            CHOOSE WORLD REALM
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {worlds.map((wId) => {
              const cfg = WORLD_CONFIGS[wId];
              const isSelected = selectedWorld === wId;
              return (
                <button
                  key={wId}
                  onClick={() => {
                    soundEngine.playButtonClick();
                    onSelectModeAndWorld(selectedMode, wId);
                  }}
                  className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                    isSelected
                      ? 'bg-white/15 border-white shadow-lg'
                      : 'bg-black/40 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full mx-auto mb-1"
                    style={{ backgroundColor: cfg.primaryColor }}
                  />
                  <div className="text-[10px] font-bold text-white truncate capitalize">
                    {wId}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mode List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 mt-3">
          {modes.map((m) => {
            const isSelected = selectedMode === m.id;

            return (
              <button
                key={m.id}
                onClick={() => {
                  soundEngine.playButtonClick();
                  onSelectModeAndWorld(m.id, selectedWorld);
                  onClose();
                }}
                className={`w-full p-4 rounded-2xl border text-left flex items-start gap-4 transition cursor-pointer ${
                  isSelected
                    ? `bg-white/10 ${m.color} shadow-lg`
                    : 'bg-black/40 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-black/60 border border-white/10">
                  {m.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-black text-white">{m.title}</span>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">
                      BEST: {m.bestDist}m
                    </span>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">{m.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
