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
import { BattleCharacter, BattleAction } from '../battle.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-battle-canvas',
  standalone: true,
  imports: [CommonModule],
  template: '<canvas #battleCanvas></canvas>',
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }

      canvas {
        width: 100%;
        height: 100%;
        display: block;
      }
    `,
  ],
})
export class BattleCanvasComponent implements OnInit, OnDestroy {
  @ViewChild('battleCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private character1Mesh!: THREE.Group;
  private character2Mesh!: THREE.Group;
  private animationFrameId: number | null = null;
  private destroy$ = new Subject<void>();
  private cameraOriginalPosition!: THREE.Vector3;
  private lightningBolts: THREE.Mesh[] = [];
  private timeSlowActive = false;
  private resizeHandler: () => void;
  private lastTime = 0;
  private readonly spiderGroundOffset = -0.65;
  private particleAnimations: {
    geometry: THREE.BufferGeometry;
    velocities: number[];
    particleCount: number;
  }[] = [];
  private resizeTimeout: ReturnType<typeof setTimeout> | null = null;

  private battleService = inject(BattleService);
  private circleTexture!: THREE.Texture;

  character1: BattleCharacter | null = null;
  character2: BattleCharacter | null = null;

  constructor() {
    this.resizeHandler = this.throttleResize.bind(this);
    afterNextRender(() => {
      this.createCircleTexture();
      this.initScene();
      this.animate();
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

    window.removeEventListener('resize', this.resizeHandler);
    this.particleAnimations = [];
    gsap.killTweensOf('*');
    this.scene?.clear();
    this.renderer?.dispose();
    this.circleTexture?.dispose();
  }

  clearCharacters(): void {
    if (this.character1Mesh) {
      this.scene.remove(this.character1Mesh);
      this.character1Mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      this.character1Mesh = undefined as unknown as THREE.Group;
    }
    if (this.character2Mesh) {
      this.scene.remove(this.character2Mesh);
      this.character2Mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      this.character2Mesh = undefined as unknown as THREE.Group;
    }

    this.character1 = null;
    this.character2 = null;
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

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0b);

    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    const isMobile = width < 500;
    const isTablet = width < 680;

    if (!isTablet) {
      this.scene.fog = new THREE.FogExp2(0x0a0a0b, 0.08);
    }
    const cameraZ = isMobile ? 12 : 10;
    const cameraY = isMobile ? 5 : 4;
    this.camera.position.set(0, cameraY, cameraZ);
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

    const rimLight1 = new THREE.PointLight(0x34f5dd, 3, 8);
    rimLight1.position.set(-4, 3, -2);
    this.scene.add(rimLight1);

    const rimLight2 = new THREE.PointLight(0x34f5f5, 3, 8);
    rimLight2.position.set(4, 3, -2);
    this.scene.add(rimLight2);

    const accentLight = new THREE.SpotLight(0x34f5dd, 2);
    accentLight.position.set(0, 8, 0);
    accentLight.angle = Math.PI / 4;
    accentLight.penumbra = 0.5;
    accentLight.castShadow = true;
    this.scene.add(accentLight);

    const tileSize = 1.5;
    const boardSize = 20;
    const halfBoard = boardSize / 2;

    for (let x = 0; x < boardSize; x++) {
      for (let z = 0; z < boardSize; z++) {
        const isBlack = (x + z) % 2 === 0;
        const tileGeometry = new THREE.PlaneGeometry(tileSize, tileSize);
        const tileMaterial = new THREE.MeshStandardMaterial({
          color: isBlack ? 0x0a0a0b : 0x47474a,
          roughness: 0.9,
          metalness: 0.1,
          emissive: isBlack ? 0x000000 : 0x0f0f10,
          emissiveIntensity: isBlack ? 0.1 : 0.3,
        });
        const tile = new THREE.Mesh(tileGeometry, tileMaterial);
        tile.rotation.x = -Math.PI / 2;
        tile.position.set(
          (x - halfBoard) * tileSize + tileSize / 2,
          -1,
          (z - halfBoard) * tileSize + tileSize / 2,
        );
        tile.receiveShadow = true;
        this.scene.add(tile);
      }
    }
  }

  private replaceCharacter(characterNumber: 1 | 2): void {
    const character = characterNumber === 1 ? this.character1 : this.character2;
    if (!character) return;

    const oldMesh = characterNumber === 1 ? this.character1Mesh : this.character2Mesh;

    // Remove old mesh
    if (oldMesh) {
      this.scene.remove(oldMesh);
      oldMesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }

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

    this.character1Mesh = this.createEnhancedCharacterMesh(
      this.character1.color,
      this.character1.position,
    );
    this.character1Mesh.rotation.y = Math.PI / 3;
    this.scene.add(this.character1Mesh);

    this.character2Mesh = this.createEnhancedCharacterMesh(
      this.character2.color,
      this.character2.position,
    );
    this.character2Mesh.scale.x = -1;
    this.character2Mesh.rotation.y = -Math.PI / 3;
    this.scene.add(this.character2Mesh);

    this.createTeleportationEntrance(this.character1Mesh, this.character1.position, 'left');
    this.createTeleportationEntrance(this.character2Mesh, this.character2.position, 'right');
  }

  private createEnhancedCharacterMesh(
    color: string,
    position: { x: number; y: number; z: number },
  ): THREE.Group {
    const group = new THREE.Group();
    const themeColor = new THREE.Color(color);

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x1a1a1a).lerp(themeColor, 0.3),
      roughness: 0.9,
      metalness: 0.1,
      emissive: themeColor,
      emissiveIntensity: 0.2,
    });

    const cephaloGeometry = new THREE.SphereGeometry(0.48, 20, 20);
    cephaloGeometry.scale(1.05, 0.38, 1.0);
    const cephalothorax = new THREE.Mesh(cephaloGeometry, bodyMaterial);
    cephalothorax.position.set(0, 0.45, 0.18);
    cephalothorax.castShadow = true;
    cephalothorax.receiveShadow = true;
    group.add(cephalothorax);

    const pedipalpGeometry = new THREE.CylinderGeometry(0.035, 0.025, 0.28, 10);
    const pedipalpTipGeometry = new THREE.SphereGeometry(0.045, 10, 10);
    for (const sideMultiplier of [-1, 1]) {
      const pedipalp = new THREE.Mesh(pedipalpGeometry, bodyMaterial);
      pedipalp.position.set(0.18 * sideMultiplier, 0.32, 0.45);
      pedipalp.rotation.x = Math.PI / 2.2;
      pedipalp.rotation.z = (Math.PI / 10) * sideMultiplier;
      pedipalp.castShadow = true;
      pedipalp.receiveShadow = true;
      group.add(pedipalp);

      const pedipalpTip = new THREE.Mesh(pedipalpTipGeometry, bodyMaterial);
      pedipalpTip.position.set(0.2 * sideMultiplier, 0.26, 0.6);
      pedipalpTip.scale.set(1.1, 0.8, 1.3);
      pedipalpTip.castShadow = true;
      pedipalpTip.receiveShadow = true;
      group.add(pedipalpTip);
    }

    const cheliceraeGeometry = new THREE.SphereGeometry(0.08, 12, 12);
    for (const sideMultiplier of [-1, 1]) {
      const chelicera = new THREE.Mesh(cheliceraeGeometry, bodyMaterial);
      chelicera.position.set(0.11 * sideMultiplier, 0.3, 0.5);
      chelicera.scale.set(0.8, 0.6, 1.1);
      chelicera.castShadow = true;
      chelicera.receiveShadow = true;
      group.add(chelicera);

      const fangGeometry = new THREE.CylinderGeometry(0.015, 0.005, 0.18, 8);
      const fang = new THREE.Mesh(fangGeometry, bodyMaterial);
      fang.position.set(0.12 * sideMultiplier, 0.21, 0.57);
      fang.rotation.x = Math.PI / 2.1;
      fang.rotation.z = (Math.PI / 16) * sideMultiplier;
      fang.castShadow = true;
      fang.receiveShadow = true;
      group.add(fang);
    }

    const legMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x000000).lerp(themeColor, 0.05),
      roughness: 0.7,
      metalness: 0.3,
      emissive: themeColor,
      emissiveIntensity: 0.15,
    });

    const legAngles = [Math.PI / 5, Math.PI / 12, -Math.PI / 12, -Math.PI / 4];

    for (let side = 0; side < 2; side++) {
      const sideMultiplier = side === 0 ? -1 : 1;

      for (let legNum = 0; legNum < 4; legNum++) {
        const legGroup = new THREE.Group();

        const legAngle = legAngles[legNum];
        const zAngle = (Math.PI / 2.8 + legNum * 0.05) * sideMultiplier;

        const upperLegLength = 0.8;
        const middleLegLength = 0.55;
        const lowerLegLength = 0.7;

        const upperLegSegmentGeometry = new THREE.CylinderGeometry(0.12, 0.08, upperLegLength, 10);

        const upperLeg = new THREE.Mesh(upperLegSegmentGeometry, legMaterial);
        upperLeg.position.set(0.3 * sideMultiplier, -0.1, 0);
        upperLeg.rotation.z = zAngle * 1.2;
        upperLeg.castShadow = true;
        upperLeg.receiveShadow = true;
        legGroup.add(upperLeg);

        for (let h = 0; h < 12; h++) {
          const bristleGeometry = new THREE.CylinderGeometry(0.012, 0.006, 0.28, 4);
          const bristle = new THREE.Mesh(bristleGeometry, legMaterial);
          const bristleAngle = (h / 8) * Math.PI * 2;
          bristle.position.set(
            0.36 * sideMultiplier + Math.cos(bristleAngle) * 0.08,
            -0.1 + Math.sin(bristleAngle) * 0.08,
            0,
          );
          bristle.rotation.z = zAngle * 1.15 + (Math.random() - 0.5) * 0.35;
          bristle.rotation.y = bristleAngle;
          legGroup.add(bristle);
        }

        const middleLegSegmentGeometry = new THREE.CylinderGeometry(0.1, 0.06, middleLegLength, 10);

        const middleLeg = new THREE.Mesh(middleLegSegmentGeometry, legMaterial);
        middleLeg.position.set(0.85 * sideMultiplier, -0.28, 0);
        middleLeg.rotation.z = zAngle * 0.75;
        middleLeg.castShadow = true;
        middleLeg.receiveShadow = true;
        legGroup.add(middleLeg);

        for (let h = 0; h < 10; h++) {
          const bristleGeometry = new THREE.CylinderGeometry(0.014, 0.006, 0.34, 4);
          const bristle = new THREE.Mesh(bristleGeometry, legMaterial);
          const bristleAngle = (h / 8) * Math.PI * 2;
          bristle.position.set(
            0.8 * sideMultiplier + Math.cos(bristleAngle) * 0.08,
            -0.2 + Math.sin(bristleAngle) * 0.03,
            0,
          );
          bristle.rotation.z = zAngle * 0.95 + (Math.random() - 0.5) * 0.4;
          bristle.rotation.y = bristleAngle;
          legGroup.add(bristle);
        }

        for (let h = 0; h < 8; h++) {
          const bristleGeometry = new THREE.CylinderGeometry(0.012, 0.005, 0.3, 4);
          const bristle = new THREE.Mesh(bristleGeometry, legMaterial);
          const bristleAngle = (h / 6) * Math.PI * 2;
          bristle.position.set(
            0.9 * sideMultiplier + Math.cos(bristleAngle) * 0.06,
            -0.28 + Math.sin(bristleAngle) * 0.06,
            0,
          );
          bristle.rotation.z = zAngle * 0.7 + (Math.random() - 0.5) * 0.3;
          bristle.rotation.y = bristleAngle;
          legGroup.add(bristle);
        }

        const lowerLegGeometry = new THREE.CylinderGeometry(0.07, 0.03, lowerLegLength, 10);
        const lowerLeg = new THREE.Mesh(lowerLegGeometry, legMaterial);
        lowerLeg.position.set(1.2 * sideMultiplier, -0.7, 0);
        lowerLeg.rotation.z = (Math.PI / 5.3) * sideMultiplier;
        lowerLeg.castShadow = true;
        lowerLeg.receiveShadow = true;
        legGroup.add(lowerLeg);

        for (let h = 0; h < 10; h++) {
          const bristleGeometry = new THREE.CylinderGeometry(0.012, 0.005, 0.16, 4);
          const bristle = new THREE.Mesh(bristleGeometry, legMaterial);
          const bristleAngle = (h / 7) * Math.PI * 2;
          bristle.position.set(
            1.1 * sideMultiplier + Math.cos(bristleAngle) * 0.07,
            -0.55 + Math.sin(bristleAngle) * 0.07,
            0,
          );
          bristle.rotation.z = (Math.PI / 8) * sideMultiplier + (Math.random() - 0.5) * 0.4;
          bristle.rotation.y = bristleAngle;
          legGroup.add(bristle);
        }

        for (let h = 0; h < 6; h++) {
          const bristleGeometry = new THREE.CylinderGeometry(0.01, 0.004, 0.24, 4);
          const bristle = new THREE.Mesh(bristleGeometry, legMaterial);
          const bristleAngle = (h / 4) * Math.PI * 2;
          bristle.position.set(
            1.2 * sideMultiplier + Math.cos(bristleAngle) * 0.05,
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

        const animateLegRandomly = () => {
          const safeZRotation = (Math.random() * 0.25 - 0.125) * sideMultiplier;
          const safeFrontBackRotation = baseRotationY + (Math.random() * 0.15 - 0.075);
          const safeVerticalRotation = Math.random() * 0.3 - 0.15;

          const moveDuration = 0.15 + Math.random() * 0.15;
          const pauseDuration = 0.1 + Math.random() * 0.4;

          gsap.to(legGroup.rotation, {
            x: safeVerticalRotation,
            y: safeFrontBackRotation,
            z: safeZRotation,
            duration: moveDuration,
            ease: 'power2.inOut',
            onComplete: () => {
              gsap.to(legGroup.rotation, {
                x: 0,
                y: baseRotationY,
                z: 0,
                duration: moveDuration * 0.8,
                ease: 'power2.inOut',
                delay: pauseDuration,
                onComplete: () => {
                  animateLegRandomly();
                },
              });
            },
          });
        };

        const initialDelay = Math.random() * 1.5;
        gsap.delayedCall(initialDelay, animateLegRandomly);
      }
    }

    const venomGeometry = new THREE.SphereGeometry(0.6, 24, 24);

    const venomSac = new THREE.Mesh(venomGeometry, bodyMaterial);
    venomSac.position.set(0, 0.7, -0.6);
    group.add(venomSac);

    const venomAnimationDelay = Math.random() * 1.5;
    gsap.to(venomSac.scale, {
      x: 1.05,
      y: 1.05,
      z: 1.05,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: venomAnimationDelay,
    });

    const webColor = new THREE.Color('#34f5dd');
    for (let i = 1; i <= 2; i++) {
      const auraGeometry = new THREE.IcosahedronGeometry(2 + i * 0.4, 1);
      const auraMaterial = new THREE.MeshBasicMaterial({
        color: webColor,
        transparent: true,
        opacity: 0.05,
        side: THREE.BackSide,
        wireframe: true,
      });
      const aura = new THREE.Mesh(auraGeometry, auraMaterial);
      aura.position.y = 0.8;
      group.add(aura);

      const rotationSpeedX = (Math.random() - 0.5) * 0.5;
      const rotationSpeedY = (Math.random() - 0.5) * 0.5;
      const rotationSpeedZ = (Math.random() - 0.5) * 0.5;

      gsap.to(aura.scale, {
        x: 1.15,
        y: 1.15,
        z: 1.15,
        duration: 1.5 + i * 0.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to(aura.rotation, {
        x: `+=${Math.PI * 2 * rotationSpeedX}`,
        y: `+=${Math.PI * 2 * rotationSpeedY}`,
        z: `+=${Math.PI * 2 * rotationSpeedZ}`,
        duration: 3 + Math.random() * 2,
        repeat: -1,
        ease: 'none',
      });
    }

    group.position.set(position.x, position.y + this.spiderGroundOffset, position.z);
    return group;
  }

  private createTeleportationEntrance(
    characterMesh: THREE.Group,
    targetPos: { x: number; y: number; z: number },
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

  private animateAction(action: BattleAction): void {
    const isChar1Attacker = this.character1 ? action.attackerId === this.character1.id : false;
    const attacker = isChar1Attacker ? this.character1Mesh : this.character2Mesh;
    const defender = isChar1Attacker ? this.character2Mesh : this.character1Mesh;

    if (!attacker || !defender) return;

    const isCritical = action.type === 'critical';
    const isBlocked = action.type === 'miss';

    this.cinematicCameraZoom(attacker, defender, isCritical);

    const attackerBasePosition = this.getCharacterBasePosition(isChar1Attacker, attacker);
    const defenderBasePosition = this.getCharacterBasePosition(!isChar1Attacker, defender);
    const originalPos = { ...attackerBasePosition };
    const timeline = gsap.timeline();

    this.createChargingEffect(attacker, isCritical);

    if (isBlocked) {
      timeline.call(() => {
        this.createEnergyShield(defender);
      });
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
        this.createMassiveImpact(defender.position, action);
        this.createEnergyWave(defender.position, isCritical);

        if (isCritical) {
          this.screenFlash();
        }

        const defenderTimeline = gsap.timeline();

        defenderTimeline.to(defender.position, {
          y: defender.position.y + 0.8,
          duration: 0.08,
          ease: 'power3.out',
        });

        defenderTimeline.to(
          defender.rotation,
          {
            z: (isChar1Attacker ? 1 : -1) * 0.6,
            y: (isChar1Attacker ? 1 : -1) * Math.PI * 0.15,
            x: 0.3,
            duration: 0.08,
            ease: 'power2.out',
          },
          '<',
        );

        const defenderScaleX = isChar1Attacker ? -0.7 : 0.7;
        defenderTimeline.to(
          defender.scale,
          {
            x: defenderScaleX,
            y: 0.7,
            z: 0.85,
            duration: 0.08,
            ease: 'power2.in',
          },
          '<',
        );

        defenderTimeline.to(defender.position, {
          x: defender.position.x + (isChar1Attacker ? 1.2 : -1.2),
          y: defender.position.y + 0.3,
          z: defender.position.z + (isChar1Attacker ? 0.2 : -0.2),
          duration: 0.15,
          ease: 'power2.out',
        });

        defenderTimeline.to(
          defender.rotation,
          {
            z: (isChar1Attacker ? 1 : -1) * 0.3,
            x: -0.2,
            duration: 0.15,
            ease: 'power2.out',
          },
          '<',
        );

        defenderTimeline.to(defender.position, {
          x: defender.position.x + (isChar1Attacker ? 2.0 : -2.0),
          y: defender.position.y,
          duration: 0.18,
          ease: 'power1.out',
        });

        defenderTimeline.to(
          defender.rotation,
          {
            z: (isChar1Attacker ? 1 : -1) * 0.15,
            x: 0.1,
            duration: 0.18,
            ease: 'power2.inOut',
          },
          '<',
        );

        defenderTimeline.to(
          defender.scale,
          {
            x: isChar1Attacker ? -0.95 : 0.95,
            y: 0.95,
            z: 0.95,
            duration: 0.12,
            ease: 'elastic.out(1.2, 0.5)',
          },
          '<',
        );
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

    timeline.to(
      defender.position,
      {
        x: defenderBasePosition.x,
        y: defenderBasePosition.y,
        z: defenderBasePosition.z,
        duration: 0.4,
        ease: 'power2.out',
      },
      '-=0.5',
    );

    timeline.to(
      defender.rotation,
      {
        z: 0,
        y: isChar1Attacker ? -Math.PI / 3 : Math.PI / 3,
        duration: 0.4,
        ease: 'power2.out',
      },
      '<',
    );

    timeline.call(() => {
      attacker.position.set(attackerBasePosition.x, attackerBasePosition.y, attackerBasePosition.z);
      defender.position.set(defenderBasePosition.x, defenderBasePosition.y, defenderBasePosition.z);
      this.resetCamera();
      this.timeSlowActive = false;
    });
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

  private createChargingEffect(attacker: THREE.Group, isCritical: boolean): void {
    const venomColor = isCritical ? 0xff0000 : 0x00ff00;
    const chargeLight = new THREE.PointLight(venomColor, 5, 5);
    chargeLight.position.copy(attacker.position);
    chargeLight.position.y += 1;
    this.scene.add(chargeLight);

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

      gsap.to(droplet.position, {
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
    }

    gsap.to(chargeLight, {
      intensity: isCritical ? 30 : 20,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => {
        gsap.to(chargeLight, {
          intensity: 0,
          duration: 0.2,
          onComplete: () => {
            this.scene.remove(chargeLight);
          },
        });
      },
    });
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

    // Create multiple main lightning bolts
    const boltCount = 3;
    for (let b = 0; b < boltCount; b++) {
      const points: THREE.Vector3[] = [];
      const segments = 20;

      points.push(from.clone());
      points[0].y += 10;

      for (let i = 1; i < segments; i++) {
        const t = i / segments;
        const point = new THREE.Vector3().lerpVectors(from, to, t);
        point.y += 10 - t * 8;
        point.x += (Math.random() - 0.5) * 0.8;
        point.z += (Math.random() - 0.5) * 0.8;
        points.push(point);
      }

      points.push(to.clone());
      points[points.length - 1].y += 2;

      // Main bolt with glow
      const lightningGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const lightningMaterial = new THREE.LineBasicMaterial({
        color: b === 0 ? 0xffffff : 0xaaffff,
        linewidth: 5,
        transparent: true,
        opacity: b === 0 ? 1 : 0.8,
      });
      const lightning = new THREE.Line(lightningGeometry, lightningMaterial);
      this.scene.add(lightning);
      this.lightningBolts.push(lightning as unknown as THREE.Mesh);

      // Create branching bolts from random points
      for (let branchIdx = 0; branchIdx < 5; branchIdx++) {
        const branchStartIdx = Math.floor(Math.random() * (points.length - 5)) + 2;
        const branchPoints: THREE.Vector3[] = [points[branchStartIdx].clone()];
        const branchSegments = 5 + Math.floor(Math.random() * 5);

        for (let i = 1; i <= branchSegments; i++) {
          const lastPoint = branchPoints[branchPoints.length - 1];
          const newPoint = lastPoint.clone();
          newPoint.x += (Math.random() - 0.5) * 1.5;
          newPoint.y += (Math.random() - 0.8) * 0.8;
          newPoint.z += (Math.random() - 0.5) * 1.5;
          branchPoints.push(newPoint);
        }

        const branchGeometry = new THREE.BufferGeometry().setFromPoints(branchPoints);
        const branchMaterial = new THREE.LineBasicMaterial({
          color: 0xaaffff,
          linewidth: 2,
          transparent: true,
          opacity: 0.7,
        });
        const branch = new THREE.Line(branchGeometry, branchMaterial);
        this.scene.add(branch);

        gsap.to(branchMaterial, {
          opacity: 0,
          duration: 0.25,
          delay: 0.05,
          onComplete: () => {
            this.scene.remove(branch);
            branchGeometry.dispose();
            branchMaterial.dispose();
          },
        });
      }

      gsap.to(lightningMaterial, {
        opacity: 0,
        duration: 0.35,
        delay: 0.15 + b * 0.05,
        onComplete: () => {
          this.scene.remove(lightning);
          lightningGeometry.dispose();
          lightningMaterial.dispose();
          const index = this.lightningBolts.indexOf(lightning as unknown as THREE.Mesh);
          if (index > -1) this.lightningBolts.splice(index, 1);
        },
      });
    }

    // Intense glow lights
    const mainGlowLight = new THREE.PointLight(0xffffff, 50, 15);
    mainGlowLight.position.copy(to);
    mainGlowLight.position.y += 2;
    this.scene.add(mainGlowLight);

    const topGlowLight = new THREE.PointLight(0xaaffff, 30, 12);
    topGlowLight.position.copy(from);
    topGlowLight.position.y += 10;
    this.scene.add(topGlowLight);

    // Electrical particles along the strike path
    const particleCount = 100;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities: THREE.Vector3[] = [];

    for (let i = 0; i < particleCount; i++) {
      const t = Math.random();
      particlePositions[i * 3] = from.x + (to.x - from.x) * t + (Math.random() - 0.5) * 2;
      particlePositions[i * 3 + 1] = from.y + 10 - t * 8 + (Math.random() - 0.5) * 2;
      particlePositions[i * 3 + 2] = from.z + (to.z - from.z) * t + (Math.random() - 0.5) * 2;

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
      ring.position.copy(to);
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

        points.push(from.clone());
        points[0].y += 10;

        for (let j = 1; j < segments; j++) {
          const t = j / segments;
          const point = new THREE.Vector3().lerpVectors(from, to, t);
          point.y += 10 - t * 8;
          point.x += (Math.random() - 0.5) * 1.2;
          point.z += (Math.random() - 0.5) * 1.2;
          points.push(point);
        }

        points.push(to.clone());
        points[points.length - 1].y += 2;

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
    const color = isCritical ? 0xff0044 : action.type === 'blocked' ? 0x00aaff : 0x34f5dd;

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
      color: isCritical ? 0xff0044 : 0x34f5dd,
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
        fov: 50,
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
      fov: 60,
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
    this.animationFrameId = requestAnimationFrame((time) => this.animate(time));

    // Calculate delta time for consistent animations (available for future use)
    // const deltaTime = this.lastTime ? (currentTime - this.lastTime) / 1000 : 0;
    this.lastTime = currentTime;

    const time = currentTime * 0.0001;
    if (!this.timeSlowActive) {
      this.camera.position.x = this.cameraOriginalPosition.x + Math.sin(time) * 0.3;
      this.camera.position.y = this.cameraOriginalPosition.y + Math.sin(time * 0.7) * 0.2;
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

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    const isMobile = width < 500;
    const isTablet = width < 680;

    if (!isTablet) {
      this.scene.fog = new THREE.FogExp2(0x0a0a0b, 0.08);
    }

    const cameraZ = isMobile ? 12 : 10;
    const cameraY = isMobile ? 5 : 4;
    this.camera.position.set(0, cameraY, cameraZ);
    this.cameraOriginalPosition = new THREE.Vector3(0, cameraY, cameraZ);

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
}
