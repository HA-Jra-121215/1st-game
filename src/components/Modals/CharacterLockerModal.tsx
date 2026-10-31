import React, { useState } from 'react';
import { Check, Lock, Shield, Sparkles, X, Zap } from 'lucide-react';
import { CharacterSkin, PlayerStats } from '../../types/game';
import { CHARACTER_SKINS, SaveData } from '../../game/meta/gameStorage';
import { soundEngine } from '../../audio/soundEngine';

interface CharacterLockerModalProps {
  saveData: SaveData;
  selectedSkinId: string;
  onSelectSkin: (skinId: string) => void;
  onUnlockSkin: (skin: CharacterSkin) => void;
  onUpgradeStat: (statKey: keyof PlayerStats) => void;
  onClose: () => void;
}

export const CharacterLockerModal: React.FC<CharacterLockerModalProps> = ({
  saveData,
  selectedSkinId,
  onSelectSkin,
  onUnlockSkin,
  onUpgradeStat,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'characters' | 'upgrades'>('characters');
  const [previewSkinId, setPreviewSkinId] = useState<string>(selectedSkinId);

  const previewSkin = CHARACTER_SKINS.find((s) => s.id === previewSkinId) || CHARACTER_SKINS[0];
  const isUnlocked = saveData.unlockedSkins.includes(previewSkin.id);
  const isSelected = selectedSkinId === previewSkin.id;

  // Upgrade costs
  const getUpgradeCost = (lvl: number) => lvl * 250;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-none animate-fade-in font-sans">
      <div className="w-full max-w-2xl bg-[#0c101d] border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-wider uppercase text-white">
                CHARACTER LOCKER
              </h2>
              <p className="text-xs text-white/50">Equip skins & enhance permanent attributes</p>
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

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-4 mb-4 bg-black/50 p-1 rounded-2xl border border-white/5">
          <button
            onClick={() => setActiveTab('characters')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'characters'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Skins ({saveData.unlockedSkins.length}/{CHARACTER_SKINS.length})
          </button>

          <button
            onClick={() => setActiveTab('upgrades')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'upgrades'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Upgrades & Perks
          </button>
        </div>

        {/* Tab 1: Characters */}
        {activeTab === 'characters' ? (
          <div className="flex-1 overflow-y-auto flex flex-col md:flex-row gap-5 pr-1">
            {/* Skin Selector Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 flex-1 content-start">
              {CHARACTER_SKINS.map((skin) => {
                const unlocked = saveData.unlockedSkins.includes(skin.id);
                const isCurrent = skin.id === previewSkinId;
                const isEquipped = skin.id === selectedSkinId;

                return (
                  <button
                    key={skin.id}
                    onClick={() => {
                      soundEngine.playButtonClick();
                      setPreviewSkinId(skin.id);
                    }}
                    className={`relative p-3 rounded-2xl border text-left transition-all duration-150 flex flex-col items-center justify-center gap-2 group cursor-pointer ${
                      isCurrent
                        ? 'bg-purple-500/20 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                        : 'bg-black/40 border-white/10 hover:border-white/30'
                    }`}
                  >
                    {/* Equipped Badge */}
                    {isEquipped && (
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono text-[9px] font-bold">
                        ACTIVE
                      </span>
                    )}

                    {!unlocked && (
                      <div className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white/50">
                        <Lock className="w-3 h-3" />
                      </div>
                    )}

                    {/* Character Avatar Icon */}
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg border"
                      style={{
                        backgroundColor: skin.colors.suit
                          ? `#${skin.colors.suit.toString(16).padStart(6, '0')}`
                          : '#111827',
                        borderColor: skin.colors.glow,
                        color: skin.colors.glow,
                      }}
                    >
                      {skin.name[0]}
                    </div>

                    <div className="text-center w-full">
                      <div className="text-xs font-bold text-white tracking-wide truncate">
                        {skin.name}
                      </div>
                      <div className="text-[10px] text-white/50 truncate">{skin.rarity}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Skin Detail Panel */}
            <div className="w-full md:w-64 bg-black/50 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 uppercase tracking-widest">
                    {previewSkin.rarity}
                  </span>
                  <span className="text-xs font-mono font-bold text-white/60">
                    {previewSkin.bonusStat.label}
                  </span>
                </div>

                <h3 className="text-lg font-black text-white">{previewSkin.name}</h3>
                <div className="text-xs text-purple-400 font-semibold mb-2">
                  {previewSkin.title}
                </div>
                <p className="text-xs text-white/60 leading-relaxed mb-4">
                  {previewSkin.description}
                </p>

                {/* Trait Box */}
                <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl text-xs mb-4">
                  <div className="text-[10px] font-bold text-white/40 uppercase mb-0.5">
                    PASSIVE TRAIT
                  </div>
                  <div className="text-emerald-400 font-bold">{previewSkin.bonusStat.value}</div>
                </div>
              </div>

              {/* Action Button: Equip or Unlock */}
              {isUnlocked ? (
                <button
                  onClick={() => {
                    soundEngine.playButtonClick();
                    onSelectSkin(previewSkin.id);
                  }}
                  disabled={isSelected}
                  className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>EQUIPPED</span>
                    </>
                  ) : (
                    <span>EQUIP HERO</span>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => {
                    soundEngine.playButtonClick();
                    onUnlockSkin(previewSkin);
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer"
                >
                  <span>UNLOCK</span>
                  {previewSkin.costCoins > 0 && <span>({previewSkin.costCoins} ●)</span>}
                  {previewSkin.costDiamonds > 0 && <span>({previewSkin.costDiamonds} ◆)</span>}
                  {previewSkin.costKeys > 0 && <span>({previewSkin.costKeys} 🗝)</span>}
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Tab 2: Upgrades */
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {/* Speed Upgrade */}
            <div className="bg-black/50 border border-white/10 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold text-white">Base Sprint & Agility</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                    LVL {saveData.playerStats.speedLevel}/5
                  </span>
                </div>
                <div className="text-xs text-white/50">
                  Increases base forward velocity and rapid lane dodge transition speed (+6% per lvl).
                </div>
              </div>
              <button
                onClick={() => onUpgradeStat('speedLevel')}
                disabled={saveData.playerStats.speedLevel >= 5 || saveData.coins < getUpgradeCost(saveData.playerStats.speedLevel)}
                className="ml-3 px-3 py-2 rounded-xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 font-mono text-xs font-bold hover:bg-yellow-500/30 disabled:opacity-40 disabled:pointer-events-none transition"
              >
                {saveData.playerStats.speedLevel >= 5 ? 'MAX' : `${getUpgradeCost(saveData.playerStats.speedLevel)} ●`}
              </button>
            </div>

            {/* Magnet Upgrade */}
            <div className="bg-black/50 border border-white/10 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-yellow-400">🧲</span>
                  <span className="text-sm font-bold text-white">Quantum Magnet Range</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 font-mono font-bold">
                    LVL {saveData.playerStats.magnetLevel}/5
                  </span>
                </div>
                <div className="text-xs text-white/50">
                  Expands the gravitational suction radius for gold coins and diamonds.
                </div>
              </div>
              <button
                onClick={() => onUpgradeStat('magnetLevel')}
                disabled={saveData.playerStats.magnetLevel >= 5 || saveData.coins < getUpgradeCost(saveData.playerStats.magnetLevel)}
                className="ml-3 px-3 py-2 rounded-xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 font-mono text-xs font-bold hover:bg-yellow-500/30 disabled:opacity-40 disabled:pointer-events-none transition"
              >
                {saveData.playerStats.magnetLevel >= 5 ? 'MAX' : `${getUpgradeCost(saveData.playerStats.magnetLevel)} ●`}
              </button>
            </div>

            {/* Shield Upgrade */}
            <div className="bg-black/50 border border-white/10 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-bold text-white">Kinetic Shield Barrier</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono font-bold">
                    LVL {saveData.playerStats.shieldLevel}/5
                  </span>
                </div>
                <div className="text-xs text-white/50">
                  Fortifies kinetic shields and prolongs post-hit invulnerability recovery.
                </div>
              </div>
              <button
                onClick={() => onUpgradeStat('shieldLevel')}
                disabled={saveData.playerStats.shieldLevel >= 5 || saveData.coins < getUpgradeCost(saveData.playerStats.shieldLevel)}
                className="ml-3 px-3 py-2 rounded-xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 font-mono text-xs font-bold hover:bg-yellow-500/30 disabled:opacity-40 disabled:pointer-events-none transition"
              >
                {saveData.playerStats.shieldLevel >= 5 ? 'MAX' : `${getUpgradeCost(saveData.playerStats.shieldLevel)} ●`}
              </button>
            </div>

            {/* Multiplier Upgrade */}
            <div className="bg-black/50 border border-white/10 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-pink-400">★</span>
                  <span className="text-sm font-bold text-white">Score & Wealth Multiplier</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-pink-500/20 text-pink-400 font-mono font-bold">
                    LVL {saveData.playerStats.multiplierLevel}/5
                  </span>
                </div>
                <div className="text-xs text-white/50">
                  Amplifies base score gain and bonus gold from all runs (+0.25x per lvl).
                </div>
              </div>
              <button
                onClick={() => onUpgradeStat('multiplierLevel')}
                disabled={saveData.playerStats.multiplierLevel >= 5 || saveData.coins < getUpgradeCost(saveData.playerStats.multiplierLevel)}
                className="ml-3 px-3 py-2 rounded-xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 font-mono text-xs font-bold hover:bg-yellow-500/30 disabled:opacity-40 disabled:pointer-events-none transition"
              >
                {saveData.playerStats.multiplierLevel >= 5 ? 'MAX' : `${getUpgradeCost(saveData.playerStats.multiplierLevel)} ●`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
