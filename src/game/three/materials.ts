import * as THREE from 'three';
import { WorldTheme } from '../../types/game';

/**
 * Procedural texture and material generators for Shadow Escape.
 * Adheres to Three.js guidelines:
 * - SRGBColorSpace on albedo textures
 * - Max anisotropy
 * - 100% procedural (Zero 404 dependencies)
 */

export class MaterialLibrary {
  private static instance: MaterialLibrary;
  private textures: Map<string, THREE.Texture> = new Map();
  private materials: Map<string, THREE.Material> = new Map();
  public maxAnisotropy: number = 4;

  public static getInstance(): MaterialLibrary {
    if (!MaterialLibrary.instance) {
      MaterialLibrary.instance = new MaterialLibrary();
    }
    return MaterialLibrary.instance;
  }

  public init(renderer: THREE.WebGLRenderer) {
    this.maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
  }

  // Generate procedural canvas texture for track ground
  public getGroundTexture(theme: WorldTheme): THREE.Texture {
    const key = `ground_${theme}`;
    if (this.textures.has(key)) return this.textures.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    if (theme === 'forest') {
      // Dark ancient stone tile path with luminescent moss & runes
      ctx.fillStyle = '#101c18';
      ctx.fillRect(0, 0, 512, 512);

      // Cobblestone grid
      ctx.strokeStyle = '#09120e';
      ctx.lineWidth = 4;
      for (let y = 0; y < 512; y += 64) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
      }
      for (let x = 0; x < 512; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
      }

      // Bioluminescent moss flecks
      ctx.fillStyle = 'rgba(16, 185, 129, 0.45)';
      for (let i = 0; i < 60; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const r = Math.random() * 6 + 2;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (theme === 'cyber') {
      // Sleek dark asphalt with neon cyber grid and track boundary lines
      ctx.fillStyle = '#0a0d18';
      ctx.fillRect(0, 0, 512, 512);

      ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 512; i += 32) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(512, i);
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 512);
        ctx.stroke();
      }

      // Neon guide lines for 3 lanes
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(170, 0);
      ctx.lineTo(170, 512);
      ctx.moveTo(342, 0);
      ctx.lineTo(342, 512);
      ctx.stroke();
    } else if (theme === 'temple') {
      // Weathered sandstone flagstones with carved hieroglyphs & gold veins
      ctx.fillStyle = '#261e12';
      ctx.fillRect(0, 0, 512, 512);

      ctx.strokeStyle = '#18120a';
      ctx.lineWidth = 6;
      for (let y = 0; y < 512; y += 128) {
        ctx.strokeRect(0, y, 512, 128);
      }

      // Gold inlay runes
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
      ctx.lineWidth = 3;
      ctx.strokeRect(64, 32, 64, 64);
      ctx.strokeRect(320, 32, 64, 64);
      ctx.strokeRect(192, 160, 128, 64);
    } else if (theme === 'lava') {
      // Scorched obsidian basalt rock with glowing cracked magma veins
      ctx.fillStyle = '#1c0e0e';
      ctx.fillRect(0, 0, 512, 512);

      // Magma cracks
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(40, 0);
      ctx.bezierCurveTo(80, 150, 20, 300, 120, 512);
      ctx.moveTo(300, 0);
      ctx.bezierCurveTo(240, 200, 380, 320, 320, 512);
      ctx.stroke();

      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(40, 0);
      ctx.bezierCurveTo(80, 150, 20, 300, 120, 512);
      ctx.moveTo(300, 0);
      ctx.bezierCurveTo(240, 200, 380, 320, 320, 512);
      ctx.stroke();
    } else {
      // Abyss / Underwater: Deep oceanic tile with caustic waves
      ctx.fillStyle = '#0a0d24';
      ctx.fillRect(0, 0, 512, 512);

      ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)';
      ctx.lineWidth = 3;
      for (let y = 0; y < 512; y += 64) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.quadraticCurveTo(256, y + 20, 512, y);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 4);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = this.maxAnisotropy;
    this.textures.set(key, texture);
    return texture;
  }

  // Get or create PBR ground material
  public getGroundMaterial(theme: WorldTheme): THREE.MeshStandardMaterial {
    const key = `mat_ground_${theme}`;
    if (this.materials.has(key)) return this.materials.get(key) as THREE.MeshStandardMaterial;

    const texture = this.getGroundTexture(theme);
    const mat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: theme === 'cyber' ? 0.3 : 0.8,
      metalness: theme === 'cyber' ? 0.4 : 0.1,
    });
    this.materials.set(key, mat);
    return mat;
  }

  // Reusable materials
  public getGoldCoinMaterial(): THREE.MeshStandardMaterial {
    const key = 'mat_gold_coin';
    if (this.materials.has(key)) return this.materials.get(key) as THREE.MeshStandardMaterial;

    const mat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.15,
      emissive: 0xffaa00,
      emissiveIntensity: 0.25,
    });
    this.materials.set(key, mat);
    return mat;
  }

  public getDiamondMaterial(): THREE.MeshPhysicalMaterial {
    const key = 'mat_diamond';
    if (this.materials.has(key)) return this.materials.get(key) as THREE.MeshPhysicalMaterial;

    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xff0055,
      emissive: 0xff0044,
      emissiveIntensity: 0.5,
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.7,
      ior: 2.2,
      thickness: 1.2,
      transparent: true,
      opacity: 0.95,
    });
    this.materials.set(key, mat);
    return mat;
  }

  public getLaserBeamMaterial(): THREE.MeshBasicMaterial {
    const key = 'mat_laser_beam';
    if (this.materials.has(key)) return this.materials.get(key) as THREE.MeshBasicMaterial;

    const mat = new THREE.MeshBasicMaterial({
      color: 0xff0044,
      transparent: true,
      opacity: 0.85,
    });
    this.materials.set(key, mat);
    return mat;
  }

  public getShieldMaterial(): THREE.MeshPhysicalMaterial {
    const key = 'mat_shield_hex';
    if (this.materials.has(key)) return this.materials.get(key) as THREE.MeshPhysicalMaterial;

    const mat = new THREE.MeshPhysicalMaterial({
      color: 0x00f5d4,
      emissive: 0x00a896,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.2,
      transmission: 0.8,
      transparent: true,
      opacity: 0.6,
      wireframe: false,
    });
    this.materials.set(key, mat);
    return mat;
  }
}
