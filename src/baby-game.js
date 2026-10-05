import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// Status helper
function showStatus(msg, isErr) {
  const s = document.getElementById('status');
  if (!s) return;
  s.textContent = msg;
  s.style.display = 'block';
  s.style.color = '#fff';
  s.style.background = isErr ? 'rgba(180,30,40,.92)' : 'rgba(0,0,0,.45)';
}
function hideStatus() {
  const s = document.getElementById('status');
  if (s) s.style.display = 'none';
}

const app = document.getElementById('app');

// ---- 1) 场景 ----
const scene = new THREE.Scene();
scene.background = makeGradientTexture();

// ---- 2) 相机（固定正面） ----
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 0, 14);

// ---- 3) 渲染器 ----
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
app.appendChild(renderer.domElement);

// ---- 4) 灯光（柔和环境光，不过曝） ----
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const dir = new THREE.DirectionalLight(0xffffff, 0.7);
dir.position.set(5, 8, 10);
scene.add(dir);

// ---- 5) 辉光后处理（克制：只给亮部一点点柔光，不刺眼） ----
let composer = null;
try {
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.45,
    0.4,
    0.55
  );
  composer.addPass(bloomPass);
} catch (e) {
  console.warn('Bloom 后处理不可用，降级为普通渲染：', e);
  composer = null;
}

makeStarfield();

// ====================== 工具函数 ======================
function makeGradientTexture() {
  const c = document.createElement('canvas');
  c.width = 16;
  c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0.0, '#241a52');
  grad.addColorStop(0.5, '#2f2370');
  grad.addColorStop(1.0, '#143056');
  g.fillStyle = grad;
  g.fillRect(0, 0, 16, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeStarfield() {
  const n = 320;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 80;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
    pos[i * 3 + 2] = -20 - Math.random() * 40;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.14,
    transparent: true,
    opacity: 0.45,
    depthWrite: false
  });
  scene.add(new THREE.Points(geo, mat));
}

function randColor() {
  return new THREE.Color().setHSL(Math.random(), 0.8, 0.55);
}

function makeStarShape(outer = 1.1, inner = 0.5, points = 5) {
  const shape = new THREE.Shape();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

function makeHeartShape(s = 1.0) {
  const sh = new THREE.Shape();
  sh.moveTo(0, 0.5 * s);
  sh.bezierCurveTo(0, 0.5 * s, -0.5 * s, 0.8 * s, -0.5 * s, 0.3 * s);
  sh.bezierCurveTo(-0.5 * s, -0.1 * s, 0, -0.3 * s, 0, -0.6 * s);
  sh.bezierCurveTo(0, -0.3 * s, 0.5 * s, -0.1 * s, 0.5 * s, 0.3 * s);
  sh.bezierCurveTo(0.5 * s, 0.8 * s, 0, 0.5 * s, 0, 0.5 * s);
  return sh;
}

function easeOutBack(x) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

// ====================== 网格占位：保证形状不挤在一块 ======================
const GRID_COLS = 4;
const GRID_ROWS = 3;
const MAX_ITEMS = GRID_COLS * GRID_ROWS; // 12
const PLAY_X = 9;
const PLAY_Y = 5;
const occupied = new Set();

function nextCell() {
  if (occupied.size >= MAX_ITEMS) occupied.clear();
  let idx;
  let attempts = 0;
  do {
    idx = Math.floor(Math.random() * MAX_ITEMS);
    attempts++;
  } while (occupied.has(idx) && attempts < 50);

  occupied.add(idx);
  const col = idx % GRID_COLS;
  const row = Math.floor(idx / GRID_COLS);
  const cx = -PLAY_X + (col + 0.5) * ((2 * PLAY_X) / GRID_COLS);
  const cy = -PLAY_Y + (row + 0.5) * ((2 * PLAY_Y) / GRID_ROWS);
  return { x: cx + (Math.random() - 0.5) * 1.2, y: cy + (Math.random() - 0.5) * 1.0, idx };
}

// ====================== 核心：生成一个惊喜 ======================
const items = [];
const particles = [];

function spawn(x, y) {
  const types = ['sphere', 'star', 'heart', 'gem', 'ring'];
  const type = types[Math.floor(Math.random() * types.length)];
  const color = randColor();

  let geo;
  const extrudeOpts = {
    depth: 0.4,
    bevelEnabled: true,
    bevelThickness: 0.12,
    bevelSize: 0.12,
    bevelSegments: 3
  };
  switch (type) {
    case 'sphere':
      geo = new THREE.SphereGeometry(1, 32, 32);
      break;
    case 'star':
      geo = new THREE.ExtrudeGeometry(makeStarShape(1.1, 0.5), extrudeOpts);
      break;
    case 'heart':
      geo = new THREE.ExtrudeGeometry(makeHeartShape(1.1), extrudeOpts);
      break;
    case 'gem':
      geo = new THREE.IcosahedronGeometry(1.15, 0);
      break;
    case 'ring':
      geo = new THREE.TorusGeometry(0.85, 0.35, 16, 48);
      break;
    default:
      geo = new THREE.SphereGeometry(1, 32, 32);
  }
  geo.center();

  const mat = new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 0.4,
    roughness: 0.35,
    metalness: 0.05,
    transparent: true,
    opacity: 1
  });
  const mesh = new THREE.Mesh(geo, mat);

  let px, py, cell;
  if (x !== undefined && y !== undefined) {
    px = x;
    py = y;
    cell = undefined;
  } else {
    const c = nextCell();
    px = c.x;
    py = c.y;
    cell = c.idx;
  }

  mesh.position.set(px, py, Math.random() * 1.5 - 0.75);
  mesh.scale.setScalar(0.001);
  scene.add(mesh);

  const light = new THREE.PointLight(color, 1.2, 9);
  light.position.copy(mesh.position);
  scene.add(light);

  items.push({
    mesh,
    light,
    mat,
    cell,
    life: 0,
    maxLife: 3.5 + Math.random() * 2.5,
    spin: new THREE.Vector3(
      (Math.random() - 0.5) * 1.2,
      (Math.random() - 0.5) * 1.2,
      (Math.random() - 0.5) * 1.2
    ),
    floatSeed: Math.random() * 10,
    baseY: mesh.position.y
  });

  spawnParticles(mesh.position, color);
  if (items.length > MAX_ITEMS) disposeItem(items.shift());
}

function disposeItem(it) {
  if (!it) return;
  scene.remove(it.mesh);
  scene.remove(it.light);
  it.mesh.geometry.dispose();
  it.mat.dispose();
  if (typeof it.cell === 'number') occupied.delete(it.cell);
}

function spawnParticles(pos, color) {
  const count = 18;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const velocities = [];
  for (let i = 0; i < count; i++) {
    positions[i * 3] = pos.x;
    positions[i * 3 + 1] = pos.y;
    positions[i * 3 + 2] = pos.z;
    const v = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
      .normalize()
      .multiplyScalar(2 + Math.random() * 2);
    velocities.push(v);
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: color,
    size: 0.18,
    transparent: true,
    opacity: 1,
    depthWrite: false
  });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  particles.push({ pts, mat, velocities, life: 0, maxLife: 1.0 });
  if (particles.length > 14) {
    const p = particles.shift();
    scene.remove(p.pts);
    p.pts.geometry.dispose();
    p.mat.dispose();
  }
}

// ====================== 动画循环 ======================
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  for (let i = items.length - 1; i >= 0; i--) {
    const it = items[i];
    it.life += dt;
    const p = it.life / it.maxLife;
    const s = p < 0.3 ? easeOutBack(p / 0.3) : 1;
    it.mesh.scale.setScalar(0.001 + s * 1);
    it.mesh.rotation.x += it.spin.x * dt;
    it.mesh.rotation.y += it.spin.y * dt;
    it.mesh.rotation.z += it.spin.z * dt;
    it.mesh.position.y = it.baseY + Math.sin(t * 1.2 + it.floatSeed) * 0.3;
    it.light.position.copy(it.mesh.position);
    if (p > 0.7) {
      const k = 1 - (p - 0.7) / 0.3;
      it.mat.opacity = k;
      it.light.intensity = 1.2 * k;
    }
    if (p >= 1) {
      disposeItem(it);
      items.splice(i, 1);
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const pa = particles[i];
    pa.life += dt;
    const arr = pa.pts.geometry.attributes.position.array;
    for (let j = 0; j < pa.velocities.length; j++) {
      const v = pa.velocities[j];
      arr[j * 3] += v.x * dt;
      arr[j * 3 + 1] += v.y * dt;
      arr[j * 3 + 2] += v.z * dt;
      v.y -= 3 * dt;
    }
    pa.pts.geometry.attributes.position.needsUpdate = true;
    const pp = pa.life / pa.maxLife;
    pa.mat.opacity = 1 - pp;
    if (pp >= 1) {
      scene.remove(pa.pts);
      pa.pts.geometry.dispose();
      pa.mat.dispose();
      particles.splice(i, 1);
    }
  }

  if (composer) composer.render();
  else renderer.render(scene, camera);
}
animate();

// ====================== 声音（Web Audio 合成） ======================
let audioCtx = null;
let isMuted = false;

function initAudio() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];

function playNote() {
  if (!audioCtx || isMuted) return;
  const freq = scale[Math.floor(Math.random() * scale.length)];
  const now = audioCtx.currentTime;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'triangle';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.5, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 1.0);

  const osc2 = audioCtx.createOscillator();
  const gain2 = audioCtx.createGain();
  osc2.type = 'sine';
  osc2.frequency.value = freq / 2;
  gain2.gain.setValueAtTime(0.0001, now);
  gain2.gain.exponentialRampToValueAtTime(0.25, now + 0.01);
  gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
  osc2.connect(gain2).connect(audioCtx.destination);
  osc2.start(now);
  osc2.stop(now + 0.8);
}

// ====================== 输入交互 ======================
let started = false;

function trigger() {
  if (!started) {
    started = true;
    const hint = document.getElementById('hint');
    if (hint) hint.style.opacity = '0';
    initAudio();
  }
  playNote();
  spawn();
}

window.addEventListener(
  'keydown',
  (e) => {
    if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Backspace'].includes(e.key)) {
      e.preventDefault();
    }
    if (e.repeat) return;
    trigger();
  },
  { passive: false }
);

window.addEventListener('pointerdown', (e) => {
  if (e.target.closest('.top-nav-hud') || e.target.closest('button')) {
    return;
  }
  trigger();
  const ndc = new THREE.Vector3(
    (e.clientX / window.innerWidth) * 2 - 1,
    -(e.clientY / window.innerHeight) * 2 + 1,
    0.5
  );
  ndc.unproject(camera);
  const dirv = ndc.sub(camera.position).normalize();
  const dist = -camera.position.z / dirv.z;
  const pos = camera.position.clone().add(dirv.multiplyScalar(dist));
  spawn(pos.x, pos.y);
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (composer) composer.setSize(window.innerWidth, window.innerHeight);
});

// UI controls (Sound, Fullscreen)
document.addEventListener('DOMContentLoaded', () => {
  const btnSound = document.getElementById('btn-sound');
  const soundIcon = document.getElementById('sound-icon');
  if (btnSound) {
    btnSound.addEventListener('click', (e) => {
      e.stopPropagation();
      initAudio();
      isMuted = !isMuted;
      btnSound.classList.toggle('active', !isMuted);
      if (soundIcon) soundIcon.textContent = isMuted ? '🔇' : '🔊';
    });
  }

  const btnFullscreen = document.getElementById('btn-fullscreen');
  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
        btnFullscreen.classList.add('active');
      } else {
        document.exitFullscreen().catch(() => {});
        btnFullscreen.classList.remove('active');
      }
    });
  }
});
