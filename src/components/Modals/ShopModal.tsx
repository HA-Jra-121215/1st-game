import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Box, Key, Package, ShoppingBag, Sparkles, X } from 'lucide-react';
import { SaveData } from '../../game/meta/gameStorage';
import { soundEngine } from '../../audio/soundEngine';

interface ShopModalProps {
  saveData: SaveData;
  onOpenMysteryChest: (costType: 'key' | 'coins') => { rewardText: string; coins: number; diamonds: number; keys: number } | null;
  onBuyItem: (cost: { coins?: number; diamonds?: number }, reward: { coins?: number; diamonds?: number; keys?: number }) => boolean;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  saveData,
  onOpenMysteryChest,
  onBuyItem,
  onClose,
}) => {
  const [unboxingResult, setUnboxingResult] = useState<string | null>(null);

  const handleOpenChest = (costType: 'key' | 'coins') => {
    const res = onOpenMysteryChest(costType);
    if (res) {
      soundEngine.playChestOpen();
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.5 },
        });
      } catch {
        // fallback
      }
      setUnboxingResult(res.rewardText);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-none animate-fade-in font-sans">
      <div className="w-full max-w-xl bg-[#0d101d] border border-pink-500/30 rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(236,72,153,0.15)] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-wider uppercase text-white">
                MYSTERY SHOP & CHESTS
              </h2>
              <p className="text-xs text-white/50">Unbox rare treasures and stock up on supplies</p>
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

        {/* Unboxing Reward Banner */}
        {unboxingResult && (
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 border border-pink-400/50 flex items-center justify-between animate-bounce">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              <div>
                <div className="text-[10px] font-bold text-pink-300 uppercase tracking-wider">
                  CHEST UNLOCKED!
                </div>
                <div className="text-sm font-black text-white">{unboxingResult}</div>
              </div>
            </div>
            <button
              onClick={() => setUnboxingResult(null)}
              className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition"
            >
              OK
            </button>
          </div>
        )}

        {/* Content list */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 mt-4">
          {/* Mystery Chest Section */}
          <div className="bg-gradient-to-br from-pink-950/30 to-purple-950/30 border border-pink-500/30 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-4xl shadow-inner">
              🎁
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-sm font-black text-white tracking-wide">ANCIENT MYSTERY CHEST</h3>
              <p className="text-xs text-white/50 mb-3">
                Contains randomized bags of gold coins (200-800), diamonds (5-20), or extra keys!
              </p>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <button
                  onClick={() => handleOpenChest('key')}
                  disabled={saveData.keys < 1}
                  className="px-3 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 transition cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>1 KEY (Have: {saveData.keys})</span>
                </button>

                <button
                  onClick={() => handleOpenChest('coins')}
                  disabled={saveData.coins < 250}
                  className="px-3 py-2 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/40 text-yellow-300 text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 transition cursor-pointer"
                >
                  <span>250 COINS</span>
                </button>
              </div>
            </div>
          </div>

          {/* Currency Bundles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1000 Coins */}
            <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-xs font-black text-white">Sack of 1,000 Coins</div>
                <div className="text-[11px] text-white/50">Instant gold infusion</div>
              </div>
              <button
                onClick={() => onBuyItem({ diamonds: 10 }, { coins: 1000 })}
                disabled={saveData.diamonds < 10}
                className="px-3 py-1.5 rounded-xl bg-pink-500/20 border border-pink-500/40 text-pink-300 font-mono text-xs font-bold hover:bg-pink-500/30 disabled:opacity-40 transition"
              >
                10 ◆
              </button>
            </div>

            {/* 3 Ancient Keys */}
            <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-xs font-black text-white">Bundle of 3 Keys</div>
                <div className="text-[11px] text-white/50">For chests and revives</div>
              </div>
              <button
                onClick={() => onBuyItem({ diamonds: 15 }, { keys: 3 })}
                disabled={saveData.diamonds < 15}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold hover:bg-cyan-500/30 disabled:opacity-40 transition"
              >
                15 ◆
              </button>
            </div>

            {/* 25 Diamonds */}
            <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-xs font-black text-white">Cache of 25 Diamonds</div>
                <div className="text-[11px] text-white/50">Converted from run gold</div>
              </div>
              <button
                onClick={() => onBuyItem({ coins: 1200 }, { diamonds: 25 })}
                disabled={saveData.coins < 1200}
                className="px-3 py-1.5 rounded-xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 font-mono text-xs font-bold hover:bg-yellow-500/30 disabled:opacity-40 transition"
              >
                1,200 ●
              </button>
            </div>

            {/* Ultimate Pack */}
            <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-xs font-black text-white">Adventurer Supply Crate</div>
                <div className="text-[11px] text-white/50">500 Coins + 5 Keys</div>
              </div>
              <button
                onClick={() => onBuyItem({ diamonds: 20 }, { coins: 500, keys: 5 })}
                disabled={saveData.diamonds < 20}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold hover:bg-emerald-500/30 disabled:opacity-40 transition"
              >
                20 ◆
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
