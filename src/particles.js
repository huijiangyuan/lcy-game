import * as THREE from 'three';

// Visual Effects & Lighting Engine for Toddlers
// Handles glowing point light bursts, expanding shockwave rings, particle explosions, and floating pop-bubbles

export class EffectsManager {
  constructor(scene) {
    this.scene = scene;

    // Light pool
    this.lights = [];
    this.activeLights = [];

    // Particle pool
    this.particles = [];

    // Shockwaves
    this.shockwaves = [];

    // Ambient floating interactive bubbles
    this.bubbles = [];

    // Setup reusable assets
    this.initLightPool(8);
    this.initShockwaveGeometries();
    this.initAmbientBubbles(25);
  }

  initLightPool(size = 8) {
    for (let i = 0; i < size; i++) {
      const light = new THREE.PointLight(0xffffff, 0, 14, 1.8);
      light.visible = false;
      this.scene.add(light);
      this.lights.push({
        light,
        active: false,
        intensity: 0,
        decayRate: 0.05
      });
    }
  }

  initShockwaveGeometries() {
    this.ringGeo = new THREE.RingGeometry(0.2, 0.45, 32);
    this.ringGeo.rotateX(-Math.PI / 2); // Flat on ground
  }

  // Trigger a dramatic colorful light flash in the 3D scene
  triggerLightBurst(position, colorHex = null) {
    const colors = [0xff4d4f, 0xffd129, 0x38d9a9, 0x4dabf7, 0x9775fa, 0xff70a6];
    const color = colorHex || colors[Math.floor(Math.random() * colors.length)];

    // Find available light in pool
    let lightItem = this.lights.find(l => !l.active);
    if (!lightItem) {
      // Reuse oldest
      lightItem = this.lights[0];
    }

    lightItem.active = true;
    lightItem.light.color.setHex(color);
    lightItem.light.position.copy(position).add(new THREE.Vector3(0, 1.2, 0.5));
    lightItem.light.intensity = 6.0;
    lightItem.light.visible = true;
    lightItem.decayRate = 0.045 + Math.random() * 0.02;

    if (!this.activeLights.includes(lightItem)) {
      this.activeLights.push(lightItem);
    }
  }

  // Expanding shockwave circle on the floor
  triggerShockwave(position, colorHex = 0xffffff) {
    const mat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const ring = new THREE.Mesh(this.ringGeo, mat);
    ring.position.copy(position);
    ring.position.y = 0.04; // Just above floor to prevent z-fighting
    ring.scale.set(0.1, 0.1, 0.1);

    this.scene.add(ring);
    this.shockwaves.push({
      mesh: ring,
      opacity: 0.8,
      scaleSpeed: 0.35 + Math.random() * 0.15,
      fadeSpeed: 0.025
    });
  }

  // Colorful 3D confetti & star particle explosion
  triggerParticleBurst(position, count = 28) {
    const colors = [0xffd129, 0xff70a6, 0x4dabf7, 0x38d9a9, 0x9775fa, 0xff4d4f, 0xffffff];

    // Shared sphere geometry for candy particles
    const sphereGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const boxGeo = new THREE.BoxGeometry(0.16, 0.16, 0.04);

    for (let i = 0; i < count; i++) {
      const isStarOrBox = Math.random() > 0.5;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.2,
        metalness: 0.1
      });

      const mesh = new THREE.Mesh(isStarOrBox ? boxGeo : sphereGeo, mat);
      mesh.position.copy(position);

      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 4.5;
      const upward = 3.5 + Math.random() * 5.0;

      const vx = Math.cos(angle) * (speed * 0.7);
      const vy = upward;
      const vz = Math.sin(angle) * (speed * 0.7);

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        velocity: new THREE.Vector3(vx, vy, vz),
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8
        ),
        gravity: 9.8,
        life: 1.0,
        decay: 0.015 + Math.random() * 0.01
      });
    }
  }

  // Floating ambient soap bubbles
  initAmbientBubbles(count = 25) {
    const bubbleGeo = new THREE.SphereGeometry(0.4, 20, 20);

    for (let i = 0; i < count; i++) {
      const bubbleMat = new THREE.MeshPhysicalMaterial({
        color: 0xebfbee,
        transmission: 0.85,
        opacity: 0.8,
        transparent: true,
        roughness: 0.05,
        ior: 1.2,
        specularIntensity: 1.0
      });

      const bubble = new THREE.Mesh(bubbleGeo, bubbleMat);
      this.resetBubble(bubble, true);
      this.scene.add(bubble);
      this.bubbles.push(bubble);
    }
  }

  resetBubble(bubble, initial = false) {
    bubble.position.x = (Math.random() - 0.5) * 20;
    bubble.position.y = initial ? Math.random() * 8 + 0.5 : 0.2;
    bubble.position.z = (Math.random() - 0.5) * 12 - 2;

    const scale = 0.5 + Math.random() * 0.7;
    bubble.scale.set(scale, scale, scale);

    bubble.userData = {
      speedY: 0.015 + Math.random() * 0.025,
      wobbleSpeed: 1 + Math.random() * 2,
      wobbleOffset: Math.random() * Math.PI * 2,
      wobbleRadius: 0.02 + Math.random() * 0.03
    };
  }

  // Pop a bubble with micro-burst
  popBubble(bubble) {
    this.triggerParticleBurst(bubble.position, 12);
    this.triggerShockwave(new THREE.Vector3(bubble.position.x, 0.05, bubble.position.z), 0x4dabf7);
    this.resetBubble(bubble);
  }

  update(delta) {
    // 1. Update dynamic lights
    for (let i = this.activeLights.length - 1; i >= 0; i--) {
      const item = this.activeLights[i];
      item.light.intensity -= item.decayRate * 60 * delta;
      if (item.light.intensity <= 0.05) {
        item.light.intensity = 0;
        item.light.visible = false;
        item.active = false;
        this.activeLights.splice(i, 1);
      }
    }

    // 2. Update shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const s = this.shockwaves[i];
      s.mesh.scale.addScalar(s.scaleSpeed * 60 * delta);
      s.opacity -= s.fadeSpeed * 60 * delta;
      s.mesh.material.opacity = Math.max(0, s.opacity);

      if (s.opacity <= 0) {
        this.scene.remove(s.mesh);
        s.mesh.geometry.dispose();
        s.mesh.material.dispose();
        this.shockwaves.splice(i, 1);
      }
    }

    // 3. Update particle explosions
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.velocity.y -= p.gravity * delta;
      p.mesh.position.addScaledVector(p.velocity, delta);

      p.mesh.rotation.x += p.rotSpeed.x * delta;
      p.mesh.rotation.y += p.rotSpeed.y * delta;
      p.mesh.rotation.z += p.rotSpeed.z * delta;

      // Bounce on floor
      if (p.mesh.position.y < 0.1) {
        p.mesh.position.y = 0.1;
        p.velocity.y = -p.velocity.y * 0.45;
        p.velocity.x *= 0.8;
        p.velocity.z *= 0.8;
      }

      p.life -= p.decay * 60 * delta;
      const curScale = Math.max(0, p.life);
      p.mesh.scale.set(curScale, curScale, curScale);

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this.particles.splice(i, 1);
      }
    }

    // 4. Update floating bubbles
    const time = performance.now() * 0.001;
    for (const bubble of this.bubbles) {
      bubble.position.y += bubble.userData.speedY * 60 * delta;
      bubble.position.x += Math.sin(time * bubble.userData.wobbleSpeed + bubble.userData.wobbleOffset) * bubble.userData.wobbleRadius;

      // Wrap around top
      if (bubble.position.y > 9) {
        this.resetBubble(bubble);
      }
    }
  }
}
