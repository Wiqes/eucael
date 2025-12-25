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
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { ChipModule } from 'primeng/chip';
import { TagModule } from 'primeng/tag';
import * as THREE from 'three';
import gsap from 'gsap';
import { BattleService } from './battle.service';
import { BattleCharacter, BattleAction } from './battle.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-battle',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, ProgressBarModule, ChipModule, TagModule],
  templateUrl: './battle.component.html',
  styleUrls: ['./battle.component.scss'],
})
export class BattleComponent implements OnInit, OnDestroy {
  @ViewChild('battleCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private character1Mesh!: THREE.Group;
  private character2Mesh!: THREE.Group;
  private particles: THREE.Points[] = [];
  private animationFrameId: number | null = null;
  private destroy$ = new Subject<void>();
  private cameraOriginalPosition!: THREE.Vector3;
  private lightningBolts: THREE.Mesh[] = [];
  private timeSlowActive = false;

  private battleService = inject(BattleService);
  private circleTexture!: THREE.Texture;

  battleState$ = this.battleService.battleState$;
  character1: BattleCharacter | null = null;
  character2: BattleCharacter | null = null;

  constructor() {
    afterNextRender(() => {
      this.createCircleTexture();
      this.initScene();
      this.animate();
    });
  }

  ngOnInit(): void {
    this.battleService.battleState$.pipe(takeUntil(this.destroy$)).subscribe((state) => {
      if (state) {
        this.character1 = state.character1;
        this.character2 = state.character2;

        if (!this.character1Mesh && !this.character2Mesh) {
          this.createCharacters();
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

    this.scene?.clear();
    this.renderer?.dispose();
    this.circleTexture?.dispose();
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

    // Scene with app theme color
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0b);
    this.scene.fog = new THREE.FogExp2(0x0a0a0b, 0.08);

    // Camera
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.set(0, 4, 10);
    this.camera.lookAt(0, 1, 0);
    this.cameraOriginalPosition = this.camera.position.clone();

    // Renderer
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

    // Enhanced Lighting with app theme colors
    const ambientLight = new THREE.AmbientLight(0x34f5dd, 0.3);
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    this.scene.add(mainLight);

    // Character rim lights with app theme
    const rimLight1 = new THREE.PointLight(0x34f5dd, 3, 8);
    rimLight1.position.set(-4, 3, -2);
    this.scene.add(rimLight1);

    const rimLight2 = new THREE.PointLight(0x34f5f5, 3, 8);
    rimLight2.position.set(4, 3, -2);
    this.scene.add(rimLight2);

    // Accent lighting
    const accentLight = new THREE.SpotLight(0x34f5dd, 2);
    accentLight.position.set(0, 8, 0);
    accentLight.angle = Math.PI / 4;
    accentLight.penumbra = 0.5;
    accentLight.castShadow = true;
    this.scene.add(accentLight);

    // Enhanced Ground with chessboard pattern
    const tileSize = 1.5;
    const boardSize = 20;
    const halfBoard = boardSize / 2;

    for (let x = 0; x < boardSize; x++) {
      for (let z = 0; z < boardSize; z++) {
        const isBlack = (x + z) % 2 === 0;
        const tileGeometry = new THREE.PlaneGeometry(tileSize, tileSize);
        const tileMaterial = new THREE.MeshStandardMaterial({
          color: isBlack ? 0x0a0a0b : 0x27272a,
          roughness: 0.9,
          metalness: 0.1,
          emissive: isBlack ? 0x000000 : 0x0f0f10,
          emissiveIntensity: isBlack ? 0.1 : 0.3,
        });
        const tile = new THREE.Mesh(tileGeometry, tileMaterial);
        tile.rotation.x = -Math.PI / 2;
        tile.position.set(
          (x - halfBoard) * tileSize + tileSize / 2,
          -0.5,
          (z - halfBoard) * tileSize + tileSize / 2,
        );
        tile.receiveShadow = true;
        this.scene.add(tile);

        // Add subtle glowing border lines
        if ((x + z) % 2 === 0) {
          const borderGeometry = new THREE.EdgesGeometry(tileGeometry);
          const borderMaterial = new THREE.LineBasicMaterial({
            color: 0x34f5dd,
            opacity: 0.15,
            transparent: true,
          });
          const border = new THREE.LineSegments(borderGeometry, borderMaterial);
          border.rotation.x = -Math.PI / 2;
          border.position.set(
            (x - halfBoard) * tileSize + tileSize / 2,
            -0.49,
            (z - halfBoard) * tileSize + tileSize / 2,
          );
          this.scene.add(border);
        }
      }
    }
  }

  private createCharacters(): void {
    if (!this.character1 || !this.character2) return;

    // Character 1 (Left) - Enhanced warrior model
    this.character1Mesh = this.createEnhancedCharacterMesh(
      this.character1.color,
      this.character1.position,
    );
    // Rotate left spider to face right (towards opponent)
    this.character1Mesh.rotation.y = Math.PI / 3; // 60 degrees to the right
    this.scene.add(this.character1Mesh);

    // Character 2 (Right) - Enhanced warrior model
    this.character2Mesh = this.createEnhancedCharacterMesh(
      this.character2.color,
      this.character2.position,
    );
    // Rotate right spider to face left (towards opponent)
    this.character2Mesh.rotation.y = -Math.PI / 3; // 60 degrees to the left
    this.scene.add(this.character2Mesh);

    // Spectacular teleportation entrance with portals
    this.createTeleportationEntrance(this.character1Mesh, this.character1.position, 'left');
    this.createTeleportationEntrance(this.character2Mesh, this.character2.position, 'right');
  }

  private createEnhancedCharacterMesh(
    color: string,
    position: { x: number; y: number; z: number },
  ): THREE.Group {
    const group = new THREE.Group();
    const themeColor = new THREE.Color(color);

    // Spider body material - dark, hairy, and scary
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x1a1a1a).lerp(themeColor, 0.3),
      roughness: 0.9,
      metalness: 0.1,
      emissive: themeColor,
      emissiveIntensity: 0.2,
    });

    // Spider abdomen (rear body part)
    const abdomenGeometry = new THREE.SphereGeometry(0.7, 20, 20);
    const abdomen = new THREE.Mesh(abdomenGeometry, bodyMaterial);
    abdomen.position.set(0, 0.9, -0.6);
    abdomen.castShadow = true;
    abdomen.receiveShadow = true;
    group.add(abdomen);

    // Add texture bumps to abdomen for hairy/bumpy appearance
    const abdomenBumpCount = 12;
    for (let i = 0; i < abdomenBumpCount; i++) {
      const bumpGeometry = new THREE.SphereGeometry(0.08, 8, 8);
      const bumpMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x0a0a0a).lerp(themeColor, 0.2),
        roughness: 1,
        metalness: 0,
      });
      const bump = new THREE.Mesh(bumpGeometry, bumpMaterial);

      const theta = (i / abdomenBumpCount) * Math.PI * 2;
      const phi = Math.PI / 3;
      bump.position.set(
        0.5 * Math.sin(phi) * Math.cos(theta),
        0.9 + 0.3 * Math.cos(phi),
        -0.6 + 0.6 * Math.sin(phi) * Math.sin(theta),
      );
      bump.castShadow = true;
      group.add(bump);
    }

    // Spider cephalothorax (front body/head) - flatter, more angular
    const cephaloGeometry = new THREE.SphereGeometry(0.45, 20, 20);
    cephaloGeometry.scale(1.1, 0.7, 1.4); // Flatter and wider
    const cephalothorax = new THREE.Mesh(cephaloGeometry, bodyMaterial);
    cephalothorax.position.set(0, 0.4, 0.2);
    cephalothorax.castShadow = true;
    cephalothorax.receiveShadow = true;
    group.add(cephalothorax);

    // Create 8 scary spider legs!
    const legMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x0a0a0a).lerp(themeColor, 0.2),
      roughness: 0.8,
      metalness: 0.1,
    });

    const legSegmentGeometry = new THREE.CylinderGeometry(0.08, 0.05, 0.8, 6);

    // Leg configuration: 4 legs on each side with realistic spider leg angles
    // Each leg pair extends at a different angle for natural spider appearance
    const legAngles = [
      Math.PI / 5, // Front legs: ~36° forward
      Math.PI / 12, // Second pair: ~15° slightly forward
      -Math.PI / 12, // Third pair: ~15° slightly backward
      -Math.PI / 4, // Back legs: ~45° backward
    ];

    for (let side = 0; side < 2; side++) {
      const sideMultiplier = side === 0 ? -1 : 1;

      for (let legNum = 0; legNum < 4; legNum++) {
        const legGroup = new THREE.Group();

        // Calculate leg-specific angles for realistic spread
        const legAngle = legAngles[legNum];
        const zAngle = (Math.PI / 2.8 + legNum * 0.1) * sideMultiplier; // Varies per leg

        // Upper leg segment
        const upperLeg = new THREE.Mesh(legSegmentGeometry, legMaterial);
        upperLeg.position.set(0.6 * sideMultiplier, 0, 0);
        upperLeg.rotation.z = zAngle;
        upperLeg.castShadow = true;
        legGroup.add(upperLeg);

        // Middle leg segment - extends outward
        const middleLeg = new THREE.Mesh(legSegmentGeometry, legMaterial);
        middleLeg.position.set(1.3 * sideMultiplier, -0.45, 0);
        middleLeg.rotation.z = zAngle * 0.7; // Less steep angle
        middleLeg.castShadow = true;
        legGroup.add(middleLeg);

        // Lower leg segment (thinner, ending in a point)
        const lowerLegGeometry = new THREE.CylinderGeometry(0.03, 0.01, 0.9, 6);
        const lowerLeg = new THREE.Mesh(lowerLegGeometry, legMaterial);
        lowerLeg.position.set(1.8 * sideMultiplier, -1.0, 0);
        lowerLeg.rotation.z = (Math.PI / 6) * sideMultiplier;
        lowerLeg.castShadow = true;
        legGroup.add(lowerLeg);

        // Position legs naturally along the cephalothorax (front body section)
        // Front legs closer to head, back legs near body center
        const legPositions = [0.5, 0.25, 0.0, -0.2];
        const zOffset = legPositions[legNum];

        // Rotate entire leg group to point in different directions
        legGroup.rotation.y = legAngle;

        legGroup.position.set(-0.4, 0.3, zOffset);

        group.add(legGroup);

        // Add creepy leg movement animation with constraints to prevent crossing
        const delay = legNum * 0.1 + side * 0.05;

        // Calculate safe rotation ranges based on leg position and side
        // Left side (side=0) gets negative z-rotation, right side (side=1) gets positive
        const safeZRotation = Math.sin(legNum * 0.5) * 0.12 * sideMultiplier;

        // Front legs can move more forward, back legs can move more backward
        const safeFrontBackRotation = legAngle * 0.15 + Math.sin(legNum * 0.3) * 0.08;

        // Vertical movement is safe (won't cause crossing)
        const safeVerticalRotation = Math.sin(legNum * 0.7) * 0.18;

        gsap.to(legGroup.rotation, {
          x: safeVerticalRotation, // Up/down movement
          y: safeFrontBackRotation, // Front/back movement constrained by base angle
          z: safeZRotation, // Side movement constrained by side multiplier
          duration: 2 + legNum * 0.2,
          repeat: -1,
          yoyo: true,
          delay: delay,
          ease: 'sine.inOut',
        });
      }
    }

    // Glowing venom sac/poison gland in abdomen
    const venomGeometry = new THREE.SphereGeometry(0.6, 24, 24);
    const venomMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
    });
    const venomSac = new THREE.Mesh(venomGeometry, venomMaterial);
    venomSac.position.set(0, 0.85, -0.6);
    group.add(venomSac);

    // Pulsing venom animation
    gsap.to(venomSac.scale, {
      x: 1.2,
      y: 1.2,
      z: 1.2,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    // Outer energy aura - spider web pattern
    for (let i = 1; i <= 2; i++) {
      const auraGeometry = new THREE.IcosahedronGeometry(1.8 + i * 0.4, 1);
      const auraMaterial = new THREE.MeshBasicMaterial({
        color: themeColor,
        transparent: true,
        opacity: 0.1 / i,
        side: THREE.BackSide,
        wireframe: true,
      });
      const aura = new THREE.Mesh(auraGeometry, auraMaterial);
      aura.position.y = 0.8;
      group.add(aura);

      // Pulsing animation
      gsap.to(aura.scale, {
        x: 1.15,
        y: 1.15,
        z: 1.15,
        duration: 1.5 + i * 0.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }

    group.position.set(position.x, position.y, position.z);
    return group;
  }

  private createTeleportationEntrance(
    characterMesh: THREE.Group,
    targetPos: { x: number; y: number; z: number },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _side: 'left' | 'right',
  ): void {
    // Start at target position, invisible and small
    characterMesh.position.set(targetPos.x, targetPos.y, targetPos.z);
    characterMesh.scale.set(0.01, 0.01, 0.01);
    characterMesh.visible = false;

    // Timeline animation
    const timeline = gsap.timeline();

    // Materialization effect
    timeline.call(() => {
      characterMesh.visible = true;
    });

    timeline.to(characterMesh.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.8,
      ease: 'elastic.out(1, 0.5)',
    });
  }

  private animateAction(action: BattleAction): void {
    const isChar1Attacker = this.character1 && action.attackerId === this.character1.id;
    const attacker = isChar1Attacker ? this.character1Mesh : this.character2Mesh;
    const defender = isChar1Attacker ? this.character2Mesh : this.character1Mesh;

    if (!attacker || !defender) return;

    const isCritical = action.type === 'critical';
    const isBlocked = action.type === 'blocked';

    // Cinematic camera movement
    this.cinematicCameraZoom(attacker, defender, isCritical);

    const originalPos = { ...attacker.position };
    const timeline = gsap.timeline();

    // Phase 1: Energy charging with dramatic buildup
    this.createChargingEffect(attacker, isCritical);

    // Phase 2: Create energy shield on defender if blocked
    if (isBlocked) {
      timeline.call(() => {
        this.createEnergyShield(defender);
      });
    }

    // Phase 3: Lightning strike for critical hits
    if (isCritical) {
      this.timeSlowActive = true;
      timeline.call(() => {
        this.createLightningStrike(attacker.position, defender.position);
      });
    }

    // Phase 4: Teleport dash attack
    timeline.to(attacker.scale, {
      x: 1.3,
      y: 0.7,
      z: 1.3,
      duration: 0.2,
      ease: 'power2.in',
    });

    timeline.call(() => {
      this.createTeleportTrail(attacker, defender, !!isChar1Attacker);
    });

    // Attacker teleports near defender
    timeline.to(attacker.position, {
      x: isChar1Attacker ? defender.position.x - 1.5 : defender.position.x + 1.5,
      y: defender.position.y + 1,
      duration: 0.15,
      ease: 'power4.inOut',
      onComplete: () => {
        // Phase 5: Impact moment
        this.createMassiveImpact(defender.position, action);
        this.createEnergyWave(defender.position, isCritical);

        if (isCritical) {
          this.screenFlash();
        }

        // Defender reaction - more dramatic
        gsap.to(defender.position, {
          x: defender.position.x + (isChar1Attacker ? 1.5 : -1.5),
          y: defender.position.y + 0.5,
          duration: 0.2,
          ease: 'power2.out',
        });

        gsap.to(defender.rotation, {
          z: (isChar1Attacker ? 1 : -1) * 0.4,
          y: (isChar1Attacker ? 1 : -1) * Math.PI * 0.05,
          duration: 0.2,
        });

        gsap.to(defender.scale, {
          x: 0.9,
          y: 0.9,
          z: 0.9,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
        });
      },
    });

    // Phase 6: Return to position with backflip
    timeline.to(attacker.position, {
      x: originalPos.x,
      y: originalPos.y + 3,
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
      y: originalPos.y,
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
      x: 1,
      y: 1,
      z: 1,
      duration: 0.2,
    });

    // Defender recovers
    timeline.to(
      defender.position,
      {
        x: isChar1Attacker ? this.character2!.position.x : this.character1!.position.x,
        y: isChar1Attacker ? this.character2!.position.y : this.character1!.position.y,
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

    // Reset camera and time
    timeline.call(() => {
      this.resetCamera();
      this.timeSlowActive = false;
    });

    // Victory or defeat animation
    if (this.character1?.health === 0 || this.character2?.health === 0) {
      timeline.call(() => {
        this.playSpectacularDefeatAnimation();
      });
    }
  }

  private createChargingEffect(attacker: THREE.Group, isCritical: boolean): void {
    const venomColor = isCritical ? 0xff0000 : 0x00ff00;
    const chargeLight = new THREE.PointLight(venomColor, 5, 5);
    chargeLight.position.copy(attacker.position);
    chargeLight.position.y += 1;
    this.scene.add(chargeLight);

    // Venom droplets dripping from spider fangs
    for (let i = 0; i < 12; i++) {
      const dropletGeometry = new THREE.SphereGeometry(0.12, 8, 8);
      dropletGeometry.scale(1, 1.5, 1); // Make it droplet-shaped
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
    // Spider web defensive shield
    const shieldGeometry = new THREE.IcosahedronGeometry(2, 1);
    const shieldMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      wireframe: true,
      side: THREE.DoubleSide,
    });
    const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
    shield.position.copy(defender.position);
    shield.position.y += 1;
    this.scene.add(shield);

    // Web shimmer effect
    const shieldLight = new THREE.PointLight(0xffffff, 15, 5);
    shieldLight.position.copy(defender.position);
    shieldLight.position.y += 1;
    this.scene.add(shieldLight);

    gsap.to(shield.scale, {
      x: 1.5,
      y: 1.5,
      z: 1.5,
      duration: 0.15,
      yoyo: true,
      repeat: 1,
    });

    gsap.to(shieldMaterial, {
      opacity: 0,
      duration: 0.6,
      delay: 0.3,
      onComplete: () => {
        this.scene.remove(shield);
        this.scene.remove(shieldLight);
        shieldGeometry.dispose();
        shieldMaterial.dispose();
      },
    });

    gsap.to(shieldLight, {
      intensity: 0,
      duration: 0.6,
      delay: 0.3,
    });
  }

  private createLightningStrike(from: THREE.Vector3, to: THREE.Vector3): void {
    const points: THREE.Vector3[] = [];
    const segments = 15;

    points.push(from.clone());
    points[0].y += 8;

    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const point = new THREE.Vector3().lerpVectors(from, to, t);
      point.y += 8 - t * 6;
      point.x += (Math.random() - 0.5) * 0.5;
      point.z += (Math.random() - 0.5) * 0.5;
      points.push(point);
    }

    points.push(to.clone());
    points[points.length - 1].y += 2;

    const lightningGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const lightningMaterial = new THREE.LineBasicMaterial({
      color: 0xffff00,
      linewidth: 3,
      transparent: true,
      opacity: 1,
    });
    const lightning = new THREE.Line(lightningGeometry, lightningMaterial);
    this.scene.add(lightning);
    this.lightningBolts.push(lightning as unknown as THREE.Mesh);

    // Lightning glow
    const glowLight = new THREE.PointLight(0xffff00, 30, 10);
    glowLight.position.copy(to);
    glowLight.position.y += 2;
    this.scene.add(glowLight);

    // Create secondary bolts
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const secondaryPoints: THREE.Vector3[] = points.map((p) => {
          const newPoint = p.clone();
          newPoint.x += (Math.random() - 0.5) * 0.3;
          newPoint.z += (Math.random() - 0.5) * 0.3;
          return newPoint;
        });
        const secGeometry = new THREE.BufferGeometry().setFromPoints(secondaryPoints);
        const secMaterial = new THREE.LineBasicMaterial({
          color: 0xffff00,
          linewidth: 2,
          transparent: true,
          opacity: 0.6,
        });
        const secLightning = new THREE.Line(secGeometry, secMaterial);
        this.scene.add(secLightning);

        gsap.to(secMaterial, {
          opacity: 0,
          duration: 0.2,
          onComplete: () => {
            this.scene.remove(secLightning);
            secGeometry.dispose();
            secMaterial.dispose();
          },
        });
      }, i * 50);
    }

    gsap.to(lightningMaterial, {
      opacity: 0,
      duration: 0.3,
      delay: 0.2,
      onComplete: () => {
        this.scene.remove(lightning);
        this.scene.remove(glowLight);
        lightningGeometry.dispose();
        lightningMaterial.dispose();
        const index = this.lightningBolts.indexOf(lightning as unknown as THREE.Mesh);
        if (index > -1) this.lightningBolts.splice(index, 1);
      },
    });

    gsap.to(glowLight, {
      intensity: 0,
      duration: 0.3,
      delay: 0.2,
    });
  }

  private createTeleportTrail(
    attacker: THREE.Group,
    defender: THREE.Group,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _isChar1: boolean,
  ): void {
    const trailCount = 20;
    for (let i = 0; i < trailCount; i++) {
      const ghostGeometry = new THREE.SphereGeometry(0.4, 16, 16);
      const ghostMaterial = new THREE.MeshBasicMaterial({
        color: 0x34f5dd,
        transparent: true,
        opacity: 0.3,
      });
      const ghost = new THREE.Mesh(ghostGeometry, ghostMaterial);

      const t = i / trailCount;
      ghost.position.lerpVectors(attacker.position, defender.position, t);
      ghost.position.y += 1;
      this.scene.add(ghost);

      gsap.to(ghostMaterial, {
        opacity: 0,
        duration: 0.3,
        delay: i * 0.01,
        onComplete: () => {
          this.scene.remove(ghost);
          ghostGeometry.dispose();
          ghostMaterial.dispose();
        },
      });
    }
  }

  private createMassiveImpact(position: THREE.Vector3, action: BattleAction): void {
    const isCritical = action.type === 'critical';
    const color = isCritical ? 0xff0044 : action.type === 'blocked' ? 0x00aaff : 0x34f5dd;

    // Shockwave rings
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

    // Impact explosion particles
    const particleCount = isCritical ? 500 : 300;
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
      // Dramatic zoom for critical hits
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

  private playSpectacularDefeatAnimation(): void {
    const loser = this.character1?.health === 0 ? this.character1Mesh : this.character2Mesh;

    const timeline = gsap.timeline();

    // Loser disintegration effect
    timeline.call(() => {
      this.createDisintegrationEffect(loser);
    });

    // Loser slow-motion fall with dramatic spin
    timeline.to(loser.position, {
      y: -2,
      duration: 2.5,
      ease: 'power2.in',
    });

    timeline.to(
      loser.rotation,
      {
        x: Math.PI * 1.5,
        y: Math.PI,
        duration: 2.5,
        ease: 'power2.in',
      },
      '<',
    );

    timeline.to(
      loser.scale,
      {
        x: 0.3,
        y: 0.3,
        z: 0.3,
        duration: 2.5,
        ease: 'power2.in',
      },
      '<',
    );
  }

  private createDisintegrationEffect(loser: THREE.Group): void {
    const particleCount = 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities: THREE.Vector3[] = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = loser.position.x + (Math.random() - 0.5) * 2;
      positions[i * 3 + 1] = loser.position.y + Math.random() * 4;
      positions[i * 3 + 2] = loser.position.z + (Math.random() - 0.5) * 2;

      velocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.2,
          Math.random() * 0.3,
          (Math.random() - 0.5) * 0.2,
        ),
      );
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0x666666,
      size: 0.15,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      map: this.circleTexture,
      alphaTest: 0.01,
    });

    const particleSystem = new THREE.Points(geometry, material);
    this.scene.add(particleSystem);

    gsap.to(material, {
      opacity: 0,
      duration: 2.5,
      onUpdate: () => {
        const pos = geometry.attributes['position'];
        for (let i = 0; i < particleCount; i++) {
          pos.array[i * 3] += velocities[i].x;
          pos.array[i * 3 + 1] += velocities[i].y;
          pos.array[i * 3 + 2] += velocities[i].z;
          velocities[i].y -= 0.01;
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

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    // Dynamic camera movement for cinematic effect
    const time = Date.now() * 0.0001;
    if (!this.timeSlowActive) {
      this.camera.position.x = this.cameraOriginalPosition.x + Math.sin(time) * 0.3;
      this.camera.position.y = this.cameraOriginalPosition.y + Math.sin(time * 0.7) * 0.2;
    }

    // Update lightning bolts if any
    this.lightningBolts.forEach((bolt) => {
      if (bolt.material) {
        (bolt.material as THREE.LineBasicMaterial).opacity *= 0.95;
      }
    });

    this.renderer.render(this.scene, this.camera);
  }

  startBattle(): void {
    this.battleService.startBattle(
      {
        id: 'char1',
        name: 'Celestial Guardian',
        health: 120,
        maxHealth: 120,
        defense: 18,
        attack: 28,
        color: '#34f5dd',
      },
      {
        id: 'char2',
        name: 'Azure Sentinel',
        health: 110,
        maxHealth: 110,
        defense: 22,
        attack: 26,
        color: '#34d3f5',
      },
    );
  }

  resetBattle(): void {
    // Clear characters
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

    this.battleService.resetBattle();
    this.character1 = null;
    this.character2 = null;
  }

  getHealthPercentage(character: BattleCharacter | null): number {
    if (!character) return 0;
    return (character.health / character.maxHealth) * 100;
  }
}
