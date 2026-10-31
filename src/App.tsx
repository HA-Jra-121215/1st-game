import React, { useEffect, useRef, useState } from 'react';
import { soundEngine } from './audio/soundEngine';
import { AndroidApkModal } from './components/Modals/AndroidApkModal';
import { CharacterLockerModal } from './components/Modals/CharacterLockerModal';
import { DailyRewardsModal } from './components/Modals/DailyRewardsModal';
import { GameOverModal } from './components/Modals/GameOverModal';
import { LeaderboardModal } from './components/Modals/LeaderboardModal';
import { MissionsModal } from './components/Modals/MissionsModal';
import { ModesModal } from './components/Modals/ModesModal';
import { PauseModal } from './components/Modals/PauseModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import { ShopModal } from './components/Modals/ShopModal';
import { VictoryModal } from './components/Modals/VictoryModal';
import { HUDOverlay } from './components/HUDOverlay';
import { TitleScreen } from './components/TitleScreen';
import {
  CHARACTER_SKINS,
  DAILY_REWARDS_TABLE,
  loadSaveData,
  processDailyLogin,
  recordRunStats,
  saveGameData,
  SaveData,
} from './game/meta/gameStorage';
import { GameEngine } from './game/three/GameEngine';
import {
  ActivePowerUps,
  CharacterSkin,
  GameMode,
  GameRunStats,
  GameState,
  PlayerStats,
  WorldTheme,
} from './types/game';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Game & Meta States
  const [saveData, setSaveData] = useState<SaveData>(() => loadSaveData());
  const [gameState, setGameState] = useState<GameState>('title');
  const [selectedWorld, setSelectedWorld] = useState<WorldTheme>('forest');
  const [selectedMode, setSelectedMode] = useState<GameMode>('story');
  const [canClaimDaily, setCanClaimDaily] = useState<boolean>(false);

  // Active Run Readouts
  const [runStats, setRunStats] = useState<GameRunStats>({
    score: 0,
    distance: 0,
    coins: 0,
    diamonds: 0,
    keys: 0,
    mysteryChests: 0,
    obstaclesDodged: 0,
    bossDefeated: false,
    combos: 0,
    maxCombo: 0,
  });

  const [powerUps, setPowerUps] = useState<ActivePowerUps>({
    speedBoost: 0,
    shield: 0,
    magnet: 0,
    doubleCoins: 0,
    phaseShift: 0,
  });

  const [bossHp, setBossHp] = useState<{ current: number; max: number } | undefined>(undefined);
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);

  // Active Modal
  const [activeModal, setActiveModal] = useState<
    | null
    | 'locker'
    | 'missions'
    | 'rewards'
    | 'shop'
    | 'leaderboard'
    | 'settings'
    | 'android'
    | 'modes'
  >(null);

  // PWA Install prompt state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const selectedSkin =
    CHARACTER_SKINS.find((s) => s.id === saveData.selectedSkinId) || CHARACTER_SKINS[0];

  // 1. Process Daily Login & Service Worker Registration
  useEffect(() => {
    const { updated, canClaim } = processDailyLogin(saveData);
    setSaveData(updated);
    setCanClaimDaily(canClaim);

    // Register offline PWA service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('Service Worker Registered'))
        .catch((err) => console.log('SW registration note:', err));
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  // 2. Initialize Three.js Game Engine inside isolated container
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const engine = new GameEngine(
      canvasMountRef.current,
      {
        onStatsUpdate: (stats, activePowers, bossHealth) => {
          setRunStats({ ...stats });
          setPowerUps({ ...activePowers });
          setBossHp(bossHealth);
        },
        onGameOver: (finalStats) => {
          setGameState('gameover');
          setRunStats({ ...finalStats });
          setSaveData((prev) => {
            const { updated, isNewHighScore: isNewHigh } = recordRunStats(prev, selectedMode, finalStats);
            setIsNewHighScore(isNewHigh);
            return updated;
          });
        },
        onVictory: (finalStats) => {
          setGameState('victory');
          setRunStats({ ...finalStats });
          setSaveData((prev) => {
            const { updated } = recordRunStats(prev, selectedMode, finalStats);
            return updated;
          });
        },
        onSecretRoomEntered: () => {
          // Handled visually inside engine
        },
      },
      selectedSkin,
      saveData.playerStats,
      selectedWorld,
      selectedMode
    );

    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Update skin or world on engine if changed
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.loadCharacter(selectedSkin);
      engineRef.current.playerStats = saveData.playerStats;
    }
  }, [selectedSkin, saveData.playerStats]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setWorldTheme(selectedWorld);
      engineRef.current.setGameMode(selectedMode);
    }
  }, [selectedWorld, selectedMode]);

  // 3. Global Keyboard Controls & Touch Swipe Gestures
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!engineRef.current) return;

      if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        engineRef.current.moveLeft();
      } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        engineRef.current.moveRight();
      } else if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
        if (gameState === 'title') {
          handleStartGame();
        } else if (gameState === 'playing') {
          engineRef.current.jump();
        }
      } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        if (gameState === 'playing') {
          engineRef.current.slide();
        }
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyE') {
        if (gameState === 'playing') {
          engineRef.current.dash();
        }
      } else if (e.code === 'Escape' || e.code === 'KeyP') {
        if (gameState === 'playing') {
          engineRef.current.pause();
          setGameState('paused');
        } else if (gameState === 'paused') {
          engineRef.current.resume();
          setGameState('playing');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState]);

  // Viewport Touch Swipe Detection
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (gameState !== 'playing') return;
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartPos.current || !engineRef.current || gameState !== 'playing') return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartPos.current.x;
    const dy = touch.clientY - touchStartPos.current.y;
    touchStartPos.current = null;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) < 25) return; // Min swipe distance

    if (absDx > absDy) {
      // Horizontal swipe
      if (dx > 0) engineRef.current.moveRight();
      else engineRef.current.moveLeft();
    } else {
      // Vertical swipe
      if (dy < 0) engineRef.current.jump();
      else engineRef.current.slide();
    }
  };

  // --- ACTIONS ---

  const handleStartGame = () => {
    soundEngine.resume();
    if (engineRef.current) {
      engineRef.current.startRun();
      setGameState('playing');
    }
  };

  const handlePause = () => {
    if (engineRef.current && gameState === 'playing') {
      engineRef.current.pause();
      setGameState('paused');
    }
  };

  const handleResume = () => {
    if (engineRef.current && gameState === 'paused') {
      engineRef.current.resume();
      setGameState('playing');
    }
  };

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.startRun();
      setGameState('playing');
    }
  };

  const handleHome = () => {
    if (engineRef.current) {
      engineRef.current.stopLoop();
      engineRef.current.gameState = 'title';
      engineRef.current.startLoop();
      setGameState('title');
    }
  };

  const handleRevive = () => {
    if (!engineRef.current) return;
    if (saveData.keys >= 1) {
      const next = { ...saveData, keys: saveData.keys - 1 };
      setSaveData(next);
      saveGameData(next);
      engineRef.current.triggerRevive();
      setGameState('playing');
    } else if (saveData.diamonds >= 5) {
      const next = { ...saveData, diamonds: saveData.diamonds - 5 };
      setSaveData(next);
      saveGameData(next);
      engineRef.current.triggerRevive();
      setGameState('playing');
    }
  };

  const handleNextAct = () => {
    const actOrder: WorldTheme[] = ['forest', 'cyber', 'temple', 'lava', 'abyss'];
    const currIdx = actOrder.indexOf(selectedWorld);
    const nextWorld = actOrder[(currIdx + 1) % actOrder.length];
    setSelectedWorld(nextWorld);
    if (engineRef.current) {
      engineRef.current.setWorldTheme(nextWorld);
      engineRef.current.startRun();
      setGameState('playing');
    }
  };

  const handleSelectSkin = (skinId: string) => {
    const next = { ...saveData, selectedSkinId: skinId };
    setSaveData(next);
    saveGameData(next);
  };

  const handleUnlockSkin = (skin: CharacterSkin) => {
    if (
      saveData.coins >= skin.costCoins &&
      saveData.diamonds >= skin.costDiamonds &&
      saveData.keys >= skin.costKeys
    ) {
      const next = {
        ...saveData,
        coins: saveData.coins - skin.costCoins,
        diamonds: saveData.diamonds - skin.costDiamonds,
        keys: saveData.keys - skin.costKeys,
        unlockedSkins: [...saveData.unlockedSkins, skin.id],
        selectedSkinId: skin.id,
      };
      setSaveData(next);
      saveGameData(next);
      soundEngine.playChestOpen();
    }
  };

  const handleUpgradeStat = (statKey: keyof PlayerStats) => {
    const currentLvl = saveData.playerStats[statKey];
    const cost = currentLvl * 250;
    if (currentLvl < 5 && saveData.coins >= cost) {
      const next: SaveData = {
        ...saveData,
        coins: saveData.coins - cost,
        playerStats: {
          ...saveData.playerStats,
          [statKey]: currentLvl + 1,
        },
      };
      setSaveData(next);
      saveGameData(next);
      soundEngine.playPowerUp();
    }
  };

  const handleClaimDaily = () => {
    const rewardItem = DAILY_REWARDS_TABLE.find((r) => r.day === saveData.dailyStreak);
    if (!rewardItem) return;

    const next = { ...saveData, dailyRewardsClaimedToday: true };
    if (rewardItem.type === 'coins') next.coins += rewardItem.amount;
    else if (rewardItem.type === 'diamonds') next.diamonds += rewardItem.amount;
    else if (rewardItem.type === 'key') next.keys += rewardItem.amount;
    else if (rewardItem.type === 'chest') next.coins += 500;
    else if (rewardItem.type === 'skin' && rewardItem.skinId) {
      if (!next.unlockedSkins.includes(rewardItem.skinId)) {
        next.unlockedSkins.push(rewardItem.skinId);
      }
    }

    setSaveData(next);
    saveGameData(next);
    setCanClaimDaily(false);
  };

  const handleClaimMission = (mId: string) => {
    const next = { ...saveData };
    next.missions = next.missions.map((m) => {
      if (m.id === mId && !m.claimed && m.current >= m.goal) {
        if (m.rewardType === 'coins') next.coins += m.rewardAmount;
        if (m.rewardType === 'diamonds') next.diamonds += m.rewardAmount;
        if (m.rewardType === 'keys') next.keys += m.rewardAmount;
        return { ...m, claimed: true };
      }
      return m;
    });
    setSaveData(next);
    saveGameData(next);
  };

  const handleClaimAchievement = (aId: string) => {
    const next = { ...saveData };
    next.achievements = next.achievements.map((a) => {
      if (a.id === aId && !a.claimed && a.completed) {
        next.diamonds += a.rewardDiamonds;
        return { ...a, claimed: true };
      }
      return a;
    });
    setSaveData(next);
    saveGameData(next);
  };

  const handleOpenMysteryChest = (costType: 'key' | 'coins') => {
    if (costType === 'key' && saveData.keys < 1) return null;
    if (costType === 'coins' && saveData.coins < 250) return null;

    const next = { ...saveData };
    if (costType === 'key') next.keys -= 1;
    else next.coins -= 250;

    const rolledCoins = 300 + Math.floor(Math.random() * 500);
    const rolledDiamonds = 5 + Math.floor(Math.random() * 15);
    const rolledKeys = Math.random() < 0.35 ? 1 : 0;

    next.coins += rolledCoins;
    next.diamonds += rolledDiamonds;
    next.keys += rolledKeys;

    setSaveData(next);
    saveGameData(next);

    return {
      rewardText: `+${rolledCoins} Coins, +${rolledDiamonds} Diamonds${rolledKeys ? ', +1 Ancient Key!' : ''}`,
      coins: rolledCoins,
      diamonds: rolledDiamonds,
      keys: rolledKeys,
    };
  };

  const handleBuyItem = (
    cost: { coins?: number; diamonds?: number },
    reward: { coins?: number; diamonds?: number; keys?: number }
  ) => {
    if (cost.coins && saveData.coins < cost.coins) return false;
    if (cost.diamonds && saveData.diamonds < cost.diamonds) return false;

    const next = { ...saveData };
    if (cost.coins) next.coins -= cost.coins;
    if (cost.diamonds) next.diamonds -= cost.diamonds;

    if (reward.coins) next.coins += reward.coins;
    if (reward.diamonds) next.diamonds += reward.diamonds;
    if (reward.keys) next.keys += reward.keys;

    setSaveData(next);
    saveGameData(next);
    soundEngine.playCoin();
    return true;
  };

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert('To install on Android: Tap the 3 dots menu (⋮) in Chrome ➔ "Install app" or "Add to Home screen"!');
    }
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-[#06070d] touch-none select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Three.js Isolated Canvas Mount (Three.js Directive: Ref Container) */}
      <div ref={canvasMountRef} className="absolute inset-0 w-full h-full z-0 pointer-events-auto" />

      {/* GAME SHELL LAYOUT */}
      {/* 1. Title Screen */}
      {gameState === 'title' && (
        <TitleScreen
          saveData={saveData}
          selectedSkin={selectedSkin}
          selectedWorld={selectedWorld}
          selectedMode={selectedMode}
          onStartGame={handleStartGame}
          onOpenModal={(modal) => setActiveModal(modal)}
          onSelectWorld={(w) => setSelectedWorld(w)}
          canClaimDailyReward={canClaimDaily}
        />
      )}

      {/* 2. In-Game HUD Overlay */}
      {(gameState === 'playing' || gameState === 'secret_room') && (
        <HUDOverlay
          stats={runStats}
          powerUps={powerUps}
          bossHp={bossHp}
          mode={selectedMode}
          world={selectedWorld}
          touchControlMode={saveData.settings.touchControlMode}
          onMoveLeft={() => engineRef.current?.moveLeft()}
          onMoveRight={() => engineRef.current?.moveRight()}
          onJump={() => engineRef.current?.jump()}
          onSlide={() => engineRef.current?.slide()}
          onDash={() => engineRef.current?.dash()}
          onPause={handlePause}
        />
      )}

      {/* 3. Pause Modal */}
      {gameState === 'paused' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestart}
          onHome={handleHome}
          onOpenSettings={() => setActiveModal('settings')}
        />
      )}

      {/* 4. Game Over Modal */}
      {gameState === 'gameover' && (
        <GameOverModal
          stats={runStats}
          isNewHighScore={isNewHighScore}
          canReviveWithKey={saveData.keys >= 1}
          canReviveWithDiamonds={saveData.diamonds >= 5}
          onRevive={handleRevive}
          onRestart={handleRestart}
          onHome={handleHome}
        />
      )}

      {/* 5. Victory Modal */}
      {gameState === 'victory' && (
        <VictoryModal
          stats={runStats}
          currentWorld={selectedWorld}
          onNextAct={handleNextAct}
          onRestart={handleRestart}
          onHome={handleHome}
        />
      )}

      {/* 6. Modals */}
      {activeModal === 'locker' && (
        <CharacterLockerModal
          saveData={saveData}
          selectedSkinId={saveData.selectedSkinId}
          onSelectSkin={handleSelectSkin}
          onUnlockSkin={handleUnlockSkin}
          onUpgradeStat={handleUpgradeStat}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'missions' && (
        <MissionsModal
          saveData={saveData}
          onClaimMission={handleClaimMission}
          onClaimAchievement={handleClaimAchievement}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'rewards' && (
        <DailyRewardsModal
          saveData={saveData}
          canClaim={canClaimDaily}
          onClaim={handleClaimDaily}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'shop' && (
        <ShopModal
          saveData={saveData}
          onOpenMysteryChest={handleOpenMysteryChest}
          onBuyItem={handleBuyItem}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'modes' && (
        <ModesModal
          saveData={saveData}
          selectedMode={selectedMode}
          selectedWorld={selectedWorld}
          onSelectModeAndWorld={(m, w) => {
            setSelectedMode(m);
            setSelectedWorld(w);
          }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'leaderboard' && (
        <LeaderboardModal saveData={saveData} onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'settings' && (
        <SettingsModal
          settings={saveData.settings}
          onUpdateSettings={(newSettings) => {
            const next = { ...saveData, settings: { ...saveData.settings, ...newSettings } };
            setSaveData(next);
            saveGameData(next);
          }}
          onResetData={() => {
            localStorage.clear();
            const def = loadSaveData();
            setSaveData(def);
          }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'android' && (
        <AndroidApkModal
          deferredPrompt={deferredPrompt}
          onInstallPwa={handleInstallPwa}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}
