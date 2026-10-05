import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { soundEngine } from './sound.js';
import { ToyFactory } from './objects.js';
import { EffectsManager } from './particles.js';

// Game State & Configuration
class BabyWonderKeysApp {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.canvas = document.getElementById('webgl-canvas');

    // Stats & combo
    this.combo = 0;
    this.lastActionTime = 0;
    this.partyActive = false;

    // Active toys pool
    this.activeToys = [];
    this.maxToys = 18;

    // Theme index: 0 = Candy, 1 = Starry Night, 2 = Ocean
    this.currentThemeIndex = 0;
    this.themes = [
      {
        name: '糖果乐园',
        icon: '🌈',
        bg: 0xffeef6,
        floorColor: 0xffdbe9,
        fogColor: 0xffeef6,
        lightColor: 0xfff5e6,
        ambientColor: 0xffffff,
        ambientIntensity: 0.9
      },
      {
        name: '极光星空',
        icon: '🌌',
        bg: 0x0f172a,
        floorColor: 0x1e293b,
        fogColor: 0x0f172a,
        lightColor: 0x818cf8,
        ambientColor: 0x6366f1,
        ambientIntensity: 0.6
      },
      {
        name: '萌趣深海',
        icon: '🌊',
        bg: 0x0b7285,
        floorColor: 0x15aabf,
        fogColor: 0x0b7285,
        lightColor: 0x66d9e8,
        ambientColor: 0x99e9f2,
        ambientIntensity: 0.8
      }
    ];

    // Camera shake recoil
    this.cameraShake = new THREE.Vector3();
    this.cameraBasePos = new THREE.Vector3(0, 5, 12);

    this.initThree();
    this.toyFactory = new ToyFactory();
    this.effects = new EffectsManager(this.scene);

    this.initSceneEnvironment();
    this.initUI();
    this.initInputListeners();

    // Clock
    this.clock = new THREE.Clock();
    this.animate();
  }

  initThree() {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.themes[0].bg);
    this.scene.fog = new THREE.FogExp2(this.themes[0].fogColor, 0.035);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.copy(this.cameraBasePos);
    this.camera.lookAt(0, 1.5, 0);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    // 4. Raycaster for clicking 3D toys & bubbles
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  initSceneEnvironment() {
    // Ambient & Directional Lights
    const theme = this.themes[this.currentThemeIndex];
    this.ambientLight = new THREE.AmbientLight(theme.ambientColor, theme.ambientIntensity);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(theme.lightColor, 1.5);
    this.dirLight.position.set(6, 14, 8);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 40;
    this.dirLight.shadow.camera.left = -12;
    this.dirLight.shadow.camera.right = 12;
    this.dirLight.shadow.camera.top = 12;
    this.dirLight.shadow.camera.bottom = -12;
    this.scene.add(this.dirLight);

    // Cute hemisphere sky light
    this.hemiLight = new THREE.HemisphereLight(0xfff0f6, 0xd0ebff, 0.5);
    this.scene.add(this.hemiLight);

    // Floor Mesh (Soft pastel bouncy stage)
    const floorGeo = new THREE.CircleGeometry(24, 64);
    floorGeo.rotateX(-Math.PI / 2);
    this.floorMat = new THREE.MeshStandardMaterial({
      color: theme.floorColor,
      roughness: 0.35,
      metalness: 0.05
    });
    this.floor = new THREE.Mesh(floorGeo, this.floorMat);
    this.floor.receiveShadow = true;
    this.floor.position.y = 0;
    this.scene.add(this.floor);

    // Floating fluffy clouds in background
    this.backgroundClouds = [];
    for (let i = 0; i < 6; i++) {
      const cloud = this.toyFactory.createCloud();
      cloud.position.set(
        (Math.random() - 0.5) * 22,
        Math.random() * 4 + 4,
        (Math.random() - 0.5) * 10 - 5
      );
      const s = 0.7 + Math.random() * 0.6;
      cloud.scale.set(s, s, s);
      cloud.userData = { speed: 0.2 + Math.random() * 0.3 };
      this.scene.add(cloud);
      this.backgroundClouds.push(cloud);
    }
  }

  // Switch between 3 aesthetic visual themes
  switchTheme(index = null) {
    if (index === null) {
      this.currentThemeIndex = (this.currentThemeIndex + 1) % this.themes.length;
    } else {
      this.currentThemeIndex = index % this.themes.length;
    }

    const t = this.themes[this.currentThemeIndex];
    this.scene.background.setHex(t.bg);
    this.scene.fog.color.setHex(t.fogColor);
    this.floorMat.color.setHex(t.floorColor);
    this.ambientLight.color.setHex(t.ambientColor);
    this.ambientLight.intensity = t.ambientIntensity;
    this.dirLight.color.setHex(t.lightColor);

    // Update HUD button
    const iconEl = document.getElementById('theme-icon');
    const textEl = document.getElementById('theme-text');
    if (iconEl) iconEl.textContent = t.icon;
    if (textEl) textEl.textContent = t.name;

    // Burst confetti to celebrate new theme
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.15 }
    });
  }

  // Spawn an active bouncing toy
  spawnToy(worldPos = null, keyChar = '') {
    // Increment combo
    const now = performance.now();
    if (now - this.lastActionTime < 1400) {
      this.combo++;
    } else {
      this.combo = 1;
    }
    this.lastActionTime = now;
    this.updateComboUI();

    // Spawn coordinate
    const pos = worldPos ? worldPos.clone() : new THREE.Vector3(
      (Math.random() - 0.5) * 7,
      0.5,
      (Math.random() - 0.5) * 4 + 0.5
    );

    // Limit active toys count
    if (this.activeToys.length >= this.maxToys) {
      const oldest = this.activeToys.shift();
      this.removeToy(oldest);
    }

    const { mesh, type } = this.toyFactory.createRandomToy(keyChar);
    mesh.position.copy(pos);
    mesh.position.y = 0.5;

    // Enable shadows on children
    mesh.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Upward velocity & horizontal kick
    const isBalloon = type === 'balloon';
    const vy = isBalloon ? 2.5 + Math.random() * 2 : 6.0 + Math.random() * 3.5;
    const vx = (Math.random() - 0.5) * 4;
    const vz = (Math.random() - 0.5) * 3;

    const toyData = {
      mesh,
      type,
      isBalloon,
      velocity: new THREE.Vector3(vx, vy, vz),
      rotVelocity: new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4
      ),
      bounces: 0,
      scale: 0.1,
      targetScale: 1.0,
      age: 0
    };

    this.scene.add(mesh);
    this.activeToys.push(toyData);

    // Trigger visual light explosion & particles
    this.effects.triggerLightBurst(pos);
    this.effects.triggerShockwave(pos);
    this.effects.triggerParticleBurst(pos, 22);

    // Camera recoil impulse
    this.cameraShake.set(
      (Math.random() - 0.5) * 0.25,
      (Math.random() - 0.5) * 0.25,
      (Math.random() - 0.5) * 0.25
    );

    // Show center fleeting HUD card
    this.showKeyCard(keyChar);

    // Sound
    soundEngine.playKeySound(keyChar);
  }

  removeToy(toyData) {
    this.effects.triggerParticleBurst(toyData.mesh.position, 12);
    this.scene.remove(toyData.mesh);
    toyData.mesh.traverse((c) => {
      if (c.geometry) c.geometry.dispose();
      if (c.material) {
        if (Array.isArray(c.material)) c.material.forEach(m => m.dispose());
        else c.material.dispose();
      }
    });
  }

  showKeyCard(key) {
    const card = document.getElementById('key-pop-card');
    const charEl = document.getElementById('key-pop-char');
    const wordEl = document.getElementById('key-pop-word');
    if (!card || !charEl || !wordEl) return;

    const clean = key ? key.toUpperCase() : '✨';
    const wordInfo = soundEngine.letterWords[clean];

    charEl.textContent = clean;
    if (wordInfo) {
      wordEl.textContent = `${wordInfo.emoji} ${wordInfo.cn} ${wordInfo.en}`;
    } else {
      const funPraise = ['棒棒哒！🎉', '好厉害！⭐', '真棒！🌟', '魔法变！✨', '再按一个！🎈'];
      wordEl.textContent = funPraise[Math.floor(Math.random() * funPraise.length)];
    }

    card.classList.remove('show');
    void card.offsetWidth; // Trigger reflow
    card.classList.add('show');

    if (this.cardTimer) clearTimeout(this.cardTimer);
    this.cardTimer = setTimeout(() => {
      card.classList.remove('show');
    }, 1100);
  }

  updateComboUI() {
    const comboEl = document.getElementById('combo-num');
    if (comboEl) comboEl.textContent = this.combo;

    const partyBorder = document.getElementById('party-border');
    if (this.combo >= 6) {
      if (!this.partyActive && partyBorder) {
        partyBorder.classList.add('active');
        this.partyActive = true;
      }
    } else {
      if (this.partyActive && partyBorder) {
        partyBorder.classList.remove('active');
        this.partyActive = false;
      }
    }

    // Big milestone confetti
    if (this.combo > 0 && this.combo % 15 === 0) {
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 }
      });
      soundEngine.playMagicSparkle(1046);
    }
  }

  initInputListeners() {
    // 1. Keyboard Masher Protection & Trigger
    window.addEventListener('keydown', (e) => {
      // Prevent browser shortcuts that disrupt toddlers:
      // Space (scrolls down), Backspace (history back), Tab (focus jump), Arrows (scrolling)
      if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Backspace', 'PageUp', 'PageDown'].includes(e.key)) {
        e.preventDefault();
      }

      // Filter modifier keys alone (like Shift, Alt, Ctrl, Meta)
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) {
        this.spawnToy(null, '✨');
        return;
      }

      this.spawnToy(null, e.key);
    }, { passive: false });

    // 2. Mouse / Touch PointerDown
    window.addEventListener('pointerdown', (e) => {
      // Ignore clicks on HUD buttons or modals
      if (e.target.closest('.top-hud') || e.target.closest('.modal-card')) {
        return;
      }

      soundEngine.ensureContext();

      // Convert pointer to normalized device coordinates
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);

      // Check if clicked a floating bubble
      const bubbleIntersects = this.raycaster.intersectObjects(this.effects.bubbles, false);
      if (bubbleIntersects.length > 0) {
        const hitBubble = bubbleIntersects[0].object;
        this.effects.popBubble(hitBubble);
        soundEngine.playBubblePop(700);
        return;
      }

      // Check if clicked an active toy
      const toyMeshes = this.activeToys.map(t => t.mesh);
      const toyIntersects = this.raycaster.intersectObjects(toyMeshes, true);
      if (toyIntersects.length > 0) {
        // Find which toy was hit
        let root = toyIntersects[0].object;
        while (root.parent && root.parent !== this.scene) {
          root = root.parent;
        }
        const hitToy = this.activeToys.find(t => t.mesh === root);
        if (hitToy) {
          // Bouncy trampoline jump!
          hitToy.velocity.y = 8.5;
          hitToy.rotVelocity.y += 8;
          soundEngine.playBoing(300);
          this.effects.triggerLightBurst(root.position);
          this.effects.triggerParticleBurst(root.position, 15);
          return;
        }
      }

      // Intersect ground to spawn right under pointer
      const floorIntersects = this.raycaster.intersectObject(this.floor);
      if (floorIntersects.length > 0) {
        const spawnPos = floorIntersects[0].point;
        this.spawnToy(spawnPos, 'Touch');
      } else {
        this.spawnToy(null, 'Touch');
      }
    });

    // 3. Pointer move for magical star trail
    let lastMoveTime = 0;
    window.addEventListener('pointermove', (e) => {
      const now = performance.now();
      if (now - lastMoveTime > 75) {
        lastMoveTime = now;
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObject(this.floor);
        if (intersects.length > 0) {
          // Tiny sparkle at mouse tip
          this.effects.triggerParticleBurst(intersects[0].point, 2);
        }
      }
    });
  }

  initUI() {
    // Theme Switch
    const btnTheme = document.getElementById('btn-theme');
    if (btnTheme) {
      btnTheme.addEventListener('click', () => this.switchTheme());
    }

    // BGM Toggle
    const btnBgm = document.getElementById('btn-bgm');
    if (btnBgm) {
      btnBgm.addEventListener('click', () => {
        const isPlaying = soundEngine.toggleBGM();
        btnBgm.classList.toggle('active', isPlaying);
      });
    }

    // Speech Toggle
    const btnSpeech = document.getElementById('btn-speech');
    if (btnSpeech) {
      btnSpeech.addEventListener('click', () => {
        soundEngine.speechEnabled = !soundEngine.speechEnabled;
        btnSpeech.classList.toggle('active', soundEngine.speechEnabled);
      });
    }

    // Sound / Mute Toggle
    const btnSound = document.getElementById('btn-sound');
    const soundIcon = document.getElementById('sound-icon');
    if (btnSound) {
      btnSound.addEventListener('click', () => {
        const isMuted = soundEngine.toggleMute();
        btnSound.classList.toggle('active', !isMuted);
        if (soundIcon) soundIcon.textContent = isMuted ? '🔇' : '🔊';
      });
    }

    // Fullscreen Mode Toggle
    const btnFullscreen = document.getElementById('btn-fullscreen');
    if (btnFullscreen) {
      btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
          btnFullscreen.classList.add('active');
        } else {
          document.exitFullscreen().catch(() => {});
          btnFullscreen.classList.remove('active');
        }
      });
    }

    // Guide Modal
    const btnHelp = document.getElementById('btn-help');
    const modalGuide = document.getElementById('modal-guide');
    const btnCloseModal = document.getElementById('btn-close-modal');

    if (btnHelp && modalGuide) {
      btnHelp.addEventListener('click', () => {
        modalGuide.classList.add('show');
      });
    }
    if (btnCloseModal && modalGuide) {
      btnCloseModal.addEventListener('click', () => {
        modalGuide.classList.remove('show');
        soundEngine.ensureContext();
      });
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.clock.getDelta(), 0.1);

    // 1. Update Camera Shake
    this.cameraShake.lerp(new THREE.Vector3(0, 0, 0), delta * 8);
    this.camera.position.copy(this.cameraBasePos).add(this.cameraShake);

    // 2. Animate Background Clouds
    const time = performance.now() * 0.001;
    this.backgroundClouds.forEach((cloud) => {
      cloud.position.x += cloud.userData.speed * delta;
      cloud.position.y += Math.sin(time + cloud.position.x) * 0.003;
      if (cloud.position.x > 14) {
        cloud.position.x = -14;
      }
    });

    // 3. Update Active Toys Physics
    for (let i = this.activeToys.length - 1; i >= 0; i--) {
      const toy = this.activeToys[i];
      toy.age += delta;

      // Scale pop-in
      if (toy.scale < toy.targetScale) {
        toy.scale += delta * 6;
        if (toy.scale > toy.targetScale) toy.scale = toy.targetScale;
        toy.mesh.scale.set(toy.scale, toy.scale, toy.scale);
      }

      if (toy.isBalloon) {
        // Floating balloon physics
        toy.mesh.position.y += toy.velocity.y * delta;
        toy.mesh.position.x += Math.sin(time * 2 + toy.mesh.position.y) * 0.02;
        toy.mesh.rotation.z = Math.sin(time * 3) * 0.15;

        // Auto remove if too high
        if (toy.mesh.position.y > 10) {
          this.activeToys.splice(i, 1);
          this.removeToy(toy);
          continue;
        }
      } else {
        // Standard gravity & bounce physics
        toy.velocity.y -= 9.8 * delta;
        toy.mesh.position.addScaledVector(toy.velocity, delta);

        toy.mesh.rotation.x += toy.rotVelocity.x * delta;
        toy.mesh.rotation.y += toy.rotVelocity.y * delta;
        toy.mesh.rotation.z += toy.rotVelocity.z * delta;

        // Ground bounce collision
        if (toy.mesh.position.y < 0.5) {
          toy.mesh.position.y = 0.5;
          toy.velocity.y = -toy.velocity.y * 0.62; // Bounciness factor
          toy.velocity.x *= 0.82;
          toy.velocity.z *= 0.82;
          toy.rotVelocity.multiplyScalar(0.75);
          toy.bounces++;

          // Gentle squash on bounce
          toy.mesh.scale.set(toy.scale * 1.25, toy.scale * 0.75, toy.scale * 1.25);
        } else {
          // Recover to normal aspect
          toy.mesh.scale.lerp(new THREE.Vector3(toy.scale, toy.scale, toy.scale), delta * 12);
        }

        // Slowly age & retire after staying still
        if (toy.bounces > 4 && toy.velocity.length() < 0.3 && toy.age > 12) {
          this.activeToys.splice(i, 1);
          this.removeToy(toy);
        }
      }
    }

    // 4. Update Effects & Particles
    this.effects.update(delta);

    // 5. Render Scene
    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize Application once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new BabyWonderKeysApp();
});
