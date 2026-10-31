import * as THREE from 'three';
import { CharacterSkin, WorldTheme } from '../../types/game';
import { MaterialLibrary } from './materials';

export interface RiggedCharacter {
  root: THREE.Group;
  head: THREE.Group;
  torso: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftBoot: THREE.Mesh;
  rightBoot: THREE.Mesh;
  coreLight: THREE.PointLight;
  shieldMesh: THREE.Mesh;
  updateAnimation: (time: number, isRunning: boolean, isJumping: boolean, isSliding: boolean, speedMultiplier: number) => void;
  setShieldVisible: (visible: boolean) => void;
}

/**
 * Creates a composite 3D procedural character model (8-10 distinct parts).
 * Bottom pivot flush at Y = 0.
 */
export function createProceduralCharacter(skin: CharacterSkin): RiggedCharacter {
  const root = new THREE.Group();

  const primaryMat = new THREE.MeshStandardMaterial({
    color: skin.colors.primary,
    roughness: 0.25,
    metalness: 0.7,
  });

  const suitMat = new THREE.MeshStandardMaterial({
    color: skin.colors.suit,
    roughness: 0.6,
    metalness: 0.3,
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: skin.colors.accent,
    roughness: 0.3,
    metalness: 0.8,
  });

  const visorMat = new THREE.MeshBasicMaterial({
    color: skin.colors.visor,
  });

  // 1. Pelvis / Hips (pivot at Y = 0.85)
  const pelvis = new THREE.Group();
  pelvis.position.y = 0.85;
  root.add(pelvis);

  const pelvisMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.36, 0.2, 0.26),
    suitMat
  );
  pelvis.add(pelvisMesh);

  // 2. Torso (pivot on top of pelvis)
  const torso = new THREE.Group();
  torso.position.y = 0.12;
  pelvis.add(torso);

  const torsoMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.44, 0.5, 0.3),
    suitMat
  );
  torsoMesh.position.y = 0.25;
  torsoMesh.castShadow = true;
  torso.add(torsoMesh);

  // Chest Armor Plate
  const chestPlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.46, 0.28, 0.32),
    primaryMat
  );
  chestPlate.position.y = 0.32;
  torso.add(chestPlate);

  // Glowing Core Reactor in chest center
  const coreMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.04, 16),
    visorMat
  );
  coreMesh.rotation.x = Math.PI / 2;
  coreMesh.position.set(0, 0.32, 0.16);
  torso.add(coreMesh);

  const coreLight = new THREE.PointLight(skin.colors.primary, 1.2, 3);
  coreLight.position.set(0, 0.32, 0.25);
  torso.add(coreLight);

  // 3. Head & Visor
  const head = new THREE.Group();
  head.position.y = 0.52;
  torso.add(head);

  const headMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.26, 0.28, 0.28),
    suitMat
  );
  headMesh.position.y = 0.16;
  headMesh.castShadow = true;
  head.add(headMesh);

  // Helmet Crest
  const crest = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.1, 0.34),
    accentMat
  );
  crest.position.y = 0.32;
  head.add(crest);

  // Sleek Horizontal Visor
  const visor = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.08, 0.06),
    visorMat
  );
  visor.position.set(0, 0.16, 0.14);
  head.add(visor);

  // 4. Arms
  // Left Arm
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.28, 0.44, 0);
  torso.add(leftArm);

  const leftShoulder = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 8, 8),
    primaryMat
  );
  leftArm.add(leftShoulder);

  const leftForearm = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.45, 0.12),
    suitMat
  );
  leftForearm.position.y = -0.25;
  leftForearm.castShadow = true;
  leftArm.add(leftForearm);

  // Left Blade / Gauntlet
  const leftBlade = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.3, 0.16),
    accentMat
  );
  leftBlade.position.set(-0.06, -0.3, 0.05);
  leftArm.add(leftBlade);

  // Right Arm
  const rightArm = new THREE.Group();
  rightArm.position.set(0.28, 0.44, 0);
  torso.add(rightArm);

  const rightShoulder = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 8, 8),
    primaryMat
  );
  rightArm.add(rightShoulder);

  const rightForearm = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.45, 0.12),
    suitMat
  );
  rightForearm.position.y = -0.25;
  rightForearm.castShadow = true;
  rightArm.add(rightForearm);

  const rightBlade = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.3, 0.16),
    accentMat
  );
  rightBlade.position.set(0.06, -0.3, 0.05);
  rightArm.add(rightBlade);

  // 5. Legs
  // Left Leg
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.13, -0.1, 0);
  pelvis.add(leftLeg);

  const leftThigh = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.42, 0.16),
    suitMat
  );
  leftThigh.position.y = -0.21;
  leftThigh.castShadow = true;
  leftLeg.add(leftThigh);

  const leftBoot = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.35, 0.22),
    primaryMat
  );
  leftBoot.position.set(0, -0.55, 0.03);
  leftBoot.castShadow = true;
  leftLeg.add(leftBoot);

  // Right Leg
  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.13, -0.1, 0);
  pelvis.add(rightLeg);

  const rightThigh = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.42, 0.16),
    suitMat
  );
  rightThigh.position.y = -0.21;
  rightThigh.castShadow = true;
  rightLeg.add(rightThigh);

  const rightBoot = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.35, 0.22),
    primaryMat
  );
  rightBoot.position.set(0, -0.55, 0.03);
  rightBoot.castShadow = true;
  rightLeg.add(rightBoot);

  // 6. Energy Shield Mesh (toggled when shield powerup active)
  const shieldGeo = new THREE.IcosahedronGeometry(0.95, 2);
  const shieldMat = MaterialLibrary.getInstance().getShieldMaterial();
  const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
  shieldMesh.position.y = 0.85;
  shieldMesh.visible = false;
  root.add(shieldMesh);

  // Soft Contact Ground Shadow underneath
  const shadowGeo = new THREE.PlaneGeometry(1.2, 1.2);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
  });
  const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.02;
  root.add(contactShadow);

  // Animation Update Function
  const updateAnimation = (
    time: number,
    isRunning: boolean,
    isJumping: boolean,
    isSliding: boolean,
    speedMultiplier: number
  ) => {
    if (shieldMesh.visible) {
      shieldMesh.rotation.y += 0.03;
      shieldMesh.rotation.x += 0.01;
    }

    if (isSliding) {
      // Crouch low / slide posture
      torso.rotation.x = 1.1;
      torso.position.y = -0.3;
      head.rotation.x = -0.7;
      leftLeg.rotation.x = 1.4;
      rightLeg.rotation.x = 0.2;
      leftArm.rotation.x = -1.2;
      rightArm.rotation.x = -1.2;
      return;
    }

    if (isJumping) {
      // Jump tuck posture
      torso.rotation.x = 0.25;
      torso.position.y = 0.12;
      head.rotation.x = -0.2;
      leftLeg.rotation.x = 0.8;
      rightLeg.rotation.x = 0.4;
      leftArm.rotation.x = -1.5;
      rightArm.rotation.x = -1.5;
      return;
    }

    if (isRunning) {
      // High-speed run cycle
      const freq = 14 * speedMultiplier;
      const swing = Math.sin(time * freq);
      const cosSwing = Math.cos(time * freq);

      torso.rotation.x = 0.25; // Lean forward into sprint
      torso.position.y = 0.12 + Math.abs(swing) * 0.06;
      head.rotation.x = -0.15;

      // Legs swing back & forth
      leftLeg.rotation.x = swing * 0.9;
      rightLeg.rotation.x = -swing * 0.9;

      // Arms counter-swing
      leftArm.rotation.x = -swing * 1.1;
      rightArm.rotation.x = swing * 1.1;

      // Subtle torso twist
      torso.rotation.y = swing * 0.12;
    } else {
      // Idle breathing
      const breath = Math.sin(time * 2) * 0.03;
      torso.position.y = 0.12 + breath;
      torso.rotation.x = 0.05;
      head.rotation.x = -breath;
      leftLeg.rotation.x = 0;
      rightLeg.rotation.x = 0;
      leftArm.rotation.x = 0.1;
      rightArm.rotation.x = -0.1;
    }
  };

  const setShieldVisible = (visible: boolean) => {
    shieldMesh.visible = visible;
  };

  return {
    root,
    head,
    torso,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    leftBoot,
    rightBoot,
    coreLight,
    shieldMesh,
    updateAnimation,
    setShieldVisible,
  };
}

/**
 * Creates Procedural Obstacles with 3-8 parts each
 */
export function createLaserBarrier(width: number = 2.4): THREE.Group {
  const group = new THREE.Group();

  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x222636,
    metalness: 0.9,
    roughness: 0.2,
  });

  const beamMat = MaterialLibrary.getInstance().getLaserBeamMaterial();

  // Left Pylon
  const pylonGeo = new THREE.CylinderGeometry(0.12, 0.18, 1.8, 8);
  const leftPylon = new THREE.Mesh(pylonGeo, metalMat);
  leftPylon.position.set(-width / 2, 0.9, 0);
  group.add(leftPylon);

  // Right Pylon
  const rightPylon = new THREE.Mesh(pylonGeo, metalMat);
  rightPylon.position.set(width / 2, 0.9, 0);
  group.add(rightPylon);

  // Laser Beams (Two glowing beams at slide height & mid height)
  const beamGeo = new THREE.CylinderGeometry(0.04, 0.04, width, 8);
  const beam1 = new THREE.Mesh(beamGeo, beamMat);
  beam1.rotation.z = Math.PI / 2;
  beam1.position.set(0, 1.1, 0);
  group.add(beam1);

  const beam2 = new THREE.Mesh(beamGeo, beamMat);
  beam2.rotation.z = Math.PI / 2;
  beam2.position.set(0, 0.6, 0);
  group.add(beam2);

  // Pylon tip emitters
  const emitterGeo = new THREE.SphereGeometry(0.14, 8, 8);
  const leftEmitter = new THREE.Mesh(emitterGeo, beamMat);
  leftEmitter.position.set(-width / 2, 1.8, 0);
  group.add(leftEmitter);

  const rightEmitter = new THREE.Mesh(emitterGeo, beamMat);
  rightEmitter.position.set(width / 2, 1.8, 0);
  group.add(rightEmitter);

  return group;
}

export function createSpikeBarrier(): THREE.Group {
  const group = new THREE.Group();

  const baseMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.7 });
  const spikeMat = new THREE.MeshStandardMaterial({
    color: 0x71717a,
    metalness: 0.9,
    roughness: 0.2,
  });

  // Base platform
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.1, 1.2), baseMat);
  base.position.y = 0.05;
  group.add(base);

  // Row of lethal spikes
  const coneGeo = new THREE.ConeGeometry(0.16, 0.85, 6);
  for (let x = -0.8; x <= 0.8; x += 0.4) {
    for (let z = -0.3; z <= 0.3; z += 0.3) {
      const spike = new THREE.Mesh(coneGeo, spikeMat);
      spike.position.set(x + (Math.random() * 0.05 - 0.025), 0.45, z);
      spike.castShadow = true;
      group.add(spike);
    }
  }

  return group;
}

export function createRollingBoulder(): THREE.Group {
  const group = new THREE.Group();

  const rockGeo = new THREE.DodecahedronGeometry(0.95, 1);
  const rockMat = new THREE.MeshStandardMaterial({
    color: 0x3f2f25,
    roughness: 0.85,
    metalness: 0.1,
  });

  const boulder = new THREE.Mesh(rockGeo, rockMat);
  boulder.position.y = 0.95;
  boulder.castShadow = true;
  group.add(boulder);

  // Magma glowing cracks inside boulder
  const magmaMat = new THREE.MeshBasicMaterial({ color: 0xff3b00 });
  const innerCore = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 8), magmaMat);
  innerCore.position.y = 0.95;
  group.add(innerCore);

  return group;
}

export function createPendulumBlade(): THREE.Group {
  const group = new THREE.Group();

  const archMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.6 });
  const bladeMat = new THREE.MeshStandardMaterial({
    color: 0xe5e7eb,
    metalness: 0.95,
    roughness: 0.1,
  });

  // Top overhead crossbeam
  const beam = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.3, 0.4), archMat);
  beam.position.y = 3.6;
  group.add(beam);

  // Support pillars
  const pillarGeo = new THREE.BoxGeometry(0.3, 3.6, 0.4);
  const leftPillar = new THREE.Mesh(pillarGeo, archMat);
  leftPillar.position.set(-1.8, 1.8, 0);
  group.add(leftPillar);

  const rightPillar = new THREE.Mesh(pillarGeo, archMat);
  rightPillar.position.set(1.8, 1.8, 0);
  group.add(rightPillar);

  // Swinging arm
  const pendulumArm = new THREE.Group();
  pendulumArm.position.set(0, 3.6, 0);
  pendulumArm.name = 'pendulumArm';

  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 8), archMat);
  rod.position.y = -1.3;
  pendulumArm.add(rod);

  // Crescent blade
  const blade = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.08, 16, 1, false, 0, Math.PI), bladeMat);
  blade.rotation.x = Math.PI / 2;
  blade.position.y = -2.6;
  pendulumArm.add(blade);

  group.add(pendulumArm);
  return group;
}

export function createCollapsingTile(): THREE.Group {
  const group = new THREE.Group();

  const tileMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.8,
  });

  // 4 segmented tiles that can shatter / shake
  const subGeo = new THREE.BoxGeometry(0.95, 0.2, 0.95);
  const offsets = [
    [-0.5, -0.5],
    [0.5, -0.5],
    [-0.5, 0.5],
    [0.5, 0.5],
  ];

  offsets.forEach(([ox, oz], idx) => {
    const tile = new THREE.Mesh(subGeo, tileMat);
    tile.position.set(ox, 0.1, oz);
    tile.name = `subtile_${idx}`;
    group.add(tile);
  });

  return group;
}

export function createShadowMonster(): THREE.Group {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x09090b,
    roughness: 0.4,
    metalness: 0.8,
  });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

  // Floating body core
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 12), bodyMat);
  body.position.y = 1.0;
  group.add(body);

  // Glowing red predator eyes
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), eyeMat);
  eyeL.position.set(-0.18, 1.1, 0.42);
  group.add(eyeL);

  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), eyeMat);
  eyeR.position.set(0.18, 1.1, 0.42);
  group.add(eyeR);

  // Horns / Spines
  const hornGeo = new THREE.ConeGeometry(0.1, 0.5, 6);
  const hornL = new THREE.Mesh(hornGeo, bodyMat);
  hornL.position.set(-0.35, 1.45, -0.1);
  hornL.rotation.z = -0.4;
  group.add(hornL);

  const hornR = new THREE.Mesh(hornGeo, bodyMat);
  hornR.position.set(0.35, 1.45, -0.1);
  hornR.rotation.z = 0.4;
  group.add(hornR);

  return group;
}

/**
 * Creates Collectibles: Coins, Diamonds, Ancient Keys, Mystery Chests, Power-up Orbs
 */
export function createGoldCoin(): THREE.Group {
  const group = new THREE.Group();

  const coinMat = MaterialLibrary.getInstance().getGoldCoinMaterial();
  const coinGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.08, 18);
  const coin = new THREE.Mesh(coinGeo, coinMat);
  coin.rotation.x = Math.PI / 2;
  coin.position.y = 0.6;
  coin.castShadow = true;
  group.add(coin);

  // Inner decorative star ring
  const ringGeo = new THREE.TorusGeometry(0.24, 0.03, 8, 16);
  const ring = new THREE.Mesh(ringGeo, coinMat);
  ring.position.y = 0.6;
  group.add(ring);

  return group;
}

export function createCrimsonDiamond(): THREE.Group {
  const group = new THREE.Group();

  const gemMat = MaterialLibrary.getInstance().getDiamondMaterial();
  const gemGeo = new THREE.OctahedronGeometry(0.42, 0);
  const gem = new THREE.Mesh(gemGeo, gemMat);
  gem.position.y = 0.75;
  group.add(gem);

  // Sparkle light
  const gemLight = new THREE.PointLight(0xff0055, 1.2, 2.5);
  gemLight.position.y = 0.75;
  group.add(gemLight);

  return group;
}

export function createAncientKey(): THREE.Group {
  const group = new THREE.Group();

  const keyMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    metalness: 0.9,
    roughness: 0.15,
    emissive: 0x0284c7,
    emissiveIntensity: 0.4,
  });

  // Key stem
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.7, 8), keyMat);
  stem.position.y = 0.6;
  group.add(stem);

  // Key bow (head ring)
  const bow = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.04, 8, 16), keyMat);
  bow.position.y = 0.95;
  group.add(bow);

  // Key bit (teeth)
  const teeth = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.06), keyMat);
  teeth.position.set(0.08, 0.38, 0);
  group.add(teeth);

  // Halo
  const haloGeo = new THREE.RingGeometry(0.4, 0.45, 24);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.6,
  });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  halo.position.y = 0.75;
  group.add(halo);

  return group;
}

export function createMysteryChest(): THREE.Group {
  const group = new THREE.Group();

  const woodMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 });
  const goldBandMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.8,
    roughness: 0.2,
  });

  // Chest Base
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.45, 0.6), woodMat);
  base.position.y = 0.225;
  group.add(base);

  // Metal Bands
  const bandL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.46, 0.62), goldBandMat);
  bandL.position.set(-0.3, 0.225, 0);
  group.add(bandL);

  const bandR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.46, 0.62), goldBandMat);
  bandR.position.set(0.3, 0.225, 0);
  group.add(bandR);

  // Chest Lid (hinged at top back)
  const lid = new THREE.Group();
  lid.position.set(0, 0.45, -0.3);
  lid.name = 'chestLid';

  const lidMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.9, 12, 1, false, 0, Math.PI), woodMat);
  lidMesh.rotation.z = Math.PI / 2;
  lidMesh.position.set(0, 0, 0.3);
  lid.add(lidMesh);

  group.add(lid);

  // Lock clasp
  const lock = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 0.08), goldBandMat);
  lock.position.set(0, 0.35, 0.32);
  group.add(lock);

  return group;
}

export function createPowerUpOrb(type: 'speed' | 'shield' | 'magnet' | 'multiplier' | 'phase'): THREE.Group {
  const group = new THREE.Group();

  const colorMap = {
    speed: 0x10b981,
    shield: 0x06b6d4,
    magnet: 0xfacc15,
    multiplier: 0xec4899,
    phase: 0xa855f7,
  };

  const orbColor = colorMap[type];

  // Glowing sphere
  const sphereGeo = new THREE.SphereGeometry(0.38, 16, 16);
  const sphereMat = new THREE.MeshStandardMaterial({
    color: orbColor,
    emissive: orbColor,
    emissiveIntensity: 0.6,
    metalness: 0.3,
    roughness: 0.2,
  });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  sphere.position.y = 0.7;
  group.add(sphere);

  // Rotating outer ring
  const ringGeo = new THREE.TorusGeometry(0.55, 0.04, 8, 24);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.y = 0.7;
  ring.name = 'powerupRing';
  group.add(ring);

  // Light
  const light = new THREE.PointLight(orbColor, 1.5, 3.5);
  light.position.y = 0.7;
  group.add(light);

  return group;
}

/**
 * Procedural Boss Model (e.g. Obsidian Golem)
 */
export function createBossMesh(theme: WorldTheme): THREE.Group {
  const boss = new THREE.Group();
  boss.name = 'bossRoot';

  const stoneMat = new THREE.MeshStandardMaterial({
    color: theme === 'lava' ? 0x261010 : theme === 'cyber' ? 0x111c33 : 0x27272a,
    roughness: 0.8,
    metalness: 0.3,
  });

  const glowMat = new THREE.MeshBasicMaterial({
    color: theme === 'lava' ? 0xff4400 : theme === 'cyber' ? 0x00f5d4 : 0x10b981,
  });

  // Massive Torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 1.6), stoneMat);
  torso.position.y = 2.4;
  torso.castShadow = true;
  boss.add(torso);

  // Glowing Core Crystal
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.6), glowMat);
  core.position.set(0, 2.4, 0.85);
  boss.add(core);

  // Head with horns
  const head = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, 1.0), stoneMat);
  head.position.set(0, 3.8, 0.2);
  boss.add(head);

  // Glowing eyes
  const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.1, 0.1), glowMat);
  eyeL.position.set(-0.35, 3.8, 0.72);
  boss.add(eyeL);

  const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.1, 0.1), glowMat);
  eyeR.position.set(0.35, 3.8, 0.72);
  boss.add(eyeR);

  // Heavy Left Arm & Boulder Fist
  const leftArm = new THREE.Group();
  leftArm.name = 'bossLeftArm';
  leftArm.position.set(-1.6, 3.0, 0);

  const shoulderL = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 8), stoneMat);
  leftArm.add(shoulderL);

  const forearmL = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.4, 0.7), stoneMat);
  forearmL.position.y = -0.9;
  leftArm.add(forearmL);

  const fistL = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), stoneMat);
  fistL.position.y = -1.8;
  fistL.castShadow = true;
  leftArm.add(fistL);

  boss.add(leftArm);

  // Heavy Right Arm & Boulder Fist
  const rightArm = new THREE.Group();
  rightArm.name = 'bossRightArm';
  rightArm.position.set(1.6, 3.0, 0);

  const shoulderR = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 8), stoneMat);
  rightArm.add(shoulderR);

  const forearmR = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.4, 0.7), stoneMat);
  forearmR.position.y = -0.9;
  rightArm.add(forearmR);

  const fistR = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), stoneMat);
  fistR.position.y = -1.8;
  fistR.castShadow = true;
  rightArm.add(fistR);

  boss.add(rightArm);

  return boss;
}
