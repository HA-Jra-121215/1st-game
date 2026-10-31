import React, { useState } from 'react';
import { Award, Check, Gift, Sparkles, Trophy, X, Zap } from 'lucide-react';
import { Achievement, DailyMission } from '../../types/game';
import { SaveData } from '../../game/meta/gameStorage';
import { soundEngine } from '../../audio/soundEngine';

interface MissionsModalProps {
  saveData: SaveData;
  onClaimMission: (missionId: string) => void;
  onClaimAchievement: (achievementId: string) => void;
  onClose: () => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  saveData,
  onClaimMission,
  onClaimAchievement,
  onClose,
}) => {
  const [tab, setTab] = useState<'daily' | 'achievements'>('daily');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-none animate-fade-in font-sans">
      <div className="w-full max-w-xl bg-[#0c101d] border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Zap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-wider uppercase text-white">
                QUESTS & TRIALS
              </h2>
              <p className="text-xs text-white/50">Complete challenges to earn rare resources</p>
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

        {/* Tab switch */}
        <div className="flex items-center gap-2 mt-4 mb-4 bg-black/50 p-1 rounded-2xl border border-white/5">
          <button
            onClick={() => setTab('daily')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
              tab === 'daily'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Daily Missions
          </button>

          <button
            onClick={() => setTab('achievements')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
              tab === 'achievements'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Achievements
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {tab === 'daily' ? (
            saveData.missions.map((m) => {
              const isReady = m.current >= m.goal && !m.claimed;
              const progressPct = Math.min(100, (m.current / m.goal) * 100);

              return (
                <div
                  key={m.id}
                  className="bg-black/40 border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="text-xs font-bold text-white mb-1.5">{m.description}</div>
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[10px] font-mono text-white/50">
                      <span>
                        {m.current} / {m.goal}
                      </span>
                      <span className="text-yellow-400 font-bold">
                        +{m.rewardAmount} {m.rewardType.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div>
                    {m.claimed ? (
                      <span className="text-xs font-bold text-white/40 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        CLAIMED
                      </span>
                    ) : isReady ? (
                      <button
                        onClick={() => {
                          soundEngine.playCoin();
                          onClaimMission(m.id);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-pulse"
                      >
                        CLAIM
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-white/30">IN PROGRESS</span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            saveData.achievements.map((a) => {
              const isReady = a.completed && !a.claimed;
              const pct = Math.min(100, (a.progress / a.maxProgress) * 100);

              return (
                <div
                  key={a.id}
                  className="bg-black/40 border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-white">{a.title}</span>
                    </div>
                    <div className="text-[11px] text-white/50 mb-1.5">{a.description}</div>
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[10px] font-mono text-white/50">
                      <span>
                        {a.progress} / {a.maxProgress}
                      </span>
                      <span className="text-pink-400 font-bold">+{a.rewardDiamonds} DIAMONDS</span>
                    </div>
                  </div>

                  <div>
                    {a.claimed ? (
                      <span className="text-xs font-bold text-white/40 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        CLAIMED
                      </span>
                    ) : isReady ? (
                      <button
                        onClick={() => {
                          soundEngine.playDiamond();
                          onClaimAchievement(a.id);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(236,72,153,0.4)] animate-pulse"
                      >
                        CLAIM
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-white/30">LOCKED</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
