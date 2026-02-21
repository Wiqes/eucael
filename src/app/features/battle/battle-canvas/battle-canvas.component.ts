import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  afterNextRender,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import gsap from 'gsap';
import { BattleService } from '../battle.service';
import { BattleCharacter, BattleAction, BattleActionType, Position3d } from '../battle.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-battle-canvas',
  standalone: true,
  imports: [CommonModule],
  template:
    '<canvas #battleCanvas style="width:100%;height:100%;display:block;position:absolute;top:0;left:0;"></canvas>',
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        position: relative;
      }

      canvas {
        width: 100% !important;
        height: 100% !important;
        min-height: 100%;
        max-height: 100%;
        display: block;
        position: absolute;
        top: 0;
        left: 0;
      }
    `,
  ],
})
export class BattleCanvasComponent implements OnInit, OnDestroy {
  // Track all active poison effects globally
  private activePoisonObjects: THREE.Object3D[] = [];
  private activePoisonTweens: gsap.core.Tween[] = [];
  @ViewChild('battleCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private character1Mesh: THREE.Group | null = null;
  private character2Mesh: THREE.Group | null = null;
  private animationFrameId: number | null = null;
  private readonly destroy$ = new Subject<void>();
  private cameraOriginalPosition!: THREE.Vector3;
  private lightningBolts: THREE.Mesh[] = [];
  private timeSlowActive = false;
  private readonly targetFps = 30;
  private lastFrameTime = 0;
  private isPaused = false;
  private comboTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private actionToken = 0;
  private readonly visibilityHandler = this.handleVisibilityChange.bind(this);
  private readonly resizeHandler = this.throttleResize.bind(this);
  private lastTime = 0;
  private readonly spiderGroundOffset = 0;
  private particleAnimations: {
    geometry: THREE.BufferGeometry;
    velocities: number[];
    particleCount: number;
  }[] = [];
  private resizeTimeout: ReturnType<typeof setTimeout> | null = null;
  private baseCameraFov = 60;
  private groundWaterTexture: THREE.CanvasTexture | null = null;
  private groundWaterNormalMap: THREE.CanvasTexture | null = null;
  private groundMaterial: THREE.MeshPhysicalMaterial | null = null;

  private readonly battleService = inject(BattleService);
  private circleTexture!: THREE.Texture;

  character1: BattleCharacter | null = null;
  character2: BattleCharacter | null = null;

  constructor() {
    afterNextRender(() => {
      this.createCircleTexture();
      this.initScene();
      this.animate();
      document.addEventListener('visibilitychange', this.visibilityHandler);
      window.addEventListener('resize', this.resizeHandler);
    });
  }

  ngOnInit(): void {
    this.battleService.battleState$.pipe(takeUntil(this.destroy$)).subscribe((state) => {
      if (state) {
        const prevCharacter1 = this.character1;
        const prevCharacter2 = this.character2;

        this.character1 = state.team1[state.activeTeam1Index] || null;
        this.character2 = state.team2[state.activeTeam2Index] || null;

        // Hide defeated characters immediately
        if (this.character1?.health === 0 && this.character1Mesh) {
          this.character1Mesh.visible = false;
        }
        if (this.character2?.health === 0 && this.character2Mesh) {
          this.character2Mesh.visible = false;
        }

        if (!this.character1Mesh && !this.character2Mesh) {
          this.createCharacters();
        } else {
          // Check if character1 changed (different id or character replaced)
          if (prevCharacter1 && this.character1 && prevCharacter1.id !== this.character1.id) {
            this.replaceCharacter(1);
          }
          // Check if character2 changed (different id or character replaced)
          if (prevCharacter2 && this.character2 && prevCharacter2.id !== this.character2.id) {
            this.replaceCharacter(2);
          }
        }
      }
    });

    this.battleService.action$.pipe(takeUntil(this.destroy$)).subscribe((action) => {
      if (action) {
        this.animateAction(action);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    if (this.comboTimeoutId) {
      clearTimeout(this.comboTimeoutId);
      this.comboTimeoutId = null;
    }

    document.removeEventListener('visibilitychange', this.visibilityHandler);
    window.removeEventListener('resize', this.resizeHandler);
    this.particleAnimations = [];
    gsap.killTweensOf('*');
    this.scene?.clear();
    this.renderer?.dispose();
    this.circleTexture?.dispose();
  }

  clearCharacters(): void {
    this.disposeCharacterMesh(this.character1Mesh);
    this.disposeCharacterMesh(this.character2Mesh);
    this.character1Mesh = null;
    this.character2Mesh = null;

    this.character1 = null;
    this.character2 = null;
  }

  private disposeCharacterMesh(mesh: THREE.Group | null): void {
    if (!mesh) return;

    this.scene.remove(mesh);
    mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => {
            mat.map?.dispose();
            mat.emissiveMap?.dispose();
            mat.roughnessMap?.dispose();
            mat.metalnessMap?.dispose();
            mat.normalMap?.dispose();
            mat.dispose();
          });
        } else {
          child.material.map?.dispose();
          child.material.emissiveMap?.dispose();
          child.material.roughnessMap?.dispose();
          child.material.metalnessMap?.dispose();
          child.material.normalMap?.dispose();
          child.material.dispose();
        }
      }
    });
  }

  private createTarantulaPatternTexture(
    baseColor: THREE.Color,
    accentColor: THREE.Color,
  ): THREE.CanvasTexture {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = baseColor.getStyle();
    ctx.fillRect(0, 0, size, size);

    // Subtle gradient for depth and dimension
    const radial = ctx.createRadialGradient(size / 2, size / 2, 20, size / 2, size / 2, size / 2);
    radial.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    radial.addColorStop(0.7, 'rgba(0, 0, 0, 0.1)');
    radial.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, size, size);

    // Chevron pattern down the center (like real tarantulas)
    ctx.strokeStyle = accentColor.getStyle();
    ctx.fillStyle = accentColor.getStyle();
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';

    for (let i = 0; i < 5; i++) {
      const y = (i + 0.5) * (size / 5);
      const centerX = size / 2;
      const chevronWidth = 40 + Math.sin(i * 0.8) * 10;
      const chevronHeight = 15;

      ctx.beginPath();
      ctx.moveTo(centerX - chevronWidth, y - chevronHeight);
      ctx.lineTo(centerX, y);
      ctx.lineTo(centerX + chevronWidth, y - chevronHeight);
      ctx.stroke();
    }

    // Add subtle hair-like texture with fine lines
    ctx.globalAlpha = 0.15;
    ctx.lineWidth = 1;
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const length = 8 + Math.random() * 12;
      const angle = Math.random() * Math.PI * 2;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
      ctx.strokeStyle = i % 3 === 0 ? accentColor.getStyle() : 'rgba(0, 0, 0, 0.6)';
      ctx.stroke();
    }

    // Organic spots with variation
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 25; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const radiusX = 3 + Math.random() * 6;
      const radiusY = 3 + Math.random() * 6;
      const rotation = Math.random() * Math.PI;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.beginPath();
      ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? accentColor.getStyle() : 'rgba(0, 0, 0, 0.5)';
      ctx.fill();
      ctx.restore();
    }

    ctx.globalAlpha = 1;

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1.6, 1.6);
    texture.anisotropy = 4;
    return texture;
  }

  private createCircleTexture(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    this.circleTexture = new THREE.CanvasTexture(canvas);
  }

  private initScene(): void {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const viewport = this.getViewportSettings(width, height);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0b);

    this.baseCameraFov = viewport.fov;
    this.camera = new THREE.PerspectiveCamera(this.baseCameraFov, width / height, 0.1, 1000);

    this.scene.fog = viewport.useFog ? new THREE.FogExp2(0x0a0a0b, 0.08) : null;
    this.camera.position.set(0, viewport.cameraY, viewport.cameraZ);
    this.camera.lookAt(0, 1, 0);
    this.cameraOriginalPosition = this.camera.position.clone();

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    const ambientLight = new THREE.AmbientLight(0x34f5dd, 0.3);
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -15;
    mainLight.shadow.camera.right = 15;
    mainLight.shadow.camera.top = 15;
    mainLight.shadow.camera.bottom = -15;
    this.scene.add(mainLight);

    const tileSize = 1.5;
    const boardSize = 28;
    const groundSize = tileSize * boardSize;

    this.groundWaterTexture = this.createSeaWaterTexture();
    this.groundWaterNormalMap = this.createSeaWaterNormalMap();

    const groundMaterial = new THREE.MeshPhysicalMaterial({
      map: this.groundWaterTexture,
      normalMap: this.groundWaterNormalMap,
      normalScale: new THREE.Vector2(0.7, 0.7),
      color: 0x0055cc,
      roughness: 0.06,
      metalness: 0.05,
      transmission: 0.18,
      thickness: 0.4,
      transparent: true,
      opacity: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      emissive: 0x0b3b40,
      emissiveIntensity: 0.25,
    });
    this.groundMaterial = groundMaterial;

    const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.set(0, 0, 0);
    groundMesh.receiveShadow = true;
    this.scene.add(groundMesh);
  }

  private createSeaWaterTexture(): THREE.CanvasTexture {
    // Large canvas — covers the whole ground as one seamless image, no tiling.
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Deep ocean background gradient
    const bg = ctx.createLinearGradient(0, 0, size, size);
    bg.addColorStop(0, '#001840');
    bg.addColorStop(0.38, '#002d6a');
    bg.addColorStop(0.65, '#003d88');
    bg.addColorStop(1, '#001840');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);

    // Macro colour patches – gives depth variation across the surface
    const patchGrad = ctx.createRadialGradient(
      size * 0.35,
      size * 0.45,
      0,
      size * 0.35,
      size * 0.45,
      size * 0.55,
    );
    patchGrad.addColorStop(0, 'rgba(0,80,180,0.35)');
    patchGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = patchGrad;
    ctx.fillRect(0, 0, size, size);

    // Wave layers – many rows of sinusoidal strokes at varying frequencies
    const waveLayers: {
      color: string;
      amplitude: number;
      frequency: number;
      rows: number;
      lineWidth: number;
    }[] = [
      { color: 'rgba(0,120,210,0.40)', amplitude: 28, frequency: 0.018, rows: 18, lineWidth: 2.8 },
      { color: 'rgba(0,160,230,0.28)', amplitude: 14, frequency: 0.035, rows: 30, lineWidth: 1.8 },
      { color: 'rgba(20,210,240,0.20)', amplitude: 7, frequency: 0.07, rows: 48, lineWidth: 1.1 },
      { color: 'rgba(80,230,255,0.12)', amplitude: 3, frequency: 0.14, rows: 72, lineWidth: 0.7 },
    ];

    for (const layer of waveLayers) {
      ctx.strokeStyle = layer.color;
      ctx.lineWidth = layer.lineWidth;
      for (let r = 0; r < layer.rows; r++) {
        const yBase = ((r + 0.5) / layer.rows) * size;
        const phaseShift = r * 0.63; // stagger each row so they don't align
        ctx.beginPath();
        ctx.moveTo(0, yBase);
        for (let x = 0; x <= size; x += 2) {
          const y =
            yBase +
            Math.sin(x * layer.frequency + phaseShift) * layer.amplitude +
            Math.sin(x * layer.frequency * 0.51 + phaseShift * 1.7) * (layer.amplitude * 0.42);
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }

    // Foam / white-cap streaks
    ctx.strokeStyle = 'rgba(190,245,255,0.14)';
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 120; i++) {
      const fy = Math.random() * size;
      const fx = Math.random() * size;
      const len = 20 + Math.random() * 80;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.quadraticCurveTo(fx + len * 0.5, fy + (Math.random() - 0.5) * 8, fx + len, fy);
      ctx.stroke();
    }

    // Specular glint dots
    ctx.fillStyle = 'rgba(220,250,255,0.11)';
    for (let i = 0; i < 160; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * size,
        Math.random() * size,
        0.8 + Math.random() * 3.2,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    // No tiling – single copy covers the whole ground without seam lines.
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }

  private createSeaWaterNormalMap(): THREE.CanvasTexture {
    // 512px – ALL frequencies are integer multiples of 2π/size so each
    // term wraps back to its starting value at both the right and bottom
    // edges, guaranteeing zero-seam tiling in RepeatWrapping.
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    // k(n) = n * 2π / size  →  sin(x * k(n)) completes exactly n full
    // cycles across [0, size), so the texture tiles with no seam.
    const k = (n: number) => (n * Math.PI * 2) / size;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        // Every coefficient is an integer multiple of 2π/size in BOTH axes,
        // so cross-terms like sin(x*k(4) + y*k(3)) are seamless in x AND y.
        const nx =
          Math.sin(x * k(4) + y * k(3)) * 0.45 +
          Math.sin(x * k(7) + y * k(5)) * 0.3 +
          Math.sin(x * k(11) - y * k(8)) * 0.25;
        const ny =
          Math.cos(y * k(4) + x * k(3)) * 0.45 +
          Math.cos(y * k(7) + x * k(5)) * 0.3 +
          Math.cos(y * k(11) - x * k(8)) * 0.25;
        const idx = (y * size + x) * 4;
        data[idx] = Math.round((nx * 0.5 + 0.5) * 255); // R → tangent X
        data[idx + 1] = Math.round((ny * 0.5 + 0.5) * 255); // G → tangent Y
        data[idx + 2] = 255; // B → surface Z
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }

  private replaceCharacter(characterNumber: 1 | 2): void {
    const character = characterNumber === 1 ? this.character1 : this.character2;
    if (!character) return;

    const oldMesh = characterNumber === 1 ? this.character1Mesh : this.character2Mesh;

    // Remove old mesh
    this.disposeCharacterMesh(oldMesh);

    // Create new mesh with teleportation entrance effect
    const newMesh = this.createEnhancedCharacterMesh(character.color, character.position);

    if (characterNumber === 1) {
      newMesh.rotation.y = Math.PI / 3;
      this.character1Mesh = newMesh;
    } else {
      newMesh.scale.x = -1;
      newMesh.rotation.y = -Math.PI / 3;
      this.character2Mesh = newMesh;
    }

    this.scene.add(newMesh);
    this.createTeleportationEntrance(
      newMesh,
      character.position,
      characterNumber === 1 ? 'left' : 'right',
    );
  }

  private createCharacters(): void {
    if (!this.character1 || !this.character2) return;

    const character1Mesh = this.createEnhancedCharacterMesh(
      this.character1.color,
      this.character1.position,
    );
    character1Mesh.rotation.y = Math.PI / 3;
    this.scene.add(character1Mesh);

    const character2Mesh = this.createEnhancedCharacterMesh(
      this.character2.color,
      this.character2.position,
    );
    character2Mesh.scale.x = -1;
    character2Mesh.rotation.y = -Math.PI / 3;
    this.scene.add(character2Mesh);

    this.character1Mesh = character1Mesh;
    this.character2Mesh = character2Mesh;

    this.createTeleportationEntrance(character1Mesh, this.character1.position, 'left');
    this.createTeleportationEntrance(character2Mesh, this.character2.position, 'right');
  }

  private createEnhancedCharacterMesh(color: string, position: Position3d): THREE.Group {
    const group = new THREE.Group();
    const themeColor = new THREE.Color(color);
    const whiteColor = new THREE.Color('#ffffff');
    const deepShadow = new THREE.Color(0x0a0a0a).lerp(themeColor, 0.35);
    const patternTexture = this.createTarantulaPatternTexture(deepShadow, themeColor);

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xffffff).lerp(whiteColor, 0.85),
      roughness: 0.2,
      metalness: 0.1,
      emissive: whiteColor,
      emissiveIntensity: 2.5,
    });

    const cephaloMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x1a1a1a).lerp(themeColor, 0.9),
      roughness: 0.9,
      metalness: 0.1,
      map: patternTexture,
      emissive: themeColor,
      emissiveIntensity: 0.2,
    });

    const cephaloGeometry = new THREE.SphereGeometry(0.48, 20, 20);
    cephaloGeometry.scale(1.2, 0.48, 1.44);
    const cephalothorax = new THREE.Mesh(cephaloGeometry, cephaloMaterial);
    cephalothorax.position.set(0, 0.45, 0.18);
    cephalothorax.castShadow = true;
    cephalothorax.receiveShadow = true;
    group.add(cephalothorax);

    const cheliceraMaterial = bodyMaterial;

    for (let side = 0; side < 2; side++) {
      const sideMultiplier = side === 0 ? -1 : 1;
      const cheliceraGroup = new THREE.Group();

      const cheliceraBaseGeometry = new THREE.CylinderGeometry(0.07, 0.1, 0.18, 10);
      const cheliceraBase = new THREE.Mesh(cheliceraBaseGeometry, cheliceraMaterial);
      cheliceraBase.position.set(0.12 * sideMultiplier, 0.26, 0.52);
      cheliceraBase.rotation.x = Math.PI / 8;
      cheliceraBase.rotation.z = (Math.PI / 10) * sideMultiplier;
      cheliceraBase.castShadow = true;
      cheliceraBase.receiveShadow = true;
      cheliceraGroup.add(cheliceraBase);

      const fangGeometry = new THREE.ConeGeometry(0.06, 0.4, 20);
      const fang = new THREE.Mesh(fangGeometry, cheliceraMaterial);
      fang.position.set(0.14 * sideMultiplier, 0.14, 0.6);
      fang.rotation.x = Math.PI / 2 + Math.PI / 10;
      fang.rotation.z = (Math.PI / 12) * sideMultiplier;
      fang.castShadow = true;
      fang.receiveShadow = true;
      cheliceraGroup.add(fang);

      group.add(cheliceraGroup);
    }

    const legMaterial = bodyMaterial;

    const legAngles = [Math.PI / 5, Math.PI / 12, -Math.PI / 12, -Math.PI / 4];

    const addJointAtEnds = (
      legParent: THREE.Group,
      segment: THREE.Mesh,
      segmentLength: number,
      radius: number,
    ): void => {
      const jointGeometry = new THREE.SphereGeometry(radius, 12, 12);

      const addJoint = (offsetY: number) => {
        const joint = new THREE.Mesh(jointGeometry, legMaterial);
        const jointAnchor = new THREE.Object3D();
        jointAnchor.position.copy(segment.position);
        jointAnchor.rotation.copy(segment.rotation);
        joint.position.set(0, offsetY, 0);
        joint.castShadow = true;
        joint.receiveShadow = true;
        jointAnchor.add(joint);
        legParent.add(jointAnchor);
      };

      addJoint(segmentLength / 2);
    };

    for (let side = 0; side < 2; side++) {
      const sideMultiplier = side === 0 ? -1 : 1;

      for (let legNum = 0; legNum < 4; legNum++) {
        const legGroup = new THREE.Group();

        const legAngle = legAngles[legNum] * (side === 0 ? 1 : -1);
        const zAngle = (Math.PI / 2.8 + legNum * 0.05) * sideMultiplier;

        const upperLegLength = 0.5;
        const middleLegLength = 0.55;
        const lowerLegLength = 0.7;

        const upperLegSegmentGeometry = new THREE.CylinderGeometry(0.12, 0.08, upperLegLength, 10);

        const upperLeg = new THREE.Mesh(upperLegSegmentGeometry, legMaterial);
        upperLeg.position.set(0.2 * sideMultiplier, -0.1, 0);
        upperLeg.rotation.z = zAngle * 1.2;
        upperLeg.castShadow = true;
        upperLeg.receiveShadow = true;
        legGroup.add(upperLeg);

        for (let h = 0; h < 22; h++) {
          const bristleGeometry = new THREE.CylinderGeometry(0.012, 0.006, 0.22, 4);
          const bristle = new THREE.Mesh(bristleGeometry, legMaterial);
          const bristleAngle = (h / 8) * Math.PI * 2;
          bristle.position.set(
            0.25 * sideMultiplier + Math.cos(bristleAngle) * 0.08,
            -0.1 + Math.sin(bristleAngle) * 0.08,
            0,
          );
          bristle.rotation.z = zAngle * 1.15 + (Math.random() - 0.5) * 0.35;
          bristle.rotation.y = bristleAngle;
          legGroup.add(bristle);
        }

        const middleLegSegmentGeometry = new THREE.CylinderGeometry(0.1, 0.06, middleLegLength, 10);

        const middleLeg = new THREE.Mesh(middleLegSegmentGeometry, legMaterial);
        middleLeg.position.set(0.65 * sideMultiplier, -0.28, 0);
        middleLeg.rotation.z = zAngle * 0.75;
        middleLeg.castShadow = true;
        middleLeg.receiveShadow = true;
        legGroup.add(middleLeg);

        addJointAtEnds(legGroup, middleLeg, middleLegLength, 0.07);

        for (let h = 0; h < 10; h++) {
          const bristleGeometry = new THREE.CylinderGeometry(0.014, 0.006, 0.17, 4);
          const bristle = new THREE.Mesh(bristleGeometry, legMaterial);
          const bristleAngle = (h / 8) * Math.PI * 2;
          bristle.position.set(
            0.6 * sideMultiplier + Math.cos(bristleAngle) * 0.08,
            -0.2 + Math.sin(bristleAngle) * 0.03,
            0,
          );
          bristle.rotation.z = zAngle * 0.95 + (Math.random() - 0.5) * 0.4;
          bristle.rotation.y = bristleAngle;
          legGroup.add(bristle);
        }

        for (let h = 0; h < 8; h++) {
          const bristleGeometry = new THREE.CylinderGeometry(0.012, 0.005, 0.15, 4);
          const bristle = new THREE.Mesh(bristleGeometry, legMaterial);
          const bristleAngle = (h / 6) * Math.PI * 2;
          bristle.position.set(
            0.7 * sideMultiplier + Math.cos(bristleAngle) * 0.06,
            -0.28 + Math.sin(bristleAngle) * 0.06,
            0,
          );
          bristle.rotation.z = zAngle * 0.7 + (Math.random() - 0.5) * 0.3;
          bristle.rotation.y = bristleAngle;
          legGroup.add(bristle);
        }

        const lowerLegGeometry = new THREE.CylinderGeometry(0.07, 0.03, lowerLegLength, 10);
        const lowerLeg = new THREE.Mesh(lowerLegGeometry, legMaterial);
        lowerLeg.position.set(1.025 * sideMultiplier, -0.7, 0);
        lowerLeg.rotation.z = (Math.PI / 5.3) * sideMultiplier;
        lowerLeg.castShadow = true;
        lowerLeg.receiveShadow = true;
        legGroup.add(lowerLeg);

        for (let h = 0; h < 10; h++) {
          const bristleGeometry = new THREE.CylinderGeometry(0.012, 0.005, 0.08, 4);
          const bristle = new THREE.Mesh(bristleGeometry, legMaterial);
          const bristleAngle = (h / 7) * Math.PI * 2;
          bristle.position.set(
            0.925 * sideMultiplier + Math.cos(bristleAngle) * 0.07,
            -0.55 + Math.sin(bristleAngle) * 0.07,
            0,
          );
          bristle.rotation.z = (Math.PI / 8) * sideMultiplier + (Math.random() - 0.5) * 0.4;
          bristle.rotation.y = bristleAngle;
          legGroup.add(bristle);
        }

        for (let h = 0; h < 6; h++) {
          const bristleGeometry = new THREE.CylinderGeometry(0.01, 0.004, 0.12, 4);
          const bristle = new THREE.Mesh(bristleGeometry, legMaterial);
          const bristleAngle = (h / 4) * Math.PI * 2;
          bristle.position.set(
            1.025 * sideMultiplier + Math.cos(bristleAngle) * 0.05,
            -0.7 + Math.sin(bristleAngle) * 0.05,
            0,
          );
          bristle.rotation.z = (Math.PI / 6) * sideMultiplier + (Math.random() - 0.5) * 0.3;
          bristle.rotation.y = bristleAngle;
          legGroup.add(bristle);
        }

        const legPositions = [0.5, 0.25, 0.0, -0.2];
        const zOffset = legPositions[legNum];

        legGroup.rotation.y = legAngle;

        legGroup.position.set(0.4 * sideMultiplier, 0.3, zOffset);

        group.add(legGroup);

        const baseRotationY = legAngle;
        const baseRotationX = -0.02 + (Math.random() - 0.5) * 0.04;
        const baseRotationZ = (Math.PI / 120) * sideMultiplier + (Math.random() - 0.5) * 0.02;
        legGroup.rotation.set(baseRotationX, baseRotationY, baseRotationZ);

        const animateLegRandomly = () => {
          const stride = 0.08 + Math.random() * 0.08;
          const lift = 0.08 + Math.random() * 0.08;
          const splay = 0;
          const moveDuration = 0.32 + Math.random() * 0.45;
          const settleDuration = 0.22 + Math.random() * 0.35;
          const pauseDuration = 2 + Math.random() * 8;
          const twitchChance = Math.random();

          const timeline = gsap.timeline({
            onComplete: () => {
              gsap.delayedCall(pauseDuration, animateLegRandomly);
            },
          });

          timeline
            .to(legGroup.rotation, {
              x: baseRotationX - lift,
              y: baseRotationY - stride,
              z: baseRotationZ + splay * sideMultiplier,
              duration: moveDuration * 0.9,
              ease: 'sine.out',
            })
            .to(legGroup.rotation, {
              x: baseRotationX + lift * 0.35,
              y: baseRotationY + stride,
              z: baseRotationZ - 0,
              duration: moveDuration * 1.2,
              ease: 'sine.in',
            })
            .to(legGroup.rotation, {
              x: baseRotationX,
              y: baseRotationY,
              z: baseRotationZ,
              duration: settleDuration,
              ease: 'power2.out',
            });

          if (twitchChance < 0.35) {
            timeline.to(legGroup.rotation, {
              x: baseRotationX + (Math.random() * 0.08 - 0.04),
              y: baseRotationY + (Math.random() * 0.12 - 0.06),
              z: baseRotationZ + (Math.random() * 0.12 - 0.06) * sideMultiplier,
              duration: 2 + Math.random() * 0.08,
              ease: 'power3.inOut',
            });
          }
        };

        const initialDelay = 2 + Math.random() * 8;
        gsap.delayedCall(initialDelay, animateLegRandomly);
      }
    }

    const venomGeometry = new THREE.SphereGeometry(0.75, 30, 30);

    const venomSacMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x121212).lerp(themeColor, 0.7),
      roughness: 0.85,
      metalness: 0.1,
      map: patternTexture,
      emissive: themeColor,
      emissiveIntensity: 0.15,
    });

    const venomSac = new THREE.Mesh(venomGeometry, venomSacMaterial);
    venomSac.position.set(0, 0.9, -0.7);
    group.add(venomSac);

    const venomAnimationDelay = Math.random() * 1.5;
    gsap.to(venomSac.scale, {
      x: 1.05,
      y: 1.05,
      z: 1.05,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: venomAnimationDelay,
    });

    group.position.set(position.x, position.y + this.spiderGroundOffset, position.z);
    return group;
  }

  private createTeleportationEntrance(
    characterMesh: THREE.Group,
    targetPos: Position3d,
    side: 'left' | 'right',
  ): void {
    characterMesh.position.set(targetPos.x, targetPos.y + this.spiderGroundOffset, targetPos.z);
    characterMesh.scale.set(0.01, 0.01, 0.01);
    characterMesh.visible = false;

    const timeline = gsap.timeline();

    timeline.call(() => {
      characterMesh.visible = true;
    });

    timeline.to(characterMesh.scale, {
      x: side === 'right' ? -1 : 1,
      y: 1,
      z: 1,
      duration: 0.8,
      ease: 'elastic.out(1, 0.5)',
    });
  }

  private cleanupPoisonEffects(): void {
    // Remove all poison objects from scene and kill their tweens
    this.activePoisonObjects.forEach((obj) => {
      if (obj.parent) this.scene.remove(obj);
    });
    this.activePoisonObjects = [];
    this.activePoisonTweens.forEach((tween) => tween.kill());
    this.activePoisonTweens = [];
  }

  private animatePoisonTick(defender: THREE.Group, action: BattleAction): void {
    const poisonGroup = new THREE.Group();
    poisonGroup.position.copy(defender.position);
    poisonGroup.position.y += 1.1;
    this.scene.add(poisonGroup);

    const toxicColor = new THREE.Color(0x7cff6b);
    const emissiveColor = new THREE.Color(0x35ff7a);

    const ringGeometry = new THREE.TorusGeometry(1.4, 0.08, 18, 80);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: toxicColor,
      emissive: emissiveColor,
      emissiveIntensity: 1.3,
      transparent: true,
      opacity: 0.85,
    });

    const ring1 = new THREE.Mesh(ringGeometry, ringMaterial);
    ring1.rotation.x = Math.PI / 2;
    poisonGroup.add(ring1);

    const ring2 = new THREE.Mesh(ringGeometry, ringMaterial.clone());
    ring2.rotation.x = Math.PI / 2;
    ring2.rotation.z = Math.PI / 3;
    ring2.scale.set(0.7, 0.7, 0.7);
    poisonGroup.add(ring2);

    const poisonLight = new THREE.PointLight(0x7cff6b, 3, 6);
    poisonLight.position.copy(poisonGroup.position);
    poisonLight.position.y += 0.4;
    this.scene.add(poisonLight);

    const sporeSprites: THREE.Sprite[] = [];
    const sporeMaterial = new THREE.SpriteMaterial({
      map: this.circleTexture,
      color: 0x7cff6b,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    for (let i = 0; i < 16; i++) {
      const sprite = new THREE.Sprite(sporeMaterial.clone());
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.4 + Math.random() * 0.8;
      sprite.position.set(
        Math.cos(angle) * radius,
        0.2 + Math.random() * 0.8,
        Math.sin(angle) * radius,
      );
      const scale = 0.2 + Math.random() * 0.35;
      sprite.scale.set(scale, scale, scale);
      poisonGroup.add(sprite);
      sporeSprites.push(sprite);
    }

    const materialSnapshots: Array<{
      material: THREE.Material;
      color?: THREE.Color;
      emissive?: THREE.Color;
      emissiveIntensity?: number;
    }> = [];

    defender.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        const mat = material as THREE.MeshStandardMaterial;
        const snapshot: {
          material: THREE.Material;
          color?: THREE.Color;
          emissive?: THREE.Color;
          emissiveIntensity?: number;
        } = { material: mat };
        if ('color' in mat && mat.color) {
          snapshot.color = mat.color.clone();
        }
        if ('emissive' in mat && mat.emissive) {
          snapshot.emissive = mat.emissive.clone();
          snapshot.emissiveIntensity = mat.emissiveIntensity;
        }
        materialSnapshots.push(snapshot);
      });
    });

    const poisonTweens: gsap.core.Tween[] = [];

    materialSnapshots.forEach((snapshot) => {
      const mat = snapshot.material as THREE.MeshStandardMaterial;
      if (snapshot.color) {
        poisonTweens.push(
          gsap.to(mat.color, {
            r: toxicColor.r,
            g: toxicColor.g,
            b: toxicColor.b,
            duration: 0.25,
            yoyo: true,
            repeat: 1,
            ease: 'sine.inOut',
            onComplete: () => {
              if (snapshot.color) mat.color.copy(snapshot.color);
            },
          }),
        );
      }
      if (snapshot.emissive) {
        poisonTweens.push(
          gsap.to(mat.emissive, {
            r: emissiveColor.r,
            g: emissiveColor.g,
            b: emissiveColor.b,
            duration: 0.25,
            yoyo: true,
            repeat: 1,
            ease: 'sine.inOut',
            onComplete: () => {
              if (snapshot.emissive) mat.emissive.copy(snapshot.emissive);
            },
          }),
        );
        poisonTweens.push(
          gsap.to(mat, {
            emissiveIntensity: (snapshot.emissiveIntensity ?? 0.6) + 0.8,
            duration: 0.25,
            yoyo: true,
            repeat: 1,
            ease: 'sine.inOut',
            onComplete: () => {
              mat.emissiveIntensity = snapshot.emissiveIntensity ?? mat.emissiveIntensity;
            },
          }),
        );
      }
    });

    poisonTweens.push(
      gsap.to(ring1.scale, {
        x: 1.9,
        y: 1.9,
        z: 1.9,
        duration: 0.7,
        ease: 'power2.out',
      }),
    );
    poisonTweens.push(
      gsap.to(ring1.material, {
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out',
      }),
    );
    poisonTweens.push(
      gsap.to(ring2.scale, {
        x: 2.3,
        y: 2.3,
        z: 2.3,
        duration: 0.8,
        ease: 'power2.out',
        delay: 0.05,
      }),
    );
    poisonTweens.push(
      gsap.to(ring2.material, {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        delay: 0.05,
      }),
    );

    poisonTweens.push(
      gsap.to(ring1.rotation, {
        z: Math.PI * 1.2,
        duration: 0.7,
        ease: 'power2.out',
      }),
    );
    poisonTweens.push(
      gsap.to(ring2.rotation, {
        z: -Math.PI * 1.2,
        duration: 0.8,
        ease: 'power2.out',
      }),
    );

    sporeSprites.forEach((sprite) => {
      const driftAngle = Math.random() * Math.PI * 2;
      const driftRadius = 0.6 + Math.random() * 0.8;
      const driftDelay = Math.random() * 0.15;
      poisonTweens.push(
        gsap.to(sprite.position, {
          x: Math.cos(driftAngle) * driftRadius,
          y: sprite.position.y + 1 + Math.random() * 0.6,
          z: Math.sin(driftAngle) * driftRadius,
          duration: 0.9,
          delay: driftDelay,
          ease: 'power2.out',
        }),
      );
      poisonTweens.push(
        gsap.to(sprite.material, {
          opacity: 0,
          duration: 0.9,
          delay: driftDelay,
          ease: 'power2.out',
        }),
      );
    });

    poisonTweens.push(
      gsap.to(poisonLight, {
        intensity: 0,
        duration: 0.7,
        ease: 'power2.out',
        onComplete: () => {
          this.scene.remove(poisonLight);
        },
      }),
    );

    this.activePoisonObjects.push(poisonGroup, poisonLight);
    this.activePoisonTweens.push(...poisonTweens);

    const cleanupTween = gsap.delayedCall(0.95, () => {
      this.scene.remove(poisonGroup);
      ringGeometry.dispose();
      ringMaterial.dispose();
      (ring2.material as THREE.Material).dispose();
      sporeSprites.forEach((sprite) => {
        if (sprite.material instanceof THREE.Material) {
          sprite.material.dispose();
        }
      });
    });

    this.createMassiveImpact(defender.position, action);
    this.activePoisonTweens.push(cleanupTween);
  }

  private animateAction(action: BattleAction): void {
    // Always cleanup poison effects before starting a new action
    this.cleanupPoisonEffects();
    this.actionToken += 1;
    const currentActionToken = this.actionToken;
    if (this.comboTimeoutId) {
      clearTimeout(this.comboTimeoutId);
      this.comboTimeoutId = null;
    }
    const isChar1Attacker = this.character1 ? action.attackerId === this.character1.id : false;
    const isChar2Attacker = this.character2 ? action.attackerId === this.character2.id : false;
    const attacker = isChar1Attacker
      ? this.character1Mesh
      : isChar2Attacker
        ? this.character2Mesh
        : null;

    const isChar1Defender = this.character1 ? action.defenderId === this.character1.id : false;
    const isChar2Defender = this.character2 ? action.defenderId === this.character2.id : false;
    const defender = isChar1Defender
      ? this.character1Mesh
      : isChar2Defender
        ? this.character2Mesh
        : null;

    if (action.type === 'poison' && !action.attackerId) {
      if (defender) {
        this.animatePoisonTick(defender, action);
      }
      return;
    }

    if (!attacker || !defender) return;

    // Kill any previous tweens on attacker and defender to prevent overlap
    gsap.killTweensOf(attacker.position);
    gsap.killTweensOf(attacker.rotation);
    gsap.killTweensOf(attacker.scale);
    gsap.killTweensOf(defender.position);
    gsap.killTweensOf(defender.rotation);
    gsap.killTweensOf(defender.scale);

    const runAttackAnimation = (impactActionType: BattleActionType): gsap.core.Timeline => {
      const isCritical = impactActionType === 'critical';
      const isBlocked = impactActionType === 'miss';
      const isPoisoned = impactActionType === 'poison';
      const isSkip = impactActionType === 'skip';
      const impactAction: BattleAction = { ...action, type: impactActionType };

      this.cinematicCameraZoom(attacker, defender, isCritical);

      const attackerBasePosition = this.getCharacterBasePosition(isChar1Attacker, attacker);
      const defenderBasePosition = this.getCharacterBasePosition(!isChar1Attacker, defender);
      const originalPos = { ...attackerBasePosition };
      const timeline = gsap.timeline();

      // Reset transforms to base state before animating
      attacker.position.set(attackerBasePosition.x, attackerBasePosition.y, attackerBasePosition.z);
      attacker.rotation.set(0, isChar1Attacker ? Math.PI / 3 : -Math.PI / 3, 0);
      attacker.scale.set(isChar1Attacker ? 1 : -1, 1, 1);
      defender.position.set(defenderBasePosition.x, defenderBasePosition.y, defenderBasePosition.z);
      defender.rotation.set(0, !isChar1Attacker ? Math.PI / 3 : -Math.PI / 3, 0);
      defender.scale.set(!isChar1Attacker ? 1 : -1, 1, 1);

      // Poison effect tracking
      let poisonCleanup: (() => void) | null = null;
      if (isPoisoned) {
        poisonCleanup = this.createChargingEffect(attacker, isCritical);
      }

      if (isBlocked) {
        timeline.call(() => {
          this.createEnergyShield(defender);
        });
      }

      if (isSkip) {
        return timeline; // No further animation for skip, but return timeline for potential chaining
      }

      if (isCritical) {
        this.timeSlowActive = true;
        timeline.call(() => {
          this.createLightningStrike(attacker.position, defender.position);
        });
      }

      const attackerScaleX = isChar1Attacker ? 1.3 : -1.3;
      timeline.to(attacker.scale, {
        x: attackerScaleX,
        y: 0.7,
        z: 1.3,
        duration: 0.2,
        ease: 'power2.in',
      });

      timeline.to(
        attacker.rotation,
        {
          y: isChar1Attacker ? Math.PI + Math.PI * 2 : -Math.PI - Math.PI * 2,
          duration: 0.15,
          ease: 'power4.inOut',
        },
        '<',
      );

      timeline.to(attacker.position, {
        x: isChar1Attacker ? defenderBasePosition.x - 0.9 : defenderBasePosition.x + 0.9,
        y: defenderBasePosition.y + 1,
        z: isChar1Attacker ? defenderBasePosition.z - 1 : defenderBasePosition.z + 1,
        duration: 0.15,
        ease: 'power4.inOut',
        onComplete: () => {
          this.createMassiveImpact(defender.position, impactAction);
          this.createEnergyWave(defender.position, isCritical);

          if (isCritical) {
            this.screenFlash();
          }

          const defenderTimeline = gsap.timeline();

          if (!isBlocked) {
            defenderTimeline.to(defender.position, {
              y: defender.position.y + 0.5,
              duration: 0.06,
              ease: 'power4.out',
            });

            defenderTimeline.to(
              defender.rotation,
              {
                z: (isChar1Attacker ? 1 : -1) * 0.8,
                y: (isChar1Attacker ? 1 : -1) * Math.PI * 0.25,
                x: 0.5,
                duration: 0.06,
                ease: 'power3.out',
              },
              '<',
            );

            const defenderScaleX = isChar1Attacker ? -0.6 : 0.6;
            defenderTimeline.to(
              defender.scale,
              {
                x: defenderScaleX,
                y: 0.6,
                z: 0.75,
                duration: 0.06,
                ease: 'power3.in',
              },
              '<',
            );

            defenderTimeline.to(defender.position, {
              x: defender.position.x + (isChar1Attacker ? 1.8 : -1.8),
              y: defender.position.y + 1.2,
              z: defender.position.z + (isChar1Attacker ? 0.6 : -0.6),
              duration: 0.18,
              ease: 'power3.out',
            });

            defenderTimeline.to(
              defender.rotation,
              {
                z: (isChar1Attacker ? 1 : -1) * Math.PI * 1.2,
                y: (isChar1Attacker ? 1 : -1) * Math.PI * 0.6,
                x: Math.PI * 0.8,
                duration: 0.18,
                ease: 'power2.out',
              },
              '<',
            );

            defenderTimeline.to(
              defender.scale,
              {
                x: isChar1Attacker ? -1.1 : 1.1,
                y: 0.85,
                z: 1.05,
                duration: 0.12,
                ease: 'power1.out',
              },
              '<',
            );

            defenderTimeline.to(defender.position, {
              x: defender.position.x + (isChar1Attacker ? 2.5 : -2.5),
              y: defender.position.y + 0.2,
              z: defender.position.z + (isChar1Attacker ? 0.4 : -0.4),
              duration: 0.2,
              ease: 'power1.in',
            });

            defenderTimeline.to(
              defender.rotation,
              {
                z: (isChar1Attacker ? 1 : -1) * Math.PI * 2.2,
                y: (isChar1Attacker ? 1 : -1) * Math.PI * 1.1,
                x: Math.PI * 1.3,
                duration: 0.2,
                ease: 'power1.in',
              },
              '<',
            );

            defenderTimeline.to(
              defender.scale,
              {
                x: isChar1Attacker ? -0.9 : 0.9,
                y: 1.1,
                z: 0.9,
                duration: 0.15,
                ease: 'elastic.out(1.5, 0.6)',
              },
              '<',
            );
          } else {
            defenderTimeline.to(defender.position, {
              y: defender.position.y + 0.2,
              duration: 0.08,
              ease: 'power2.out',
            });

            defenderTimeline.to(
              defender.rotation,
              {
                x: -0.1,
                duration: 0.08,
                ease: 'power2.out',
              },
              '<',
            );

            defenderTimeline.to(defender.position, {
              y: defender.position.y,
              duration: 0.15,
              ease: 'bounce.out',
            });

            defenderTimeline.to(
              defender.rotation,
              {
                x: 0,
                duration: 0.15,
                ease: 'power2.out',
              },
              '<',
            );
          }
        },
      });

      timeline.to(attacker.position, {
        x: originalPos.x,
        y: originalPos.y + 3,
        z: originalPos.z,
        duration: 0.4,
        ease: 'power2.in',
      });

      timeline.to(
        attacker.rotation,
        {
          x: Math.PI * 2,
          duration: 0.4,
          ease: 'power2.in',
        },
        '<',
      );

      timeline.to(attacker.position, {
        x: originalPos.x,
        y: originalPos.y,
        z: originalPos.z,
        duration: 0.3,
        ease: 'bounce.out',
      });

      timeline.to(
        attacker.rotation,
        {
          x: 0,
          y: isChar1Attacker ? Math.PI / 3 : -Math.PI / 3,
          duration: 0.3,
        },
        '<',
      );

      timeline.to(attacker.scale, {
        x: isChar1Attacker ? 1 : -1,
        y: 1,
        z: 1,
        duration: 0.2,
      });

      if (!isBlocked) {
        timeline.to(
          defender.position,
          {
            x: defenderBasePosition.x,
            y: defenderBasePosition.y,
            z: defenderBasePosition.z,
            duration: 0.5,
            ease: 'power2.inOut',
          },
          '-=0.5',
        );

        timeline.to(
          defender.rotation,
          {
            z: 0,
            y: isChar1Attacker ? -Math.PI / 3 : Math.PI / 3,
            x: 0,
            duration: 0.5,
            ease: 'elastic.out(1, 0.5)',
          },
          '<',
        );

        timeline.to(
          defender.scale,
          {
            x: isChar1Attacker ? -1 : 1,
            y: 1,
            z: 1,
            duration: 0.3,
            ease: 'elastic.out(1.1, 0.4)',
          },
          '<+=0.1',
        );
      }

      timeline.call(() => {
        // Reset transforms to base state after animation
        attacker.position.set(
          attackerBasePosition.x,
          attackerBasePosition.y,
          attackerBasePosition.z,
        );
        attacker.rotation.set(0, isChar1Attacker ? Math.PI / 3 : -Math.PI / 3, 0);
        attacker.scale.set(isChar1Attacker ? 1 : -1, 1, 1);
        defender.position.set(
          defenderBasePosition.x,
          defenderBasePosition.y,
          defenderBasePosition.z,
        );
        defender.rotation.set(0, !isChar1Attacker ? Math.PI / 3 : -Math.PI / 3, 0);
        defender.scale.set(!isChar1Attacker ? 1 : -1, 1, 1);
        this.resetCamera();
        this.timeSlowActive = false;
        // Cleanup poison effect if present
        if (poisonCleanup) poisonCleanup();
      });

      return timeline;
    };

    if (action.type === 'shield') {
      this.createEnergyShield(attacker);
      return;
    }

    if (action.type === 'combo') {
      const firstTimeline = runAttackAnimation('attack');
      this.comboTimeoutId = setTimeout(
        () => {
          if (this.actionToken !== currentActionToken) {
            return;
          }
          runAttackAnimation('attack');
          this.comboTimeoutId = null;
        },
        (firstTimeline.duration() + 0.1) * 500,
      );
      return;
    }

    runAttackAnimation(action.type);
  }

  private getCharacterBasePosition(
    isCharacter1: boolean,
    characterMesh: THREE.Group,
  ): { x: number; y: number; z: number } {
    const character = isCharacter1 ? this.character1 : this.character2;

    if (!character) {
      return {
        x: characterMesh.position.x,
        y: characterMesh.position.y,
        z: characterMesh.position.z,
      };
    }

    return {
      x: character.position.x,
      y: character.position.y + this.spiderGroundOffset,
      z: character.position.z,
    };
  }

  private createChargingEffect(attacker: THREE.Group, isCritical: boolean): () => void {
    const venomColor = isCritical ? 0xff0000 : 0x00ff00;
    const chargeLight = new THREE.PointLight(venomColor, 5, 5);
    chargeLight.position.copy(attacker.position);
    chargeLight.position.y += 1;
    this.scene.add(chargeLight);

    const poisonObjects: THREE.Object3D[] = [];
    const poisonTweens: gsap.core.Tween[] = [];
    for (let i = 0; i < 12; i++) {
      const dropletGeometry = new THREE.SphereGeometry(0.12, 8, 8);
      dropletGeometry.scale(1, 1.5, 1);
      const dropletMaterial = new THREE.MeshBasicMaterial({
        color: venomColor,
        transparent: true,
        opacity: 0.9,
      });
      const droplet = new THREE.Mesh(dropletGeometry, dropletMaterial);

      const angle = (i / 12) * Math.PI * 2;
      const radius = 1.5;
      droplet.position.set(
        attacker.position.x + Math.cos(angle) * radius,
        attacker.position.y + 1,
        attacker.position.z + Math.sin(angle) * radius,
      );
      this.scene.add(droplet);
      poisonObjects.push(droplet);

      const tween = gsap.to(droplet.position, {
        x: attacker.position.x,
        y: attacker.position.y + 0.5,
        z: attacker.position.z,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: () => {
          this.scene.remove(droplet);
          dropletGeometry.dispose();
          dropletMaterial.dispose();
        },
      });
      poisonTweens.push(tween);
    }

    this.scene.add(chargeLight);
    poisonObjects.push(chargeLight);

    const chargeTween = gsap.to(chargeLight, {
      intensity: isCritical ? 30 : 20,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => {
        const fadeTween = gsap.to(chargeLight, {
          intensity: 0,
          duration: 0.2,
          onComplete: () => {
            this.scene.remove(chargeLight);
          },
        });
        poisonTweens.push(fadeTween);
      },
    });
    poisonTweens.push(chargeTween);

    // Register globally for cleanup
    this.activePoisonObjects.push(...poisonObjects);
    this.activePoisonTweens.push(...poisonTweens);
    // Return cleanup function
    return () => {
      poisonObjects.forEach((obj) => {
        if (obj.parent) this.scene.remove(obj);
      });
      poisonTweens.forEach((tween) => tween.kill());
    };
  }

  private createEnergyShield(defender: THREE.Group): void {
    const shieldGroup = new THREE.Group();
    shieldGroup.position.copy(defender.position);
    shieldGroup.position.y += 1;
    this.scene.add(shieldGroup);

    // Outer hexagonal shield with energy flow
    const outerShieldGeometry = new THREE.IcosahedronGeometry(2.5, 2);
    const outerShieldMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.6,
      wireframe: true,
      side: THREE.DoubleSide,
      emissive: 0x00ffff,
      emissiveIntensity: 0.8,
    });
    const outerShield = new THREE.Mesh(outerShieldGeometry, outerShieldMaterial);
    shieldGroup.add(outerShield);

    // Middle solid energy layer
    const middleShieldGeometry = new THREE.SphereGeometry(2.2, 32, 32);
    const middleShieldMaterial = new THREE.MeshPhongMaterial({
      color: 0x4499ff,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
      emissive: 0x2266ff,
      emissiveIntensity: 1.2,
    });
    const middleShield = new THREE.Mesh(middleShieldGeometry, middleShieldMaterial);
    shieldGroup.add(middleShield);

    // Inner core with pulsing energy
    const innerShieldGeometry = new THREE.IcosahedronGeometry(1.8, 1);
    const innerShieldMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      wireframe: true,
      side: THREE.DoubleSide,
    });
    const innerShield = new THREE.Mesh(innerShieldGeometry, innerShieldMaterial);
    shieldGroup.add(innerShield);

    // Energy particles around shield
    const particleCount = 80;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities: number[] = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2 + Math.random() * 1.5;
      const height = (Math.random() - 0.5) * 3;

      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = height;
      particlePositions[i * 3 + 2] = Math.sin(angle) * radius;

      particleVelocities.push(angle, Math.random() * 0.02 + 0.01);
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.15,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    shieldGroup.add(particles);

    // Expanding energy rings
    const rings: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const ringGeometry = new THREE.TorusGeometry(1.5, 0.1, 16, 50);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      ring.scale.set(0.1, 0.1, 0.1);
      shieldGroup.add(ring);
      rings.push(ring);

      gsap.to(ring.scale, {
        x: 2,
        y: 2,
        z: 2,
        duration: 0.8,
        delay: i * 0.1,
        ease: 'power2.out',
      });

      gsap.to(ringMaterial, {
        opacity: 0,
        duration: 0.8,
        delay: i * 0.1,
      });
    }

    // Dynamic bright lights
    const mainLight = new THREE.PointLight(0x00ffff, 30, 8);
    mainLight.position.copy(shieldGroup.position);
    this.scene.add(mainLight);

    const pulseLight = new THREE.PointLight(0xffffff, 20, 6);
    pulseLight.position.copy(shieldGroup.position);
    this.scene.add(pulseLight);

    // Hexagonal flash effect
    const flashGeometry = new THREE.RingGeometry(0.5, 3, 6);
    const flashMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
    });
    const flash = new THREE.Mesh(flashGeometry, flashMaterial);
    flash.position.copy(shieldGroup.position);
    flash.lookAt(this.camera.position);
    this.scene.add(flash);

    gsap.to(flash.scale, {
      x: 3,
      y: 3,
      z: 3,
      duration: 0.3,
      ease: 'power2.out',
    });

    gsap.to(flashMaterial, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        this.scene.remove(flash);
        flashGeometry.dispose();
        flashMaterial.dispose();
      },
    });

    // Camera shake on impact
    const originalCameraPos = this.camera.position.clone();
    const shakeTimeline = gsap.timeline();
    for (let i = 0; i < 6; i++) {
      shakeTimeline.to(this.camera.position, {
        x: originalCameraPos.x + (Math.random() - 0.5) * 0.2,
        y: originalCameraPos.y + (Math.random() - 0.5) * 0.2,
        z: originalCameraPos.z + (Math.random() - 0.5) * 0.15,
        duration: 0.03,
      });
    }
    shakeTimeline.to(this.camera.position, {
      x: originalCameraPos.x,
      y: originalCameraPos.y,
      z: originalCameraPos.z,
      duration: 0.05,
    });

    // Animate shield layers
    gsap.to(outerShield.rotation, {
      x: Math.PI * 2,
      y: Math.PI * 2,
      duration: 0.8,
    });

    gsap.to(innerShield.rotation, {
      x: -Math.PI * 2,
      z: Math.PI * 2,
      duration: 0.8,
    });

    gsap.to(middleShield.scale, {
      x: 1.3,
      y: 1.3,
      z: 1.3,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut',
    });

    gsap.to(shieldGroup.scale, {
      x: 1.2,
      y: 1.2,
      z: 1.2,
      duration: 0.15,
      yoyo: true,
      repeat: 1,
      ease: 'elastic.out(1, 0.3)',
    });

    // Pulse animation for lights
    gsap.to(mainLight, {
      intensity: 50,
      duration: 0.1,
      yoyo: true,
      repeat: 3,
    });

    gsap.to(pulseLight, {
      intensity: 35,
      duration: 0.15,
      yoyo: true,
      repeat: 2,
    });

    // Add to particle animations array for main animation loop
    this.particleAnimations.push({
      geometry: particleGeometry,
      velocities: particleVelocities,
      particleCount,
    });

    // Fade out everything
    gsap.to([outerShieldMaterial, middleShieldMaterial, innerShieldMaterial, particleMaterial], {
      opacity: 0,
      duration: 0.5,
      delay: 0.5,
      onComplete: () => {
        const index = this.particleAnimations.findIndex(
          (anim) => anim.geometry === particleGeometry,
        );
        if (index > -1) this.particleAnimations.splice(index, 1);
        this.scene.remove(shieldGroup);
        this.scene.remove(mainLight);
        this.scene.remove(pulseLight);

        // Dispose geometries and materials
        outerShieldGeometry.dispose();
        outerShieldMaterial.dispose();
        middleShieldGeometry.dispose();
        middleShieldMaterial.dispose();
        innerShieldGeometry.dispose();
        innerShieldMaterial.dispose();
        particleGeometry.dispose();
        particleMaterial.dispose();
        rings.forEach((ring) => {
          ring.geometry.dispose();
          (ring.material as THREE.Material).dispose();
        });
      },
    });

    gsap.to([mainLight, pulseLight], {
      intensity: 0,
      duration: 0.5,
      delay: 0.5,
    });
  }

  private createLightningStrike(from: THREE.Vector3, to: THREE.Vector3): void {
    // Camera shake effect
    const originalCameraPos = this.camera.position.clone();
    const shakeTimeline = gsap.timeline();
    for (let i = 0; i < 8; i++) {
      shakeTimeline.to(this.camera.position, {
        x: originalCameraPos.x + (Math.random() - 0.5) * 0.3,
        y: originalCameraPos.y + (Math.random() - 0.5) * 0.3,
        z: originalCameraPos.z + (Math.random() - 0.5) * 0.2,
        duration: 0.03,
      });
    }
    shakeTimeline.to(this.camera.position, {
      x: originalCameraPos.x,
      y: originalCameraPos.y,
      z: originalCameraPos.z,
      duration: 0.1,
    });

    const startAnchor = from.clone();
    const endAnchor = to.clone();
    startAnchor.y += 6.5;
    endAnchor.y += 1.2;

    // Create multiple main lightning bolts with animated jitter + glow
    const createBoltPoints = (start: THREE.Vector3, end: THREE.Vector3, segments: number) => {
      const boltPoints: THREE.Vector3[] = [];
      boltPoints.push(start.clone());

      for (let i = 1; i < segments; i++) {
        const t = i / segments;
        const point = new THREE.Vector3().lerpVectors(start, end, t);
        point.y += 0.8 - t * 0.8;
        const wander = 0.8 + Math.sin(t * Math.PI * 2) * 0.6;
        point.x += (Math.random() - 0.5) * wander;
        point.z += (Math.random() - 0.5) * wander;
        boltPoints.push(point);
      }

      boltPoints.push(end.clone());
      return boltPoints;
    };

    const spawnBolt = (points: THREE.Vector3[], color: number, opacity: number, jitter: number) => {
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
      });
      const line = new THREE.Line(geometry, material);
      this.scene.add(line);
      this.lightningBolts.push(line as unknown as THREE.Mesh);

      const basePoints = points.map((point) => point.clone());
      const positions = geometry.attributes['position'] as THREE.BufferAttribute;

      const updateBolt = () => {
        for (let i = 0; i < basePoints.length; i++) {
          const base = basePoints[i];
          const offset = i === 0 || i === basePoints.length - 1 ? 0 : jitter;
          positions.setXYZ(
            i,
            base.x + (Math.random() - 0.5) * offset,
            base.y + (Math.random() - 0.5) * offset,
            base.z + (Math.random() - 0.5) * offset,
          );
        }
        positions.needsUpdate = true;
      };

      updateBolt();

      const flickerTween = gsap.to(material, {
        opacity: Math.max(0.15, opacity * 0.25),
        duration: 0.06,
        repeat: 6,
        yoyo: true,
        onUpdate: updateBolt,
      });

      return { line, geometry, material, flickerTween };
    };

    const boltCount = 3;
    for (let b = 0; b < boltCount; b++) {
      const points = createBoltPoints(startAnchor, endAnchor, 26 + b * 3);

      const core = spawnBolt(points, b === 0 ? 0xffffff : 0xb8ffff, 1, 0.55);
      const glow = spawnBolt(points, 0x7fffff, 0.45, 0.25);

      // Create branching bolts from random points
      for (let branchIdx = 0; branchIdx < 6; branchIdx++) {
        const branchStartIdx = Math.floor(Math.random() * (points.length - 6)) + 2;
        const branchPoints: THREE.Vector3[] = [points[branchStartIdx].clone()];
        const branchSegments = 6 + Math.floor(Math.random() * 5);

        for (let i = 1; i <= branchSegments; i++) {
          const lastPoint = branchPoints[branchPoints.length - 1];
          const newPoint = lastPoint.clone();
          newPoint.x += (Math.random() - 0.5) * 1.6;
          newPoint.y += (Math.random() - 0.8) * 0.9;
          newPoint.z += (Math.random() - 0.5) * 1.6;
          branchPoints.push(newPoint);
        }

        const branch = spawnBolt(branchPoints, 0xaaffff, 0.6, 0.35);
        gsap.to(branch.material, {
          opacity: 0,
          duration: 0.2,
          delay: 0.08,
          onComplete: () => {
            branch.flickerTween.kill();
            this.scene.remove(branch.line);
            branch.geometry.dispose();
            branch.material.dispose();
          },
        });
      }

      gsap.to([core.material, glow.material], {
        opacity: 0,
        duration: 0.35,
        delay: 0.15 + b * 0.05,
        onComplete: () => {
          core.flickerTween.kill();
          glow.flickerTween.kill();
          this.scene.remove(core.line);
          this.scene.remove(glow.line);
          core.geometry.dispose();
          glow.geometry.dispose();
          core.material.dispose();
          glow.material.dispose();
          const coreIndex = this.lightningBolts.indexOf(core.line as unknown as THREE.Mesh);
          if (coreIndex > -1) this.lightningBolts.splice(coreIndex, 1);
          const glowIndex = this.lightningBolts.indexOf(glow.line as unknown as THREE.Mesh);
          if (glowIndex > -1) this.lightningBolts.splice(glowIndex, 1);
        },
      });
    }

    // Intense glow lights
    const mainGlowLight = new THREE.PointLight(0xffffff, 50, 15);
    mainGlowLight.position.copy(endAnchor);
    this.scene.add(mainGlowLight);

    const topGlowLight = new THREE.PointLight(0xaaffff, 30, 12);
    topGlowLight.position.copy(startAnchor);
    this.scene.add(topGlowLight);

    // Electrical particles along the strike path
    const particleCount = 100;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities: THREE.Vector3[] = [];

    for (let i = 0; i < particleCount; i++) {
      const t = Math.random();
      particlePositions[i * 3] =
        startAnchor.x + (endAnchor.x - startAnchor.x) * t + (Math.random() - 0.5) * 2;
      particlePositions[i * 3 + 1] =
        startAnchor.y + (endAnchor.y - startAnchor.y) * t + (Math.random() - 0.5) * 2;
      particlePositions[i * 3 + 2] =
        startAnchor.z + (endAnchor.z - startAnchor.z) * t + (Math.random() - 0.5) * 2;

      particleVelocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.3,
        ),
      );
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.2,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      map: this.circleTexture,
      alphaTest: 0.01,
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(particleSystem);

    gsap.to(particleMaterial, {
      opacity: 0,
      duration: 0.8,
      onUpdate: () => {
        const pos = particleGeometry.attributes['position'];
        for (let i = 0; i < particleCount; i++) {
          pos.array[i * 3] += particleVelocities[i].x;
          pos.array[i * 3 + 1] += particleVelocities[i].y;
          pos.array[i * 3 + 2] += particleVelocities[i].z;
        }
        pos.needsUpdate = true;
      },
      onComplete: () => {
        this.scene.remove(particleSystem);
        particleGeometry.dispose();
        particleMaterial.dispose();
      },
    });

    // Ground impact electrical discharge
    const dischargeRingCount = 6;
    for (let i = 0; i < dischargeRingCount; i++) {
      const ringGeometry = new THREE.RingGeometry(0.5, 1, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xffffff : 0xaaffff,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.copy(endAnchor);
      ring.position.y = 0.1;
      ring.rotation.x = -Math.PI / 2;
      this.scene.add(ring);

      gsap.to(ring.scale, {
        x: 8 + i * 2,
        y: 8 + i * 2,
        duration: 0.6,
        delay: i * 0.05,
        ease: 'power2.out',
      });

      gsap.to(ringMaterial, {
        opacity: 0,
        duration: 0.6,
        delay: i * 0.05,
        onComplete: () => {
          this.scene.remove(ring);
          ringGeometry.dispose();
          ringMaterial.dispose();
        },
      });
    }

    // Secondary flickering bolts
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const points: THREE.Vector3[] = [];
        const segments = 15;

        points.push(startAnchor.clone());

        for (let j = 1; j < segments; j++) {
          const t = j / segments;
          const point = new THREE.Vector3().lerpVectors(startAnchor, endAnchor, t);
          point.y += 0.8 - t * 0.8;
          point.x += (Math.random() - 0.5) * 1.2;
          point.z += (Math.random() - 0.5) * 1.2;
          points.push(point);
        }

        points.push(endAnchor.clone());

        const secGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const secMaterial = new THREE.LineBasicMaterial({
          color: 0xffffff,
          linewidth: 3,
          transparent: true,
          opacity: 0.6,
        });
        const secLightning = new THREE.Line(secGeometry, secMaterial);
        this.scene.add(secLightning);

        gsap.to(secMaterial, {
          opacity: 0,
          duration: 0.15,
          onComplete: () => {
            this.scene.remove(secLightning);
            secGeometry.dispose();
            secMaterial.dispose();
          },
        });
      }, i * 40);
    }

    gsap.to(mainGlowLight, {
      intensity: 0,
      duration: 0.4,
      delay: 0.2,
      onComplete: () => {
        this.scene.remove(mainGlowLight);
      },
    });

    gsap.to(topGlowLight, {
      intensity: 0,
      duration: 0.4,
      delay: 0.2,
      onComplete: () => {
        this.scene.remove(topGlowLight);
      },
    });
  }

  private createMassiveImpact(position: THREE.Vector3, action: BattleAction): void {
    const isCritical = action.type === 'critical';
    const color = isCritical ? 0xff0044 : action.type === 'miss' ? 0x00aaff : 0x0044ff;

    for (let i = 0; i < 3; i++) {
      const ringGeometry = new THREE.RingGeometry(0.5, 0.8, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.copy(position);
      ring.position.y = 0.1;
      ring.rotation.x = -Math.PI / 2;
      this.scene.add(ring);

      gsap.to(ring.scale, {
        x: isCritical ? 12 : 8,
        y: isCritical ? 12 : 8,
        z: 1,
        duration: 0.8,
        delay: i * 0.1,
        ease: 'power2.out',
      });

      gsap.to(ringMaterial, {
        opacity: 0,
        duration: 0.8,
        delay: i * 0.1,
        onComplete: () => {
          this.scene.remove(ring);
          ringGeometry.dispose();
          ringMaterial.dispose();
        },
      });
    }

    const particleCount = isCritical ? 200 : 120;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities: THREE.Vector3[] = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y + 2;
      positions[i * 3 + 2] = position.z;

      const speed = isCritical ? 0.8 : 0.5;
      const angle = (i / particleCount) * Math.PI * 2;
      const verticalAngle = (Math.random() - 0.3) * Math.PI;

      velocities.push(
        new THREE.Vector3(
          Math.cos(angle) * Math.cos(verticalAngle) * speed,
          Math.sin(verticalAngle) * speed,
          Math.sin(angle) * Math.cos(verticalAngle) * speed,
        ),
      );
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color,
      size: isCritical ? 0.25 : 0.15,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      map: this.circleTexture,
      alphaTest: 0.01,
    });

    const particleSystem = new THREE.Points(geometry, material);
    this.scene.add(particleSystem);

    gsap.to(material, {
      opacity: 0,
      duration: 1.2,
      onUpdate: () => {
        const pos = geometry.attributes['position'];
        for (let i = 0; i < particleCount; i++) {
          pos.array[i * 3] += velocities[i].x;
          pos.array[i * 3 + 1] += velocities[i].y;
          pos.array[i * 3 + 2] += velocities[i].z;
          velocities[i].y -= 0.03;
        }
        pos.needsUpdate = true;
      },
      onComplete: () => {
        this.scene.remove(particleSystem);
        geometry.dispose();
        material.dispose();
      },
    });
  }

  private createEnergyWave(position: THREE.Vector3, isCritical: boolean): void {
    const waveGeometry = new THREE.SphereGeometry(1, 32, 32);
    const waveMaterial = new THREE.MeshBasicMaterial({
      color: isCritical ? 0xff0044 : 0x0044ff,
      transparent: true,
      opacity: 0.5,
      side: THREE.BackSide,
      wireframe: false,
    });
    const wave = new THREE.Mesh(waveGeometry, waveMaterial);
    wave.position.copy(position);
    wave.position.y += 2;
    this.scene.add(wave);

    gsap.to(wave.scale, {
      x: isCritical ? 8 : 5,
      y: isCritical ? 8 : 5,
      z: isCritical ? 8 : 5,
      duration: 0.6,
      ease: 'power2.out',
    });

    gsap.to(waveMaterial, {
      opacity: 0,
      duration: 0.6,
      onComplete: () => {
        this.scene.remove(wave);
        waveGeometry.dispose();
        waveMaterial.dispose();
      },
    });
  }

  private cinematicCameraZoom(
    attacker: THREE.Group,
    defender: THREE.Group,
    isCritical: boolean,
  ): void {
    if (isCritical) {
      const midPoint = new THREE.Vector3()
        .addVectors(attacker.position, defender.position)
        .multiplyScalar(0.5);

      gsap.to(this.camera.position, {
        x: midPoint.x,
        y: midPoint.y + 3,
        z: midPoint.z + 6,
        duration: 0.3,
        ease: 'power2.inOut',
      });

      gsap.to(this.camera, {
        fov: Math.max(this.baseCameraFov - 10, 45),
        duration: 0.3,
        ease: 'power2.inOut',
        onUpdate: () => {
          this.camera.updateProjectionMatrix();
        },
      });
    }
  }

  private resetCamera(): void {
    gsap.to(this.camera.position, {
      x: this.cameraOriginalPosition.x,
      y: this.cameraOriginalPosition.y,
      z: this.cameraOriginalPosition.z,
      duration: 0.5,
      ease: 'power2.out',
    });

    gsap.to(this.camera, {
      fov: this.baseCameraFov,
      duration: 0.5,
      ease: 'power2.out',
      onUpdate: () => {
        this.camera.updateProjectionMatrix();
      },
    });
  }

  private screenFlash(): void {
    const flashGeometry = new THREE.PlaneGeometry(100, 100);
    const flashMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    const flash = new THREE.Mesh(flashGeometry, flashMaterial);
    flash.position.copy(this.camera.position);
    flash.position.z -= 5;
    flash.lookAt(this.camera.position);
    this.scene.add(flash);

    gsap.to(flashMaterial, {
      opacity: 0,
      duration: 0.2,
      onComplete: () => {
        this.scene.remove(flash);
        flashGeometry.dispose();
        flashMaterial.dispose();
      },
    });
  }

  private animate(currentTime = 0): void {
    if (this.isPaused) {
      return;
    }
    this.animationFrameId = requestAnimationFrame((time) => this.animate(time));

    const frameInterval = 1000 / this.targetFps;
    if (currentTime - this.lastFrameTime < frameInterval) {
      return;
    }
    this.lastFrameTime = currentTime;

    // Calculate delta time for consistent animations (available for future use)
    // const deltaTime = this.lastTime ? (currentTime - this.lastTime) / 1000 : 0;
    this.lastTime = currentTime;

    const time = currentTime * 0.0001;
    if (!this.timeSlowActive) {
      this.camera.position.x = this.cameraOriginalPosition.x + Math.sin(time) * 0.3;
      this.camera.position.y = this.cameraOriginalPosition.y + Math.sin(time * 0.7) * 0.2;
    }

    // Scroll normal-map UV at higher speed for more active waves; also pulse
    // normalScale and emissiveIntensity each frame to give a living-sea feel.
    if (this.groundWaterNormalMap) {
      this.groundWaterNormalMap.offset.x -= 0.00058;
      this.groundWaterNormalMap.offset.y += 0.00032;
      this.groundWaterNormalMap.needsUpdate = true;
    }
    if (this.groundMaterial) {
      const wt = currentTime * 0.001;
      const ns = 0.65 + Math.sin(wt * 0.9) * 0.28 + Math.sin(wt * 1.7 + 1.2) * 0.12;
      this.groundMaterial.normalScale.set(ns, ns);
      this.groundMaterial.emissiveIntensity =
        0.22 + Math.sin(wt * 0.6) * 0.1 + Math.sin(wt * 1.3 + 0.8) * 0.05;
      this.groundMaterial.roughness = 0.06 + Math.abs(Math.sin(wt * 0.4)) * 0.06;
    }

    // Optimize lightning bolt updates
    this.lightningBolts.forEach((bolt) => {
      if (bolt.material) {
        (bolt.material as THREE.LineBasicMaterial).opacity *= 0.95;
      }
    });

    // Update particle animations in main loop
    this.particleAnimations.forEach((anim) => {
      const positions = anim.geometry.attributes['position'].array as Float32Array;
      for (let i = 0; i < anim.particleCount; i++) {
        const speed = anim.velocities[i * 2 + 1];

        anim.velocities[i * 2] += speed;
        const newAngle = anim.velocities[i * 2];
        const radius = Math.sqrt(positions[i * 3] ** 2 + positions[i * 3 + 2] ** 2);

        positions[i * 3] = Math.cos(newAngle) * radius;
        positions[i * 3 + 2] = Math.sin(newAngle) * radius;
      }
      anim.geometry.attributes['position'].needsUpdate = true;
    });

    this.renderer.render(this.scene, this.camera);
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      this.isPaused = true;
      if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      return;
    }

    if (this.isPaused) {
      this.isPaused = false;
      this.lastFrameTime = 0;
      this.animate();
    }
  }

  private throttleResize(): void {
    if (this.resizeTimeout) {
      return;
    }
    this.resizeTimeout = setTimeout(() => {
      this.onWindowResize();
      this.resizeTimeout = null;
    }, 100);
  }

  private onWindowResize(): void {
    if (!this.canvasRef || !this.camera || !this.renderer) return;

    const canvas = this.canvasRef.nativeElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const viewport = this.getViewportSettings(width, height);

    this.camera.aspect = width / height;
    this.camera.fov = viewport.fov;
    this.camera.updateProjectionMatrix();

    this.scene.fog = viewport.useFog ? new THREE.FogExp2(0x0a0a0b, 0.08) : null;

    this.camera.position.set(0, viewport.cameraY, viewport.cameraZ);
    this.cameraOriginalPosition = new THREE.Vector3(0, viewport.cameraY, viewport.cameraZ);
    this.baseCameraFov = viewport.fov;

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  private getViewportSettings(
    width: number,
    height: number,
  ): {
    fov: number;
    cameraZ: number;
    cameraY: number;
    useFog: boolean;
  } {
    const aspect = width / height;
    const isMobile = width < 520;
    const isTablet = width < 720;
    const isPortrait = aspect < 0.9;
    const isCompact = isMobile || isPortrait;

    let fov = 60;
    let cameraZ = 10;
    let cameraY = 4;

    if (isCompact) {
      fov = 68;
      cameraZ = 12.5;
      cameraY = 5;
    }

    if (width < 380 || height < 520) {
      fov = 72;
      cameraZ = 13.5;
      cameraY = 5.5;
    }

    return {
      fov,
      cameraZ,
      cameraY,
      useFog: !isTablet,
    };
  }
}
