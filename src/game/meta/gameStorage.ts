import { Achievement, CharacterSkin, DailyMission, DailyRewardItem, GameMode, GameRunStats, GameSettings, PlayerStats, WorldConfig, WorldTheme } from '../../types/game';

export const WORLD_CONFIGS: Record<WorldTheme, WorldConfig> = {
  forest: {
    id: 'forest',
    name: 'Mystical Shadow Forest',
    subtitle: 'Act I: The Whispering Ruins',
    primaryColor: '#10b981',
    accentColor: '#059669',
    fogColor: 0x071510,
    skyColor: 0x0a1f18,
    groundColor: 0x0f291e,
    ambientLight: 0x334d40,
    hazardTypes: ['spikes', 'collapse', 'monster'],
    bossName: 'Obsidian Golem',
    bossTitle: 'Guardian of the Ancient Woods',
  },
  cyber: {
    id: 'cyber',
    name: 'Neon Cyber Metropolis',
    subtitle: 'Act II: The Grid Overdrive',
    primaryColor: '#06b6d4',
    accentColor: '#3b82f6',
    fogColor: 0x080f24,
    skyColor: 0x0e1738,
    groundColor: 0x121d42,
    ambientLight: 0x3b4c80,
    hazardTypes: ['laser', 'spikes', 'collapse', 'monster'],
    bossName: 'Cyber Core Colossus',
    bossTitle: 'Sentient Grid Overseer',
  },
  temple: {
    id: 'temple',
    name: 'Ancient Sunken Temple',
    subtitle: 'Act III: Chamber of Sand & Gold',
    primaryColor: '#f59e0b',
    accentColor: '#d97706',
    fogColor: 0x18140c,
    skyColor: 0x241d11,
    groundColor: 0x382c16,
    ambientLight: 0x6e562b,
    hazardTypes: ['pendulum', 'boulder', 'collapse', 'spikes'],
    bossName: 'Chrono Sphinx',
    bossTitle: 'Keeper of Forgotten Time',
  },
  lava: {
    id: 'lava',
    name: 'Molten Core Abyss',
    subtitle: 'Act IV: The Infernal Crucible',
    primaryColor: '#ef4444',
    accentColor: '#f97316',
    fogColor: 0x1c0909,
    skyColor: 0x2e0e0e,
    groundColor: 0x3b1212,
    ambientLight: 0x6e2424,
    hazardTypes: ['boulder', 'laser', 'collapse', 'monster'],
    bossName: 'Nether Leviathan',
    bossTitle: 'Terror of the Magma Sea',
  },
  abyss: {
    id: 'abyss',
    name: 'Abyssal Void Domain',
    subtitle: 'Act V: The Impossible Horizon',
    primaryColor: '#a855f7',
    accentColor: '#6366f1',
    fogColor: 0x0f091c,
    skyColor: 0x180f2e,
    groundColor: 0x221340,
    ambientLight: 0x54368a,
    hazardTypes: ['laser', 'pendulum', 'boulder', 'collapse', 'monster'],
    bossName: 'Void Sovereign',
    bossTitle: 'The Impossible World Overlord',
  },
};

export const CHARACTER_SKINS: CharacterSkin[] = [
  {
    id: 'kael',
    name: 'Kael',
    title: 'The Shadow Runner',
    description: 'Master of swift movement and shadow stepping. Balanced agile runner.',
    rarity: 'Common',
    unlocked: true,
    costCoins: 0,
    costDiamonds: 0,
    costKeys: 0,
    colors: {
      primary: 0x00f5d4,
      accent: 0x7928ca,
      visor: 0x00f5d4,
      suit: 0x111625,
      glow: '#00f5d4',
    },
    bonusStat: {
      type: 'speed',
      label: 'Agility',
      value: '+5% Base Speed',
    },
  },
  {
    id: 'vesper',
    name: 'Vesper',
    title: 'Cyber Ninja',
    description: 'High-tech operative with reinforced kinetic energy plating and phase blade.',
    rarity: 'Rare',
    unlocked: false,
    costCoins: 800,
    costDiamonds: 15,
    costKeys: 2,
    colors: {
      primary: 0xff0055,
      accent: 0x00e5ff,
      visor: 0xff0055,
      suit: 0x161922,
      glow: '#ff0055',
    },
    bonusStat: {
      type: 'shield',
      label: 'Kinetic Shield',
      value: '+1 Free Hit Shield',
    },
  },
  {
    id: 'sora',
    name: 'Sora',
    title: 'Arcane Monk',
    description: 'Monk channeling ancient celestial energy. Draws wealth effortlessly.',
    rarity: 'Epic',
    unlocked: false,
    costCoins: 2000,
    costDiamonds: 30,
    costKeys: 4,
    colors: {
      primary: 0xfacc15,
      accent: 0xffffff,
      visor: 0xfef08a,
      suit: 0x292524,
      glow: '#facc15',
    },
    bonusStat: {
      type: 'magnet',
      label: 'Wealth Aura',
      value: '+50% Magnet Pull Radius',
    },
  },
  {
    id: 'ignis',
    name: 'Ignis',
    title: 'Lava Strider',
    description: 'Forged within the molten depths. Doubles all collected gold when active.',
    rarity: 'Epic',
    unlocked: false,
    costCoins: 3500,
    costDiamonds: 50,
    costKeys: 6,
    colors: {
      primary: 0xf97316,
      accent: 0xdc2626,
      visor: 0xfef08a,
      suit: 0x1c1917,
      glow: '#f97316',
    },
    bonusStat: {
      type: 'multiplier',
      label: 'Infernal Rage',
      value: '+1.5x Score & Coins',
    },
  },
  {
    id: 'nyx',
    name: 'Nyx',
    title: 'Void Phantom',
    description: 'A transcendent entity who walks between dimensions. The ultimate survivor.',
    rarity: 'Legendary',
    unlocked: false,
    costCoins: 6000,
    costDiamonds: 100,
    costKeys: 10,
    colors: {
      primary: 0xc084fc,
      accent: 0x38bdf8,
      visor: 0xe879f9,
      suit: 0x0f0c20,
      glow: '#c084fc',
    },
    bonusStat: {
      type: 'speed',
      label: 'Void Phase',
      value: 'Longer Phase Shift Duration',
    },
  },
];

export const DAILY_REWARDS_TABLE: DailyRewardItem[] = [
  { day: 1, type: 'coins', amount: 150, label: '150 Coins' },
  { day: 2, type: 'diamonds', amount: 5, label: '5 Diamonds' },
  { day: 3, type: 'key', amount: 1, label: '1 Ancient Key' },
  { day: 4, type: 'coins', amount: 350, label: '350 Coins' },
  { day: 5, type: 'diamonds', amount: 15, label: '15 Diamonds' },
  { day: 6, type: 'chest', amount: 1, label: 'Mystery Chest' },
  { day: 7, type: 'skin', amount: 1, skinId: 'vesper', label: 'Epic Mystery Reward' },
];

export const DEFAULT_MISSIONS: DailyMission[] = [
  { id: 'm1', description: 'Collect 150 gold coins', goal: 150, current: 0, rewardType: 'coins', rewardAmount: 200, claimed: false },
  { id: 'm2', description: 'Survive for 600 meters in any world', goal: 600, current: 0, rewardType: 'diamonds', rewardAmount: 5, claimed: false },
  { id: 'm3', description: 'Dodge 25 hazardous obstacles', goal: 25, current: 0, rewardType: 'coins', rewardAmount: 250, claimed: false },
  { id: 'm4', description: 'Collect 2 Ancient Keys', goal: 2, current: 0, rewardType: 'keys', rewardAmount: 1, claimed: false },
  { id: 'm5', description: 'Defeat 1 Titan Boss', goal: 1, current: 0, rewardType: 'diamonds', rewardAmount: 10, claimed: false },
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', title: 'First Escape', description: 'Complete your first run in Shadow Escape', progress: 0, maxProgress: 1, completed: false, claimed: false, rewardDiamonds: 5, iconName: 'Compass' },
  { id: 'a2', title: 'Speed Demon', description: 'Reach a distance of 1,000 meters in a single run', progress: 0, maxProgress: 1000, completed: false, claimed: false, rewardDiamonds: 10, iconName: 'Zap' },
  { id: 'a3', title: 'Treasure Hunter', description: 'Accumulate a total of 1,000 gold coins', progress: 0, maxProgress: 1000, completed: false, claimed: false, rewardDiamonds: 10, iconName: 'Coins' },
  { id: 'a4', title: 'Diamond Hands', description: 'Collect 25 Crimson Diamonds', progress: 0, maxProgress: 25, completed: false, claimed: false, rewardDiamonds: 15, iconName: 'Gem' },
  { id: 'a5', title: 'Master of Dodging', description: 'Dodge 100 deadly obstacles without colliding', progress: 0, maxProgress: 100, completed: false, claimed: false, rewardDiamonds: 15, iconName: 'ShieldAlert' },
  { id: 'a6', title: 'Titan Slayer', description: 'Defeat 3 Boss Encounters', progress: 0, maxProgress: 3, completed: false, claimed: false, rewardDiamonds: 25, iconName: 'Sword' },
  { id: 'a7', title: 'Mystery Unraveler', description: 'Unlock 5 Mystery Chests', progress: 0, maxProgress: 5, completed: false, claimed: false, rewardDiamonds: 20, iconName: 'Box' },
  { id: 'a8', title: 'Chamber Master', description: 'Discover a Secret Hidden Room', progress: 0, maxProgress: 1, completed: false, claimed: false, rewardDiamonds: 15, iconName: 'DoorClosed' },
];

export interface SaveData {
  coins: number;
  diamonds: number;
  keys: number;
  highScores: Record<GameMode, number>;
  bestDistances: Record<GameMode, number>;
  unlockedSkins: string[];
  selectedSkinId: string;
  playerStats: PlayerStats;
  dailyStreak: number;
  lastLoginDate: string; // YYYY-MM-DD
  dailyRewardsClaimedToday: boolean;
  missions: DailyMission[];
  missionDate: string;
  achievements: Achievement[];
  settings: GameSettings;
  storyProgressAct: number; // 1 to 5
}

const STORAGE_KEY = 'shadow_escape_save_v1';

export function loadSaveData(): SaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure migrations/defaults
      return {
        coins: parsed.coins ?? 250,
        diamonds: parsed.diamonds ?? 10,
        keys: parsed.keys ?? 2,
        highScores: parsed.highScores ?? { story: 0, survival: 0, time_attack: 0, boss_challenge: 0, daily_challenge: 0 },
        bestDistances: parsed.bestDistances ?? { story: 0, survival: 0, time_attack: 0, boss_challenge: 0, daily_challenge: 0 },
        unlockedSkins: parsed.unlockedSkins ?? ['kael'],
        selectedSkinId: parsed.selectedSkinId ?? 'kael',
        playerStats: parsed.playerStats ?? { speedLevel: 1, magnetLevel: 1, shieldLevel: 1, multiplierLevel: 1 },
        dailyStreak: parsed.dailyStreak ?? 1,
        lastLoginDate: parsed.lastLoginDate ?? '',
        dailyRewardsClaimedToday: parsed.dailyRewardsClaimedToday ?? false,
        missions: parsed.missions ?? DEFAULT_MISSIONS,
        missionDate: parsed.missionDate ?? '',
        achievements: parsed.achievements ?? INITIAL_ACHIEVEMENTS,
        settings: parsed.settings ?? {
          sfxVolume: 0.8,
          bgmVolume: 0.5,
          vibration: true,
          graphicsQuality: 'high',
          touchControlMode: 'buttons',
          invertControls: false,
        },
        storyProgressAct: parsed.storyProgressAct ?? 1,
      };
    }
  } catch (e) {
    console.warn('Error reading save data:', e);
  }

  // Default initial state
  const initial: SaveData = {
    coins: 300,
    diamonds: 15,
    keys: 3,
    highScores: { story: 0, survival: 0, time_attack: 0, boss_challenge: 0, daily_challenge: 0 },
    bestDistances: { story: 0, survival: 0, time_attack: 0, boss_challenge: 0, daily_challenge: 0 },
    unlockedSkins: ['kael'],
    selectedSkinId: 'kael',
    playerStats: { speedLevel: 1, magnetLevel: 1, shieldLevel: 1, multiplierLevel: 1 },
    dailyStreak: 1,
    lastLoginDate: '',
    dailyRewardsClaimedToday: false,
    missions: DEFAULT_MISSIONS,
    missionDate: '',
    achievements: INITIAL_ACHIEVEMENTS,
    settings: {
      sfxVolume: 0.8,
      bgmVolume: 0.5,
      vibration: true,
      graphicsQuality: 'high',
      touchControlMode: 'buttons',
      invertControls: false,
    },
    storyProgressAct: 1,
  };
  saveGameData(initial);
  return initial;
}

export function saveGameData(data: SaveData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Error saving game data:', e);
  }
}

export function processDailyLogin(data: SaveData): { updated: SaveData; canClaim: boolean } {
  const today = new Date().toISOString().slice(0, 10);
  const next = { ...data };

  if (next.lastLoginDate !== today) {
    // Check if consecutive day
    if (next.lastLoginDate) {
      const last = new Date(next.lastLoginDate);
      const curr = new Date(today);
      const diffDays = Math.round((curr.getTime() - last.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        next.dailyStreak = (next.dailyStreak % 7) + 1;
      } else if (diffDays > 1) {
        next.dailyStreak = 1;
      }
    }
    next.dailyRewardsClaimedToday = false;
    next.lastLoginDate = today;

    // Reset daily missions if date changed
    if (next.missionDate !== today) {
      next.missionDate = today;
      next.missions = DEFAULT_MISSIONS.map(m => ({ ...m, current: 0, claimed: false }));
    }

    saveGameData(next);
  }

  return { updated: next, canClaim: !next.dailyRewardsClaimedToday };
}

export function recordRunStats(
  data: SaveData,
  mode: GameMode,
  stats: GameRunStats
): { updated: SaveData; isNewHighScore: boolean; isNewBestDistance: boolean } {
  const next = { ...data };
  const currentHighScore = next.highScores[mode] || 0;
  const currentBestDist = next.bestDistances[mode] || 0;

  const isNewHighScore = stats.score > currentHighScore;
  const isNewBestDistance = stats.distance > currentBestDist;

  if (isNewHighScore) next.highScores[mode] = Math.round(stats.score);
  if (isNewBestDistance) next.bestDistances[mode] = Math.round(stats.distance);

  next.coins += stats.coins;
  next.diamonds += stats.diamonds;
  next.keys += stats.keys;

  // Advance missions
  next.missions = next.missions.map(m => {
    let add = 0;
    if (m.id === 'm1') add = stats.coins;
    else if (m.id === 'm2') add = stats.distance;
    else if (m.id === 'm3') add = stats.obstaclesDodged;
    else if (m.id === 'm4') add = stats.keys;
    else if (m.id === 'm5' && stats.bossDefeated) add = 1;

    return {
      ...m,
      current: Math.min(m.goal, m.current + add),
    };
  });

  // Advance achievements
  next.achievements = next.achievements.map(a => {
    let currentProgress = a.progress;
    if (a.id === 'a1') currentProgress = 1;
    else if (a.id === 'a2') currentProgress = Math.max(currentProgress, stats.distance);
    else if (a.id === 'a3') currentProgress = Math.min(a.maxProgress, currentProgress + stats.coins);
    else if (a.id === 'a4') currentProgress = Math.min(a.maxProgress, currentProgress + stats.diamonds);
    else if (a.id === 'a5') currentProgress = Math.min(a.maxProgress, currentProgress + stats.obstaclesDodged);
    else if (a.id === 'a6' && stats.bossDefeated) currentProgress = Math.min(a.maxProgress, currentProgress + 1);

    return {
      ...a,
      progress: currentProgress,
      completed: currentProgress >= a.maxProgress,
    };
  });

  saveGameData(next);
  return { updated: next, isNewHighScore, isNewBestDistance };
}
