import React from 'react';
import confetti from 'canvas-confetti';
import { Check, Flame, Gift, Sparkles, X } from 'lucide-react';
import { DAILY_REWARDS_TABLE, SaveData } from '../../game/meta/gameStorage';
import { soundEngine } from '../../audio/soundEngine';

interface DailyRewardsModalProps {
  saveData: SaveData;
  canClaim: boolean;
  onClaim: () => void;
  onClose: () => void;
}

export const DailyRewardsModal: React.FC<DailyRewardsModalProps> = ({
  saveData,
  canClaim,
  onClaim,
  onClose,
}) => {
  const currentStreakDay = saveData.dailyStreak;

  const handleClaimReward = () => {
    soundEngine.playChestOpen();
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // fallback
    }
    onClaim();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-none animate-fade-in font-sans">
      <div className="w-full max-w-xl bg-[#0d101d] border border-yellow-500/30 rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(234,179,8,0.15)] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center">
              <Gift className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-wider uppercase text-white">
                DAILY LOGIN STREAK
              </h2>
              <p className="text-xs text-white/50">Return daily to unlock legendary treasures</p>
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

        {/* Current Streak indicator */}
        <div className="flex items-center justify-between bg-black/40 border border-white/5 p-3 rounded-2xl my-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400 fill-current" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              CURRENT STREAK:
            </span>
          </div>
          <span className="text-sm font-black font-mono text-orange-400">
            DAY {currentStreakDay} OF 7
          </span>
        </div>

        {/* 7-Day Rewards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-auto">
          {DAILY_REWARDS_TABLE.map((item) => {
            const isPast = item.day < currentStreakDay;
            const isToday = item.day === currentStreakDay;
            const isFuture = item.day > currentStreakDay;

            return (
              <div
                key={item.day}
                className={`p-3 rounded-2xl border flex flex-col items-center text-center justify-between relative transition ${
                  isToday
                    ? 'bg-yellow-500/20 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.3)]'
                    : isPast
                    ? 'bg-black/30 border-white/5 opacity-60'
                    : 'bg-black/40 border-white/5'
                } ${item.day === 7 ? 'col-span-2 sm:col-span-2' : ''}`}
              >
                {/* Day Badge */}
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1">
                  Day {item.day}
                </div>

                {/* Icon */}
                <div className="my-2">
                  {item.type === 'coins' && <span className="text-2xl">🪙</span>}
                  {item.type === 'diamonds' && <span className="text-2xl">💎</span>}
                  {item.type === 'key' && <span className="text-2xl">🗝️</span>}
                  {item.type === 'chest' && <span className="text-2xl">🎁</span>}
                  {item.type === 'skin' && <span className="text-3xl">👑</span>}
                </div>

                <div className="text-xs font-black text-white">{item.label}</div>

                {isPast && (
                  <span className="mt-1 flex items-center gap-1 text-[9px] font-bold text-emerald-400">
                    <Check className="w-3 h-3" /> CLAIMED
                  </span>
                )}
                {isToday && !canClaim && (
                  <span className="mt-1 text-[9px] font-bold text-yellow-400">CLAIMED TODAY</span>
                )}
                {isFuture && (
                  <span className="mt-1 text-[9px] font-bold text-white/40">LOCKED</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Claim Action */}
        <div className="mt-5">
          <button
            onClick={handleClaimReward}
            disabled={!canClaim}
            className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition ${
              canClaim
                ? 'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-black shadow-[0_0_25px_rgba(250,204,21,0.4)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                : 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>{canClaim ? 'CLAIM TODAY\'S REWARD' : 'ALREADY CLAIMED TODAY'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
