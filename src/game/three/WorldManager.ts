import * as THREE from 'three';
import { GameMode, WorldConfig, WorldTheme } from '../../types/game';
import { MaterialLibrary } from './materials';
import {
  createAncientKey,
  createBossMesh,
  createCollapsingTile,
  createCrimsonDiamond,
  createGoldCoin,
  createLaserBarrier,
  createMysteryChest,
  createPendulumBlade,
  createPowerUpOrb,
  createRollingBoulder,
  createShadowMonster,
  createSpikeBarrier,
} from './proceduralModels';

export interface ActiveObstacle {
  id: string;
  type: 'laser' | 'spikes' | 'boulder' | 'pendulum' | 'collapse' | 'monster';
  mesh: THREE.Group;
  lane: -1 | 0 | 1;
  z: number;
  width: number;
  height: number;
  depth: number;
  isTriggered?: boolean;
  velocityZ?: number;
  subTiles?: THREE.Mesh[];
  canSlideUnder?: boolean;
  canJumpOver?: boolean;
}

export interface ActiveCollectible {
  id: string;
  type: 'coin' | 'diamond' | 'key' | 'chest' | 'speed' | 'shield' | 'magnet' | 'multiplier' | 'phase' | 'portal';
  mesh: THREE.Group;
  lane: -1 | 0 | 1;
  z: number;
  collected: boolean;
  magnetVelocity?: THREE.Vector3;
}

export interface BossInstance {
  mesh: THREE.Group;
  maxHealth: number;
  currentHealth: number;
  z: number;
  attackTimer: number;
  attackState: 'idle' | 'slam_prep' | 'slam' | 'laser_sweep' | 'vulnerable';
  attackLane?: -1 | 0 | 1;
}

export class WorldManager {
  private scene: THREE.Scene;
  public theme: WorldTheme;
  public config: WorldConfig;
  public mode: GameMode;

  public chunks: THREE.Group[] = [];
  public obstacles: ActiveObstacle[] = [];
  public collectibles: ActiveCollectible[] = [];
  public boss: BossInstance | null = null;

  public nextChunkZ: number = 0;
  public chunkSize: number = 32;
  public totalChunksSpawned: number = 0;

  public laneX: number[] = [-2.4, 0, 2.4]; // Left, Center, Right lanes

  constructor(scene: THREE.Scene, theme: WorldTheme, config: WorldConfig, mode: GameMode) {
    this.scene = scene;
    this.theme = theme;
    this.config = config;
    this.mode = mode;
  }

  public initTrack(initialChunkCount: number = 8) {
    this.clearAll();
    this.nextChunkZ = 0;

    for (let i = 0; i < initialChunkCount; i++) {
      // First 2 chunks are safe runway
      this.spawnChunk(i >= 2);
    }
  }

  public clearAll() {
    this.chunks.forEach((chunk) => this.scene.remove(chunk));
    this.chunks = [];

    this.obstacles.forEach((obs) => this.scene.remove(obs.mesh));
    this.obstacles = [];

    this.collectibles.forEach((c) => this.scene.remove(c.mesh));
    this.collectibles = [];

    if (this.boss) {
      this.scene.remove(this.boss.mesh);
      this.boss = null;
    }
  }

  public spawnChunk(spawnHazards: boolean = true) {
    const chunk = new THREE.Group();
    chunk.position.z = this.nextChunkZ;

    const groundMat = MaterialLibrary.getInstance().getGroundMaterial(this.theme);

    // Main 3-lane running track
    const trackWidth = 7.6;
    const trackGeo = new THREE.BoxGeometry(trackWidth, 0.4, this.chunkSize);
    const trackMesh = new THREE.Mesh(trackGeo, groundMat);
    trackMesh.position.set(0, -0.2, this.chunkSize / 2);
    trackMesh.receiveShadow = true;
    chunk.add(trackMesh);

    // Track boundary guardrails / energy curbs
    const curbMat = new THREE.MeshStandardMaterial({
      color: this.theme === 'cyber' ? 0x06b6d4 : 0x1f2937,
      metalness: 0.8,
      roughness: 0.3,
    });
    const curbGeo = new THREE.BoxGeometry(0.35, 0.45, this.chunkSize);

    const leftCurb = new THREE.Mesh(curbGeo, curbMat);
    leftCurb.position.set(-trackWidth / 2 + 0.175, 0.15, this.chunkSize / 2);
    chunk.add(leftCurb);

    const rightCurb = new THREE.Mesh(curbGeo, curbMat);
    rightCurb.position.set(trackWidth / 2 - 0.175, 0.15, this.chunkSize / 2);
    chunk.add(rightCurb);

    // Environmental scenery (trees, cyber towers, ancient columns, or lava pillars)
    this.decorateChunkEnvironment(chunk);

    this.scene.add(chunk);
    this.chunks.push(chunk);

    if (spawnHazards) {
      this.populateChunkContents(this.nextChunkZ);
    }

    this.nextChunkZ += this.chunkSize;
    this.totalChunksSpawned++;
  }

  private decorateChunkEnvironment(chunk: THREE.Group) {
    const sideOffset = 6.5;

    for (let z = 4; z < this.chunkSize; z += 12) {
      // Left side prop
      const propL = this.createEnvironmentProp();
      propL.position.set(-sideOffset - Math.random() * 2, 0, z);
      chunk.add(propL);

      // Right side prop
      const propR = this.createEnvironmentProp();
      propR.position.set(sideOffset + Math.random() * 2, 0, z);
      chunk.add(propR);
    }
  }

  private createEnvironmentProp(): THREE.Group {
    const prop = new THREE.Group();

    if (this.theme === 'forest') {
      // Mystical willow / glowing ruins tree
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x1a2e22, roughness: 0.9 });
      const foliageMat = new THREE.MeshStandardMaterial({
        color: 0x059669,
        roughness: 0.7,
        emissive: 0x10b981,
        emissiveIntensity: 0.15,
      });

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 3.5, 6), trunkMat);
      trunk.position.y = 1.75;
      prop.add(trunk);

      const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(1.4), foliageMat);
      crown.position.y = 3.6;
      prop.add(crown);
    } else if (this.theme === 'cyber') {
      // Futuristic cyber billboard / hologram spire
      const spireMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
      const neonMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });

      const tower = new THREE.Mesh(new THREE.BoxGeometry(0.8, 6.0, 0.8), spireMat);
      tower.position.y = 3.0;
      prop.add(tower);

      const beacon = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.8, 0.9), neonMat);
      beacon.position.set(0, 5.0, 0);
      prop.add(beacon);
    } else if (this.theme === 'temple') {
      // Weathered sandstone obelisk
      const stoneMat = new THREE.MeshStandardMaterial({ color: 0x453724, roughness: 0.9 });
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 4.5, 8), stoneMat);
      pillar.position.y = 2.25;
      prop.add(pillar);
    } else if (this.theme === 'lava') {
      // Volcanic rock outcrop with glowing magma tip
      const basaltMat = new THREE.MeshStandardMaterial({ color: 0x1a0f0f, roughness: 0.8 });
      const lavaTipMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

      const rock = new THREE.Mesh(new THREE.ConeGeometry(0.9, 3.5, 5), basaltMat);
      rock.position.y = 1.75;
      prop.add(rock);

      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 6), lavaTipMat);
      tip.position.y = 3.5;
      prop.add(tip);
    } else {
      // Underwater abyssal crystal pillar
      const crystalMat = new THREE.MeshPhysicalMaterial({
        color: 0x8b5cf6,
        roughness: 0.1,
        transmission: 0.7,
        transparent: true,
        opacity: 0.8,
      });
      const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(1.2, 0), crystalMat);
      crystal.position.y = 2.0;
      prop.add(crystal);
    }

    return prop;
  }

  private populateChunkContents(chunkStartZ: number) {
    const lanes: (-1 | 0 | 1)[] = [-1, 0, 1];
    const hazardTypes = this.config.hazardTypes;

    // Place 2-3 obstacle sets per chunk
    for (let offset = 8; offset < this.chunkSize; offset += 10) {
      const obstacleZ = chunkStartZ + offset;

      // Pick 1 or 2 lanes to block, leaving at least 1 safe passage
      const blockedLanes = [...lanes].sort(() => Math.random() - 0.5).slice(0, Math.random() < 0.35 ? 2 : 1);
      const randomHazard = hazardTypes[Math.floor(Math.random() * hazardTypes.length)];

      blockedLanes.forEach((lane) => {
        this.spawnObstacle(randomHazard, lane, obstacleZ);
      });

      // Populate coins or collectibles in the free lane or across the path
      const freeLanes = lanes.filter((l) => !blockedLanes.includes(l));
      if (freeLanes.length > 0) {
        const coinLane = freeLanes[Math.floor(Math.random() * freeLanes.length)];
        this.spawnCoinArc(coinLane, obstacleZ - 3, 5);
      }
    }

    // Occasional Power-up, Diamond, Key, or Mystery Box
    if (Math.random() < 0.45) {
      const specialLane = lanes[Math.floor(Math.random() * lanes.length)];
      const specialZ = chunkStartZ + 16;
      const roll = Math.random();

      if (roll < 0.35) {
        // Power-up
        const types: ('speed' | 'shield' | 'magnet' | 'multiplier' | 'phase')[] = [
          'speed',
          'shield',
          'magnet',
          'multiplier',
          'phase',
        ];
        const pType = types[Math.floor(Math.random() * types.length)];
        this.spawnCollectible(pType, specialLane, specialZ);
      } else if (roll < 0.65) {
        // Crimson Diamond
        this.spawnCollectible('diamond', specialLane, specialZ);
      } else if (roll < 0.85) {
        // Ancient Key
        this.spawnCollectible('key', specialLane, specialZ);
      } else {
        // Mystery Chest
        this.spawnCollectible('chest', specialLane, specialZ);
      }
    }

    // Rare Secret Room Rift Portal (5% chance per chunk)
    if (Math.random() < 0.05 && this.totalChunksSpawned > 5) {
      const portalLane = lanes[Math.floor(Math.random() * lanes.length)];
      this.spawnCollectible('portal', portalLane, chunkStartZ + 22);
    }
  }

  public spawnObstacle(type: 'laser' | 'spikes' | 'boulder' | 'pendulum' | 'collapse' | 'monster', lane: -1 | 0 | 1, z: number) {
    let mesh: THREE.Group;
    let width = 2.0;
    let height = 1.8;
    let depth = 1.2;
    let canSlideUnder = false;
    let canJumpOver = false;

    if (type === 'laser') {
      mesh = createLaserBarrier(2.2);
      canSlideUnder = true;
      canJumpOver = false;
      height = 1.6;
    } else if (type === 'spikes') {
      mesh = createSpikeBarrier();
      canSlideUnder = false;
      canJumpOver = true;
      height = 0.9;
    } else if (type === 'boulder') {
      mesh = createRollingBoulder();
      canSlideUnder = false;
      canJumpOver = true;
      height = 1.8;
    } else if (type === 'pendulum') {
      mesh = createPendulumBlade();
      canSlideUnder = true;
      canJumpOver = false;
      height = 2.4;
    } else if (type === 'collapse') {
      mesh = createCollapsingTile();
      canSlideUnder = false;
      canJumpOver = true;
      height = 0.4;
    } else {
      mesh = createShadowMonster();
      canSlideUnder = false;
      canJumpOver = false;
      height = 1.8;
    }

    mesh.position.set(this.laneX[lane + 1], 0, z);
    this.scene.add(mesh);

    this.obstacles.push({
      id: `obs_${Math.random()}`,
      type,
      mesh,
      lane,
      z,
      width,
      height,
      depth,
      isTriggered: false,
      canSlideUnder,
      canJumpOver,
      velocityZ: type === 'boulder' ? -8 : 0,
    });
  }

  public spawnCoinArc(lane: -1 | 0 | 1, startZ: number, count: number = 4) {
    for (let i = 0; i < count; i++) {
      const z = startZ + i * 1.5;
      const mesh = createGoldCoin();
      mesh.position.set(this.laneX[lane + 1], 0, z);
      this.scene.add(mesh);

      this.collectibles.push({
        id: `coin_${Math.random()}`,
        type: 'coin',
        mesh,
        lane,
        z,
        collected: false,
      });
    }
  }

  public spawnCollectible(
    type: 'diamond' | 'key' | 'chest' | 'speed' | 'shield' | 'magnet' | 'multiplier' | 'phase' | 'portal',
    lane: -1 | 0 | 1,
    z: number
  ) {
    let mesh: THREE.Group;

    if (type === 'diamond') {
      mesh = createCrimsonDiamond();
    } else if (type === 'key') {
      mesh = createAncientKey();
    } else if (type === 'chest') {
      mesh = createMysteryChest();
    } else if (type === 'portal') {
      // Glowing secret rift portal
      mesh = new THREE.Group();
      const ringGeo = new THREE.TorusGeometry(1.2, 0.15, 12, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xc084fc });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 1.4;
      mesh.add(ring);

      const portalCore = new THREE.Mesh(
        new THREE.CircleGeometry(1.1, 16),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide })
      );
      portalCore.position.y = 1.4;
      mesh.add(portalCore);

      const pLight = new THREE.PointLight(0xc084fc, 2, 5);
      pLight.position.y = 1.4;
      mesh.add(pLight);
    } else {
      mesh = createPowerUpOrb(type);
    }

    mesh.position.set(this.laneX[lane + 1], 0, z);
    this.scene.add(mesh);

    this.collectibles.push({
      id: `${type}_${Math.random()}`,
      type,
      mesh,
      lane,
      z,
      collected: false,
    });
  }

  public spawnBoss(playerZ: number) {
    if (this.boss) return;

    const bossMesh = createBossMesh(this.theme);
    const bossZ = playerZ + 45;
    bossMesh.position.set(0, 0, bossZ);
    bossMesh.rotation.y = Math.PI; // Face the oncoming player
    this.scene.add(bossMesh);

    this.boss = {
      mesh: bossMesh,
      maxHealth: 100,
      currentHealth: 100,
      z: bossZ,
      attackTimer: 0,
      attackState: 'idle',
      attackLane: 0,
    };
  }

  public update(playerZ: number, delta: number) {
    // 1. Maintain track ahead of player
    while (this.nextChunkZ < playerZ + 120) {
      this.spawnChunk(true);
    }

    // 2. Recycle old chunks and hazards behind player (Z < playerZ - 30)
    for (let i = this.chunks.length - 1; i >= 0; i--) {
      const chunk = this.chunks[i];
      if (chunk.position.z < playerZ - 35) {
        this.scene.remove(chunk);
        this.chunks.splice(i, 1);
      }
    }

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      if (obs.z < playerZ - 25) {
        this.scene.remove(obs.mesh);
        this.obstacles.splice(i, 1);
        continue;
      }

      // Update dynamic obstacle behaviors
      if (obs.type === 'boulder' && obs.velocityZ) {
        obs.z += obs.velocityZ * delta;
        obs.mesh.position.z = obs.z;
        obs.mesh.rotation.x -= 8 * delta; // Roll rotation
      } else if (obs.type === 'pendulum') {
        const pendulumArm = obs.mesh.getObjectByName('pendulumArm');
        if (pendulumArm) {
          pendulumArm.rotation.z = Math.sin(Date.now() * 0.004) * 0.95;
        }
      } else if (obs.type === 'collapse') {
        // Trigger shudder when player gets close (within 14m)
        const dist = obs.z - playerZ;
        if (dist > 0 && dist < 14) {
          obs.isTriggered = true;
          obs.mesh.position.y = Math.sin(Date.now() * 0.05) * 0.06;
          if (dist < 4) {
            // Drops down!
            obs.mesh.position.y -= 5 * delta;
          }
        }
      } else if (obs.type === 'monster') {
        // Float and pulse
        obs.mesh.position.y = 1.0 + Math.sin(Date.now() * 0.005) * 0.25;
      }
    }

    // 3. Update collectibles (rotate / hover / ring spin)
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const c = this.collectibles[i];
      if (c.collected || c.z < playerZ - 20) {
        this.scene.remove(c.mesh);
        this.collectibles.splice(i, 1);
        continue;
      }

      c.mesh.rotation.y += 3.5 * delta;
      c.mesh.position.y = Math.sin(Date.now() * 0.004 + c.z) * 0.12;

      const ring = c.mesh.getObjectByName('powerupRing');
      if (ring) {
        ring.rotation.x += 4 * delta;
        ring.rotation.z += 2 * delta;
      }
    }

    // 4. Update Boss if active
    if (this.boss) {
      this.updateBoss(playerZ, delta);
    }
  }

  private updateBoss(playerZ: number, delta: number) {
    if (!this.boss) return;

    // Keep boss at fixed running distance ahead of player
    const targetZ = playerZ + 28;
    this.boss.z = THREE.MathUtils.lerp(this.boss.z, targetZ, 4 * delta);
    this.boss.mesh.position.z = this.boss.z;

    this.boss.attackTimer += delta;

    // Boss Attack Cycle
    if (this.boss.attackState === 'idle' && this.boss.attackTimer > 3.5) {
      this.boss.attackTimer = 0;
      const attackRoll = Math.random();
      if (attackRoll < 0.5) {
        this.boss.attackState = 'slam_prep';
        this.boss.attackLane = ([-1, 0, 1] as const)[Math.floor(Math.random() * 3)];
      } else {
        this.boss.attackState = 'laser_sweep';
      }
    } else if (this.boss.attackState === 'slam_prep') {
      // Windup: raise arm
      const arm = this.boss.mesh.getObjectByName('bossRightArm');
      if (arm) arm.rotation.x = -1.6;
      if (this.boss.attackTimer > 1.2) {
        this.boss.attackState = 'slam';
        this.boss.attackTimer = 0;
        // Spawn ground shockwave hazard in player path!
        this.spawnObstacle('spikes', this.boss.attackLane || 0, this.boss.z - 10);
      }
    } else if (this.boss.attackState === 'slam') {
      const arm = this.boss.mesh.getObjectByName('bossRightArm');
      if (arm) arm.rotation.x = 0.4;
      if (this.boss.attackTimer > 0.8) {
        this.boss.attackState = 'vulnerable';
        this.boss.attackTimer = 0;
      }
    } else if (this.boss.attackState === 'laser_sweep') {
      if (this.boss.attackTimer > 2.0) {
        this.boss.attackState = 'idle';
        this.boss.attackTimer = 0;
      }
    } else if (this.boss.attackState === 'vulnerable') {
      if (this.boss.attackTimer > 2.5) {
        this.boss.attackState = 'idle';
        this.boss.attackTimer = 0;
        const arm = this.boss.mesh.getObjectByName('bossRightArm');
        if (arm) arm.rotation.x = 0;
      }
    }
  }

  public damageBoss(amount: number): boolean {
    if (!this.boss) return false;
    this.boss.currentHealth = Math.max(0, this.boss.currentHealth - amount);
    if (this.boss.currentHealth <= 0) {
      this.scene.remove(this.boss.mesh);
      this.boss = null;
      return true; // Boss defeated!
    }
    return false;
  }
}
