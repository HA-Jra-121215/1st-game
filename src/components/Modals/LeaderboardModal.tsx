import React, { useState } from 'react';
import { Award, Crown, Medal, Trophy, X } from 'lucide-react';
import { GameMode } from '../../types/game';
import { SaveData } from '../../game/meta/gameStorage';
import { soundEngine } from '../../audio/soundEngine';

interface LeaderboardModalProps {
  saveData: SaveData;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ saveData, onClose }) => {
  const [filterMode, setFilterMode] = useState<GameMode>('survival');

  const dummyTopRunners = [
    { rank: 1, name: 'VortexGhost', score: 148500, dist: 3820, skin: 'Nyx', badge: '🥇' },
    { rank: 2, name: 'CyberBlade_99', score: 112400, dist: 2940, skin: 'Vesper', badge: '🥈' },
    { rank: 3, name: 'IgnisKing', score: 95800, dist: 2410, skin: 'Ignis', badge: '🥉' },
    { rank: 4, name: 'ShadowStriker', score: 78900, dist: 1980, skin: 'Kael', badge: '4' },
    { rank: 5, name: 'ZenMonk', score: 62400, dist: 1650, skin: 'Sora', badge: '5' },
  ];

  const playerScore = saveData.highScores[filterMode] || 0;
  const playerDist = saveData.bestDistances[filterMode] || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-none animate-fade-in font-sans">
      <div className="w-full max-w-lg bg-[#0c101d] border border-amber-500/30 rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(245,158,11,0.15)] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-wider uppercase text-white">
                LEADERBOARDS
              </h2>
              <p className="text-xs text-white/50">Global high-score runner rankings</p>
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

        {/* Mode filter pills */}
        <div className="flex items-center gap-1.5 my-3 bg-black/40 p-1 rounded-xl border border-white/5 overflow-x-auto">
          {(['survival', 'story', 'time_attack', 'boss_challenge'] as GameMode[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                soundEngine.playButtonClick();
                setFilterMode(m);
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition whitespace-nowrap ${
                filterMode === m ? 'bg-amber-500 text-black font-black' : 'text-white/60 hover:text-white'
              }`}
            >
              {m.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Player personal best card */}
        <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20 border border-amber-400/40 p-3.5 rounded-2xl mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 flex items-center justify-center font-bold text-amber-300 text-xs">
              YOU
            </div>
            <div>
              <div className="text-xs font-black text-white">Your Best Record</div>
              <div className="text-[10px] text-amber-300 font-mono">Distance: {playerDist}m</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-black font-mono text-white tabular-nums">
              {playerScore.toLocaleString()} PTS
            </div>
          </div>
        </div>

        {/* Global Ranks List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {dummyTopRunners.map((runner) => (
            <div
              key={runner.rank}
              className="bg-black/40 border border-white/5 p-3 rounded-xl flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-center font-black text-white/80">{runner.badge}</span>
                <div>
                  <div className="font-bold text-white tracking-wide">{runner.name}</div>
                  <div className="text-[10px] text-white/40">
                    Hero: {runner.skin} · {runner.dist}m
                  </div>
                </div>
              </div>
              <div className="font-mono font-bold text-amber-300 tabular-nums">
                {runner.score.toLocaleString()} PTS
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
