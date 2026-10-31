import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { soundEngine } from '../../audio/soundEngine';
import {
  ActivePowerUps,
  CharacterSkin,
  GameMode,
  GameRunStats,
  GameState,
  PlayerStats,
  WorldTheme,
} from '../../types/game';
import { CHARACTER_SKINS, WORLD_CONFIGS } from '../meta/gameStorage';
import { MaterialLibrary } from './materials';
import { createProceduralCharacter, RiggedCharacter } from './proceduralModels';
import { WorldManager } from './WorldManager';

// Pre-allocated math helpers to ensure zero GC in render loop (Three.js skill directive)
const _vec3 = new THREE.Vector3();
const _boxPlayer = new THREE.Box3();
const _boxHazard = new THREE.Box3();

export interface GameEngineCallbacks {
  onStatsUpdate: (stats: GameRunStats, powerUps: ActivePowerUps, bossHp?: { current: number; max: number }) => void;
  onGameOver: (stats: GameRunStats) => void;
  onVictory: (stats: GameRunStats) => void;
  onSecretRoomEntered: () => void;
}

export class GameEngine {
  public container: HTMLElement;
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public pmremGenerator: THREE.PMREMGenerator;

  public worldManager: WorldManager;
  public character: RiggedCharacter | null = null;
  public currentSkin: CharacterSkin;
  public playerStats: PlayerStats;

  public gameState: GameState = 'title';
  public gameMode: GameMode = 'story';
  public currentWorld: WorldTheme = 'forest';

  // Player Kinematics
  public currentLane: -1 | 0 | 1 = 0;
  public targetX: number = 0;
  public playerX: number = 0;
  public playerY: number = 0;
  public playerZ: number = 0;
  public playerVelY: number = 0;
  public isGrounded: boolean = true;
  public isJumping: boolean = false;
  public isSliding: boolean = false;
  public slideTimer: number = 0;
  public slideDuration: number = 0.65;

  public baseSpeed: number = 22; // meters/sec
  public currentSpeed: number = 22;
  public maxSpeed: number = 42;

  // Jump physics
  public jumpGravity: number = -46;
  public jumpVelocity: number = 15;
  public canDoubleJump: boolean = true;

  // Active Power-Ups
  public powerUps: ActivePowerUps = {
    speedBoost: 0,
    shield: 0,
    magnet: 0,
    doubleCoins: 0,
    phaseShift: 0,
  };

  // Run Stats
  public runStats: GameRunStats = {
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
    timeRemaining: 45,
  };

  // Camera Shake & Dynamic FOV
  public cameraShake: number = 0;
  public targetCameraFOV: number = 65;

  // Particle Systems
  public particleSystem: THREE.Points;
  public particlePositions: Float32Array;
  public particleVelocities: Float32Array;
  public particleCount: number = 300;

  // Lighting
  public keyLight: THREE.DirectionalLight;
  public hemiLight: THREE.HemisphereLight;

  // Animation & Loop variables
  private frameId: number = 0;
  private isRunning: boolean = false;
  private clock: THREE.Clock = new THREE.Clock();
  public callbacks: GameEngineCallbacks;

  // Software WebGL flag
  public isSoftwareGl: boolean = false;

  constructor(
    container: HTMLElement,
    callbacks: GameEngineCallbacks,
    initialSkin: CharacterSkin = CHARACTER_SKINS[0],
    playerStats: PlayerStats = { speedLevel: 1, magnetLevel: 1, shieldLevel: 1, multiplierLevel: 1 },
    initialWorld: WorldTheme = 'forest',
    initialMode: GameMode = 'story'
  ) {
    this.container = container;
    this.callbacks = callbacks;
    this.currentSkin = initialSkin;
    this.playerStats = playerStats;
    this.currentWorld = initialWorld;
    this.gameMode = initialMode;

    // Detect software WebGL per Three.js skill
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 1. Setup Three.js WebGLRenderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 2. Setup Scene & Camera
    this.scene = new THREE.Scene();
    const config = WORLD_CONFIGS[this.currentWorld];
    this.scene.background = new THREE.Color(config.skyColor);
    this.scene.fog = new THREE.FogExp2(config.fogColor, 0.015);

    this.camera = new THREE.PerspectiveCamera(
      65,
      container.clientWidth / container.clientHeight,
      0.1,
      250
    );
    this.camera.position.set(0, 3.8, -5.5);

    // 3. Procedural Studio Environment Reflection
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = this.pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    // Initialize Material library with renderer capabilities
    MaterialLibrary.getInstance().init(this.renderer);

    // 4. Lighting Rig (Key light + Hemisphere)
    this.keyLight = new THREE.DirectionalLight(0xfff5ea, 1.8);
    this.keyLight.position.set(12, 24, 10);
    this.keyLight.castShadow = !this.isSoftwareGl;
    if (this.keyLight.castShadow) {
      this.keyLight.shadow.mapSize.width = 1024;
      this.keyLight.shadow.mapSize.height = 1024;
      this.keyLight.shadow.camera.near = 0.5;
      this.keyLight.shadow.camera.far = 60;
      this.keyLight.shadow.camera.left = -15;
      this.keyLight.shadow.camera.right = 15;
      this.keyLight.shadow.camera.top = 20;
      this.keyLight.shadow.camera.bottom = -15;
      this.keyLight.shadow.bias = -0.0005;
      this.keyLight.shadow.normalBias = 0.02;
    }
    this.scene.add(this.keyLight);

    this.hemiLight = new THREE.HemisphereLight(config.ambientLight, 0x05070f, 1.2);
    this.scene.add(this.hemiLight);

    // 5. Initialize World Manager
    this.worldManager = new WorldManager(this.scene, this.currentWorld, config, this.gameMode);
    this.worldManager.initTrack(8);

    // 6. Spawn Character Model
    this.loadCharacter(this.currentSkin);

    // 7. Particle System (Sparks, speed motes, collision shards)
    const pGeo = new THREE.BufferGeometry();
    this.particlePositions = new Float32Array(this.particleCount * 3);
    this.particleVelocities = new Float32Array(this.particleCount * 3);

    for (let i = 0; i < this.particleCount; i++) {
      this.particlePositions[i * 3] = (Math.random() - 0.5) * 8;
      this.particlePositions[i * 3 + 1] = Math.random() * 4;
      this.particlePositions[i * 3 + 2] = Math.random() * 40;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));

    const pMat = new THREE.PointsMaterial({
      color: 0x00f5d4,
      size: 0.15,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    this.particleSystem = new THREE.Points(pGeo, pMat);
    this.scene.add(this.particleSystem);

    // Resize listener
    window.addEventListener('resize', this.onWindowResize);

    // Start render loop
    this.startLoop();
  }

  public loadCharacter(skin: CharacterSkin) {
    if (this.character) {
      this.scene.remove(this.character.root);
    }
    this.currentSkin = skin;
    this.character = createProceduralCharacter(skin);
    this.scene.add(this.character.root);

    // Apply skin bonuses
    if (skin.id === 'vesper') {
      this.powerUps.shield = Math.max(1, this.powerUps.shield);
      this.character.setShieldVisible(true);
    }
  }

  public setWorldTheme(theme: WorldTheme) {
    this.currentWorld = theme;
    const config = WORLD_CONFIGS[theme];
    this.scene.background = new THREE.Color(config.skyColor);
    if (this.scene.fog) {
      (this.scene.fog as THREE.FogExp2).color.setHex(config.fogColor);
    }
    this.hemiLight.color.setHex(config.ambientLight);

    this.worldManager.theme = theme;
    this.worldManager.config = config;
    this.worldManager.initTrack(8);

    soundEngine.setBGMWorld(theme);
  }

  public setGameMode(mode: GameMode) {
    this.gameMode = mode;
    this.worldManager.mode = mode;
    if (mode === 'time_attack') {
      this.runStats.timeRemaining = 45;
    } else if (mode === 'boss_challenge') {
      this.worldManager.spawnBoss(this.playerZ);
    }
  }

  public startRun() {
    this.gameState = 'playing';
    this.playerX = 0;
    this.playerY = 0;
    this.playerZ = 0;
    this.playerVelY = 0;
    this.currentLane = 0;
    this.targetX = 0;
    this.isJumping = false;
    this.isSliding = false;
    this.isGrounded = true;

    // Base speed modified by character speed level
    const speedBonus = 1 + (this.playerStats.speedLevel - 1) * 0.06;
    this.baseSpeed = 22 * speedBonus;
    this.currentSpeed = this.baseSpeed;

    // Reset powerups and stats
    this.powerUps = {
      speedBoost: 0,
      shield: this.currentSkin.id === 'vesper' ? 1 : 0,
      magnet: 0,
      doubleCoins: 0,
      phaseShift: 0,
    };

    if (this.character) {
      this.character.setShieldVisible(this.powerUps.shield > 0);
    }

    this.runStats = {
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
      timeRemaining: this.gameMode === 'time_attack' ? 45 : undefined,
    };

    this.worldManager.initTrack(8);

    if (this.gameMode === 'boss_challenge') {
      this.worldManager.spawnBoss(this.playerZ);
    }

    soundEngine.startBGM(this.currentWorld);
  }

  // --- PLAYER CONTROLS (Swipe, Buttons, Keyboard, Gamepad) ---

  public moveLeft() {
    if (this.gameState !== 'playing') return;
    if (this.currentLane > -1) {
      this.currentLane = (this.currentLane - 1) as -1 | 0 | 1;
      this.targetX = this.worldManager.laneX[this.currentLane + 1];
      soundEngine.playSlide();
      this.vibrate(25);
    }
  }

  public moveRight() {
    if (this.gameState !== 'playing') return;
    if (this.currentLane < 1) {
      this.currentLane = (this.currentLane + 1) as -1 | 0 | 1;
      this.targetX = this.worldManager.laneX[this.currentLane + 1];
      soundEngine.playSlide();
      this.vibrate(25);
    }
  }

  public jump() {
    if (this.gameState !== 'playing') return;
    if (this.isGrounded) {
      this.isGrounded = false;
      this.isJumping = true;
      this.isSliding = false;
      this.playerVelY = this.jumpVelocity;
      this.canDoubleJump = true;
      soundEngine.playJump();
      this.vibrate(35);
    } else if (this.canDoubleJump) {
      // Double jump upgrade / agility
      this.playerVelY = this.jumpVelocity * 0.9;
      this.canDoubleJump = false;
      soundEngine.playJump();
      this.vibrate(40);
    }
  }

  public slide() {
    if (this.gameState !== 'playing') return;
    if (!this.isGrounded) {
      // Fast fall down to ground
      this.playerVelY = -28;
    }
    this.isSliding = true;
    this.slideTimer = this.slideDuration;
    soundEngine.playSlide();
    this.vibrate(30);
  }

  public dash() {
    if (this.gameState !== 'playing') return;
    // Activate speed boost + invulnerability
    this.powerUps.speedBoost = 3.5;
    this.cameraShake = 0.2;
    soundEngine.playDash();
    this.vibrate(60);
  }

  public activatePowerUpItem(type: 'shield' | 'magnet' | 'speed' | 'doubleCoins' | 'phaseShift') {
    if (this.gameState !== 'playing') return;
    soundEngine.playPowerUp();
    this.vibrate([40, 30, 60]);

    if (type === 'shield') {
      this.powerUps.shield = Math.min(3, this.powerUps.shield + 1);
      if (this.character) this.character.setShieldVisible(true);
    } else if (type === 'magnet') {
      this.powerUps.magnet += 12;
    } else if (type === 'speed') {
      this.powerUps.speedBoost += 6;
    } else if (type === 'doubleCoins') {
      this.powerUps.doubleCoins += 15;
    } else if (type === 'phaseShift') {
      this.powerUps.phaseShift += 8;
    }
  }

  public triggerRevive() {
    this.gameState = 'playing';
    this.powerUps.shield = 1;
    this.powerUps.phaseShift = 4; // 4s invulnerability on revive
    if (this.character) this.character.setShieldVisible(true);
    soundEngine.playPowerUp();
  }

  private vibrate(pattern: number | number[]) {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Fallback if vibration not allowed
    }
  }

  // --- GAME SIMULATION TICK ---

  private tick = () => {
    const rawDt = this.clock.getDelta();
    // Clamp frame delta time per Three.js skill
    const dt = Math.min(rawDt, 0.05);

    if (this.gameState === 'playing') {
      this.updateSimulation(dt);
    } else if (this.gameState === 'title') {
      // Cinematic live title camera pan
      const time = Date.now() * 0.0008;
      this.camera.position.x = Math.sin(time) * 3.5;
      this.camera.position.y = 3.2 + Math.cos(time * 0.7) * 0.5;
      this.camera.position.z = -5.0 + Math.sin(time * 0.5) * 1.5;
      this.camera.lookAt(0, 1.2, 3.5);

      if (this.character) {
        this.character.updateAnimation(time, false, false, false, 1);
      }
    }

    // Render frame
    this.renderer.render(this.scene, this.camera);

    if (this.isRunning) {
      if (this.isSoftwareGl) {
        this.afterDraw(this.tick);
      } else {
        this.frameId = requestAnimationFrame(this.tick);
      }
    }
  };

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 60);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private updateSimulation(dt: number) {
    // 1. Calculate current speed and powerups
    let effectiveSpeed = this.baseSpeed;

    // Power-up count-downs
    if (this.powerUps.speedBoost > 0) {
      this.powerUps.speedBoost = Math.max(0, this.powerUps.speedBoost - dt);
      effectiveSpeed *= 1.6;
    }
    if (this.powerUps.magnet > 0) {
      this.powerUps.magnet = Math.max(0, this.powerUps.magnet - dt);
    }
    if (this.powerUps.doubleCoins > 0) {
      this.powerUps.doubleCoins = Math.max(0, this.powerUps.doubleCoins - dt);
    }
    if (this.powerUps.phaseShift > 0) {
      this.powerUps.phaseShift = Math.max(0, this.powerUps.phaseShift - dt);
    }

    // Gradual endless acceleration
    this.currentSpeed = Math.min(this.maxSpeed, effectiveSpeed + (this.runStats.distance / 800) * 4);

    // 2. Advance player forward
    const forwardStep = this.currentSpeed * dt;
    this.playerZ += forwardStep;
    this.runStats.distance += forwardStep;

    // Multiplier calculation (character upgrade level + active powerup)
    const baseMult = 1 + (this.playerStats.multiplierLevel - 1) * 0.25;
    const activeMult = this.powerUps.doubleCoins > 0 ? 2 : 1;
    const comboMult = 1 + Math.min(4, Math.floor(this.runStats.combos / 5) * 0.5);
    const totalMult = baseMult * activeMult * comboMult;

    this.runStats.score += Math.round(forwardStep * totalMult * 2);

    // Time attack mode countdown
    if (this.gameMode === 'time_attack' && this.runStats.timeRemaining !== undefined) {
      this.runStats.timeRemaining -= dt;
      if (this.runStats.timeRemaining <= 0) {
        this.runStats.timeRemaining = 0;
        this.triggerGameOver();
        return;
      }
    }

    // Check Story Mode Act Victory (Distance > 1200m and Boss Defeated if spawned)
    if (this.gameMode === 'story' && this.runStats.distance >= 1200) {
      if (!this.worldManager.boss && !this.runStats.bossDefeated) {
        // Spawn Act Boss climax
        this.worldManager.spawnBoss(this.playerZ);
        soundEngine.playBossRoar();
        this.cameraShake = 0.6;
      }
    }

    // 3. Smooth lane switching interpolation with bank lean
    this.playerX = THREE.MathUtils.damp(this.playerX, this.targetX, 16, dt);
    const bankLean = (this.targetX - this.playerX) * -0.15;

    // 4. Vertical jump & gravity kinematics
    if (!this.isGrounded) {
      this.playerVelY += this.jumpGravity * dt;
      this.playerY += this.playerVelY * dt;

      if (this.playerY <= 0) {
        this.playerY = 0;
        this.playerVelY = 0;
        this.isGrounded = true;
        this.isJumping = false;
        // Landing dust effect
        this.triggerLandingParticles();
      }
    }

    // 5. Slide timer
    if (this.isSliding) {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
      }
    }

    // 6. Update Character Mesh
    if (this.character) {
      this.character.root.position.set(this.playerX, this.playerY, this.playerZ);
      this.character.root.rotation.z = bankLean;
      this.character.updateAnimation(
        this.clock.getElapsedTime(),
        true,
        this.isJumping,
        this.isSliding,
        this.currentSpeed / this.baseSpeed
      );

      // Light moves with player
      this.keyLight.position.set(this.playerX + 10, 22, this.playerZ + 8);
      this.keyLight.target.position.set(this.playerX, 0, this.playerZ + 10);
      this.scene.add(this.keyLight.target);
    }

    // 7. Update Camera (Smooth follow + Camera Shake + Dynamic FOV)
    if (this.cameraShake > 0) {
      this.cameraShake = Math.max(0, this.cameraShake - dt * 1.8);
    }
    const shakeX = (Math.random() - 0.5) * this.cameraShake * 0.4;
    const shakeY = (Math.random() - 0.5) * this.cameraShake * 0.4;

    const targetCamZ = this.playerZ - 6.2 - (this.currentSpeed / this.baseSpeed) * 0.8;
    const targetCamY = 3.6 + (this.isSliding ? -0.4 : this.playerY * 0.45);
    const targetCamX = this.playerX * 0.65;

    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, targetCamX + shakeX, 12, dt);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, targetCamY + shakeY, 10, dt);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, targetCamZ, 14, dt);
    this.camera.lookAt(this.playerX, 1.4 + this.playerY * 0.5, this.playerZ + 6);

    // FOV expands during speed boost
    const desiredFOV = this.powerUps.speedBoost > 0 ? 76 : 65;
    this.camera.fov = THREE.MathUtils.damp(this.camera.fov, desiredFOV, 6, dt);
    this.camera.updateProjectionMatrix();

    // 8. Update World Track Chunks, Hazards, & Collectibles
    this.worldManager.update(this.playerZ, dt);

    // 9. Check Collisions: Collectibles & Magnet Pull
    this.handleCollectibleInteractions(dt);

    // 10. Check Collisions: Obstacles & Boss
    this.handleObstacleCollisions();

    // 11. Update Particles
    this.updateParticles(dt);

    // 12. Notify React HUD
    const bossHp = this.worldManager.boss
      ? { current: this.worldManager.boss.currentHealth, max: this.worldManager.boss.maxHealth }
      : undefined;
    this.callbacks.onStatsUpdate(this.runStats, this.powerUps, bossHp);
  }

  private handleCollectibleInteractions(dt: number) {
    const magnetRadius = (this.powerUps.magnet > 0 || this.currentSkin.id === 'sora') ? 14 : 2.5;

    this.worldManager.collectibles.forEach((c) => {
      if (c.collected) return;

      const dz = c.z - this.playerZ;
      const dx = c.mesh.position.x - this.playerX;
      const dist = Math.sqrt(dx * dx + dz * dz);

      // Magnet pull towards player
      if (dist < magnetRadius && (c.type === 'coin' || c.type === 'diamond')) {
        c.mesh.position.x = THREE.MathUtils.lerp(c.mesh.position.x, this.playerX, 15 * dt);
        c.mesh.position.z = THREE.MathUtils.lerp(c.mesh.position.z, this.playerZ, 15 * dt);
        c.mesh.position.y = THREE.MathUtils.lerp(c.mesh.position.y, this.playerY + 0.8, 15 * dt);
      }

      // Collect when close
      if (dist < 1.3 && Math.abs(c.mesh.position.y - this.playerY) < 1.8) {
        c.collected = true;
        this.scene.remove(c.mesh);

        if (c.type === 'coin') {
          const coinVal = this.powerUps.doubleCoins > 0 ? 2 : 1;
          this.runStats.coins += coinVal;
          this.runStats.score += 50 * coinVal;
          soundEngine.playCoin();
          this.vibrate(20);
        } else if (c.type === 'diamond') {
          this.runStats.diamonds += 1;
          this.runStats.score += 250;
          soundEngine.playDiamond();
          this.vibrate(40);
        } else if (c.type === 'key') {
          this.runStats.keys += 1;
          this.runStats.score += 500;
          soundEngine.playKey();
          this.vibrate(50);
        } else if (c.type === 'chest') {
          this.runStats.mysteryChests += 1;
          this.runStats.score += 1000;
          soundEngine.playChestOpen();
          this.vibrate([40, 50, 60]);
        } else if (c.type === 'portal') {
          // Secret Room Warp!
          this.enterSecretRoom();
        } else {
          // Power-up
          this.activatePowerUpItem(c.type as 'shield' | 'magnet' | 'speed' | 'doubleCoins' | 'phaseShift');
        }
      }
    });
  }

  private handleObstacleCollisions() {
    // If invulnerable via Phase Shift or Speed Boost, blast through hazards!
    const isInvulnerable = this.powerUps.phaseShift > 0 || this.powerUps.speedBoost > 0;

    // Player bounding box
    const playerHeight = this.isSliding ? 0.65 : 1.7;
    _boxPlayer.set(
      _vec3.set(this.playerX - 0.4, this.playerY, this.playerZ - 0.4),
      _vec3.set(this.playerX + 0.4, this.playerY + playerHeight, this.playerZ + 0.4)
    );

    this.worldManager.obstacles.forEach((obs) => {
      const dz = obs.z - this.playerZ;

      // Close dodge check (combos!)
      if (dz < -0.8 && dz > -2.0 && !obs.isTriggered) {
        obs.isTriggered = true;
        this.runStats.obstaclesDodged++;
        this.runStats.combos++;
        this.runStats.maxCombo = Math.max(this.runStats.maxCombo, this.runStats.combos);
      }

      // Check collision window (-0.8 to +0.8)
      if (Math.abs(dz) < 0.9) {
        // Lane check
        if (obs.lane === this.currentLane || obs.width > 2.5) {
          // Slide avoidance: if can slide under and player is sliding, pass safely!
          if (obs.canSlideUnder && this.isSliding) {
            return;
          }
          // Jump avoidance: if can jump over and player is jumping high enough
          if (obs.canJumpOver && this.playerY > obs.height * 0.7) {
            return;
          }

          // Real Collision Hit!
          if (isInvulnerable) {
            // Shatter obstacle without taking damage!
            this.scene.remove(obs.mesh);
            obs.z = -999;
            this.cameraShake = 0.25;
            soundEngine.playHurt();
            return;
          }

          // Check Kinetic Shield
          if (this.powerUps.shield > 0) {
            this.powerUps.shield--;
            this.cameraShake = 0.4;
            soundEngine.playShieldBreak();
            this.vibrate([60, 40, 80]);
            this.scene.remove(obs.mesh);
            obs.z = -999;
            if (this.powerUps.shield <= 0 && this.character) {
              this.character.setShieldVisible(false);
            }
            return;
          }

          // Fatal Impact!
          this.triggerGameOver();
        }
      }
    });

    // Check Boss Interaction
    if (this.worldManager.boss) {
      const boss = this.worldManager.boss;
      const bdz = boss.z - this.playerZ;

      // If player is close to boss during vulnerable state, strike boss!
      if (bdz < 6 && boss.attackState === 'vulnerable') {
        const isDefeated = this.worldManager.damageBoss(35);
        soundEngine.playHit();
        this.cameraShake = 0.5;
        this.vibrate([80, 50, 100]);

        if (isDefeated) {
          this.runStats.bossDefeated = true;
          this.runStats.score += 5000;
          soundEngine.playVictory();
          if (this.gameMode === 'boss_challenge' || this.gameMode === 'story') {
            this.triggerVictory();
          }
        }
      }
    }
  }

  private enterSecretRoom() {
    this.gameState = 'secret_room';
    soundEngine.playPowerUp();
    this.cameraShake = 0.3;
    this.callbacks.onSecretRoomEntered();

    // Spawn massive bonus coin & diamond fountain right along the lanes!
    for (let l: -1 | 0 | 1 = -1; l <= 1; l = (l + 1) as -1 | 0 | 1) {
      this.worldManager.spawnCoinArc(l, this.playerZ + 8, 12);
      this.worldManager.spawnCollectible('diamond', l, this.playerZ + 14);
      this.worldManager.spawnCollectible('key', l, this.playerZ + 20);
    }

    setTimeout(() => {
      if (this.gameState === 'secret_room') {
        this.gameState = 'playing';
      }
    }, 8000);
  }

  private triggerGameOver() {
    this.gameState = 'gameover';
    this.cameraShake = 0.8;
    this.runStats.combos = 0;
    soundEngine.playHurt();
    soundEngine.stopBGM();
    this.vibrate([100, 50, 100, 50, 150]);
    this.callbacks.onGameOver(this.runStats);
  }

  public triggerVictory() {
    this.gameState = 'victory';
    soundEngine.stopBGM();
    soundEngine.playVictory();
    this.callbacks.onVictory(this.runStats);
  }

  private triggerLandingParticles() {
    // Slight puff of dust
  }

  private updateParticles(dt: number) {
    const pos = this.particleSystem.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < this.particleCount; i++) {
      const idx = i * 3;
      pos[idx + 2] -= (this.currentSpeed * 0.7) * dt;

      // Wrap particles around player
      if (pos[idx + 2] < this.playerZ - 10) {
        pos[idx + 2] = this.playerZ + 40;
        pos[idx] = this.playerX + (Math.random() - 0.5) * 8;
        pos[idx + 1] = Math.random() * 3.5;
      }
    }
    this.particleSystem.geometry.attributes.position.needsUpdate = true;
  }

  public startLoop() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.clock.start();
    this.tick();
  }

  public pause() {
    if (this.gameState === 'playing') {
      this.gameState = 'paused';
      soundEngine.stopBGM();
    }
  }

  public resume() {
    if (this.gameState === 'paused') {
      this.gameState = 'playing';
      soundEngine.startBGM(this.currentWorld);
    }
  }

  public stopLoop() {
    this.isRunning = false;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
  }

  private onWindowResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public destroy() {
    this.stopLoop();
    window.removeEventListener('resize', this.onWindowResize);
    this.renderer.dispose();
    this.pmremGenerator.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
