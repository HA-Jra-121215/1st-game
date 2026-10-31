export type GameMode = 'story' | 'survival' | 'time_attack' | 'boss_challenge' | 'daily_challenge';

export type GameState =
  | 'title'
  | 'playing'
  | 'paused'
  | 'gameover'
  | 'victory'
  | 'secret_room'
  | 'boss_intro';

export type WorldTheme = 'forest' | 'cyber' | 'temple' | 'lava' | 'abyss';

export interface WorldConfig {
  id: WorldTheme;
  name: string;
  subtitle: string;
  primaryColor: string;
  accentColor: string;
  fogColor: number;
  skyColor: number;
  groundColor: number;
  ambientLight: number;
  hazardTypes: ('laser' | 'spikes' | 'boulder' | 'pendulum' | 'collapse' | 'monster')[];
  bossName: string;
  bossTitle: string;
}

export interface CharacterSkin {
  id: string;
  name: string;
  title: string;
  description: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  unlocked: boolean;
  costCoins: number;
  costDiamonds: number;
  costKeys: number;
  colors: {
    primary: number;
    accent: number;
    visor: number;
    suit: number;
    glow: string;
  };
  bonusStat: {
    type: 'speed' | 'magnet' | 'shield' | 'multiplier';
    label: string;
    value: string;
  };
}

export interface PlayerStats {
  speedLevel: number;      // 1 to 5 (+5% speed & dodge agility per lvl)
  magnetLevel: number;     // 1 to 5 (range + duration)
  shieldLevel: number;     // 1 to 5 (durability & recharge)
  multiplierLevel: number; // 1 to 5 (base multiplier 1x..3x)
}

export interface ActivePowerUps {
  speedBoost: number;  // time remaining in seconds
  shield: number;      // hits remaining
  magnet: number;      // time remaining
  doubleCoins: number; // time remaining
  phaseShift: number;  // time remaining
}

export interface GameRunStats {
  score: number;
  distance: number;
  coins: number;
  diamonds: number;
  keys: number;
  mysteryChests: number;
  obstaclesDodged: number;
  bossDefeated: boolean;
  combos: number;
  maxCombo: number;
  timeRemaining?: number; // for time attack
}

export interface DailyMission {
  id: string;
  description: string;
  goal: number;
  current: number;
  rewardType: 'coins' | 'diamonds' | 'keys';
  rewardAmount: number;
  claimed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
  claimed: boolean;
  rewardDiamonds: number;
  iconName: string;
}

export interface GameSettings {
  sfxVolume: number; // 0 to 1
  bgmVolume: number; // 0 to 1
  vibration: boolean;
  graphicsQuality: 'low' | 'medium' | 'high' | 'ultra';
  touchControlMode: 'buttons' | 'joystick' | 'swipes';
  invertControls: boolean;
}

export interface DailyRewardItem {
  day: number;
  type: 'coins' | 'diamonds' | 'key' | 'chest' | 'skin';
  amount: number;
  skinId?: string;
  label: string;
}
