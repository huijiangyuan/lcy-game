import * as THREE from 'three';

// Procedural 3D Toy Factory for Toddlers
// Generates colorful, squishy, high-aesthetic cartoon toys using Three.js primitives

export class ToyFactory {
  constructor() {
    this.materials = this.createMaterials();
  }

  createMaterials() {
    // Rich pastel & vibrant candy-like materials
    return {
      yellow: new THREE.MeshStandardMaterial({ color: 0xffd129, roughness: 0.3, metalness: 0.1 }),
      orange: new THREE.MeshStandardMaterial({ color: 0xff7d27, roughness: 0.3, metalness: 0.1 }),
      pink: new THREE.MeshStandardMaterial({ color: 0xff70a6, roughness: 0.25, metalness: 0.05 }),
      lightPink: new THREE.MeshStandardMaterial({ color: 0xffb7d5, roughness: 0.3 }),
      cyan: new THREE.MeshStandardMaterial({ color: 0x38d9a9, roughness: 0.3, metalness: 0.1 }),
      blue: new THREE.MeshStandardMaterial({ color: 0x4dabf7, roughness: 0.25, metalness: 0.1 }),
      purple: new THREE.MeshStandardMaterial({ color: 0x9775fa, roughness: 0.3, metalness: 0.1 }),
      white: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }),
      brown: new THREE.MeshStandardMaterial({ color: 0xb07d58, roughness: 0.4 }),
      darkBrown: new THREE.MeshStandardMaterial({ color: 0x6e4327, roughness: 0.5 }),
      red: new THREE.MeshStandardMaterial({ color: 0xff4d4f, roughness: 0.3, metalness: 0.1 }),
      mint: new THREE.MeshStandardMaterial({ color: 0x69db7c, roughness: 0.3 }),
      gold: new THREE.MeshStandardMaterial({ color: 0xffc078, roughness: 0.2, metalness: 0.3 }),
      eyeBlack: new THREE.MeshBasicMaterial({ color: 0x111111 }),
      eyeWhite: new THREE.MeshBasicMaterial({ color: 0xffffff }),
      donutDough: new THREE.MeshStandardMaterial({ color: 0xebb471, roughness: 0.6 }),
      donutGlaze: new THREE.MeshStandardMaterial({ color: 0xff5c8a, roughness: 0.2, metalness: 0.1 })
    };
  }

  // Create cute cartoon eyes on a mesh group
  addCuteEyes(group, xDist = 0.35, y = 0.1, z = 0.6, scale = 1) {
    [-xDist, xDist].forEach((x) => {
      // Black pupil
      const pupilGeo = new THREE.SphereGeometry(0.12 * scale, 16, 16);
      pupilGeo.scale(1, 1, 0.4);
      const pupil = new THREE.Mesh(pupilGeo, this.materials.eyeBlack);
      pupil.position.set(x, y, z);

      // Eye sparkle highlight dot
      const shineGeo = new THREE.SphereGeometry(0.045 * scale, 12, 12);
      const shine = new THREE.Mesh(shineGeo, this.materials.eyeWhite);
      shine.position.set(x + 0.035 * scale, y + 0.035 * scale, z + 0.04 * scale);

      group.add(pupil);
      group.add(shine);
    });

    // Blushing cheeks
    [-xDist * 1.35, xDist * 1.35].forEach((x) => {
      const cheekGeo = new THREE.SphereGeometry(0.09 * scale, 16, 16);
      cheekGeo.scale(1.2, 0.8, 0.2);
      const cheek = new THREE.Mesh(cheekGeo, this.materials.lightPink);
      cheek.position.set(x, y - 0.12 * scale, z - 0.03 * scale);
      group.add(cheek);
    });
  }

  // 1. Rubber Duck (小黄鸭)
  createDuck() {
    const duck = new THREE.Group();

    // Body
    const bodyGeo = new THREE.SphereGeometry(0.9, 24, 24);
    bodyGeo.scale(1, 0.8, 1.2);
    const body = new THREE.Mesh(bodyGeo, this.materials.yellow);
    duck.add(body);

    // Tail
    const tailGeo = new THREE.ConeGeometry(0.3, 0.5, 16);
    tailGeo.rotateX(-Math.PI / 4);
    const tail = new THREE.Mesh(tailGeo, this.materials.yellow);
    tail.position.set(0, 0.4, -0.9);
    duck.add(tail);

    // Head
    const headGeo = new THREE.SphereGeometry(0.55, 24, 24);
    const head = new THREE.Mesh(headGeo, this.materials.yellow);
    head.position.set(0, 0.85, 0.45);
    duck.add(head);

    // Beak
    const beakGeo = new THREE.ConeGeometry(0.24, 0.4, 16);
    beakGeo.rotateX(Math.PI / 2);
    beakGeo.scale(1.3, 0.6, 1);
    const beak = new THREE.Mesh(beakGeo, this.materials.orange);
    beak.position.set(0, 0.75, 0.95);
    duck.add(beak);

    // Eyes
    this.addCuteEyes(duck, 0.25, 0.92, 0.85, 0.85);

    duck.scale.set(0.9, 0.9, 0.9);
    return duck;
  }

  // 2. Teddy Bear (萌萌熊)
  createBear() {
    const bear = new THREE.Group();

    // Head
    const headGeo = new THREE.SphereGeometry(0.85, 24, 24);
    headGeo.scale(1.05, 0.95, 1);
    const head = new THREE.Mesh(headGeo, this.materials.brown);
    bear.add(head);

    // Snout
    const snoutGeo = new THREE.SphereGeometry(0.32, 20, 20);
    snoutGeo.scale(1.2, 0.9, 0.9);
    const snout = new THREE.Mesh(snoutGeo, this.materials.lightPink);
    snout.position.set(0, -0.15, 0.7);
    bear.add(snout);

    // Nose
    const noseGeo = new THREE.SphereGeometry(0.1, 16, 16);
    noseGeo.scale(1.3, 0.9, 0.8);
    const nose = new THREE.Mesh(noseGeo, this.materials.darkBrown);
    nose.position.set(0, -0.06, 0.95);
    bear.add(nose);

    // Ears
    [-0.65, 0.65].forEach(x => {
      const earOuterGeo = new THREE.SphereGeometry(0.35, 20, 20);
      earOuterGeo.scale(1, 1, 0.5);
      const earOuter = new THREE.Mesh(earOuterGeo, this.materials.brown);
      earOuter.position.set(x, 0.75, 0);

      const earInnerGeo = new THREE.SphereGeometry(0.2, 16, 16);
      earInnerGeo.scale(1, 1, 0.4);
      const earInner = new THREE.Mesh(earInnerGeo, this.materials.lightPink);
      earInner.position.set(x, 0.75, 0.12);

      bear.add(earOuter);
      bear.add(earInner);
    });

    // Eyes
    this.addCuteEyes(bear, 0.32, 0.15, 0.75, 0.9);

    return bear;
  }

  // 3. Bunny (软萌小兔子)
  createBunny() {
    const bunny = new THREE.Group();

    // Head
    const headGeo = new THREE.SphereGeometry(0.8, 24, 24);
    const head = new THREE.Mesh(headGeo, this.materials.white);
    bunny.add(head);

    // Long Ears
    [-0.32, 0.32].forEach((x, i) => {
      const earGroup = new THREE.Group();
      earGroup.position.set(x, 0.7, 0);
      earGroup.rotation.z = (i === 0 ? 0.12 : -0.12);

      const earGeo = new THREE.CylinderGeometry(0.18, 0.12, 1.1, 16);
      earGeo.scale(1, 1, 0.5);
      const ear = new THREE.Mesh(earGeo, this.materials.white);
      ear.position.y = 0.55;
      earGroup.add(ear);

      const innerEarGeo = new THREE.CylinderGeometry(0.1, 0.06, 0.8, 16);
      innerEarGeo.scale(1, 1, 0.3);
      const innerEar = new THREE.Mesh(innerEarGeo, this.materials.lightPink);
      innerEar.position.set(0, 0.55, 0.15);
      earGroup.add(innerEar);

      bunny.add(earGroup);
    });

    // Cute pink nose
    const noseGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const nose = new THREE.Mesh(noseGeo, this.materials.pink);
    nose.position.set(0, -0.05, 0.78);
    bunny.add(nose);

    // Eyes
    this.addCuteEyes(bunny, 0.28, 0.12, 0.72, 0.85);

    return bunny;
  }

  // 4. Rainbow Donut (糖霜甜甜圈)
  createDonut() {
    const donut = new THREE.Group();

    // Donut Dough
    const doughGeo = new THREE.TorusGeometry(0.85, 0.42, 24, 48);
    doughGeo.rotateX(Math.PI / 2);
    const dough = new THREE.Mesh(doughGeo, this.materials.donutDough);
    donut.add(dough);

    // Frosting glaze
    const glazeGeo = new THREE.TorusGeometry(0.86, 0.41, 24, 48, Math.PI * 2);
    glazeGeo.rotateX(Math.PI / 2);
    glazeGeo.scale(1, 1, 0.95);
    const glaze = new THREE.Mesh(glazeGeo, this.materials.donutGlaze);
    glaze.position.y = 0.05;
    donut.add(glaze);

    // Colorful sprinkles on top
    const sprinkleColors = [0xffffff, 0xffd129, 0x38d9a9, 0x4dabf7, 0xff70a6];
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2 + (Math.random() * 0.2);
      const radius = 0.85 + (Math.random() - 0.5) * 0.25;
      const sGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.16, 8);
      const mat = new THREE.MeshStandardMaterial({
        color: sprinkleColors[i % sprinkleColors.length],
        roughness: 0.3
      });
      const sprinkle = new THREE.Mesh(sGeo, mat);
      sprinkle.position.set(Math.cos(angle) * radius, 0.46, Math.sin(angle) * radius);
      sprinkle.rotation.set(Math.random(), Math.random() * Math.PI, Math.random());
      donut.add(sprinkle);
    }

    // Add smiley face inside or on edge
    this.addCuteEyes(donut, 0.3, 0.45, 0.45, 0.65);

    return donut;
  }

  // 5. Smiling Balloon with dangling string (彩虹气球)
  createBalloon(colorHex = null) {
    const balloon = new THREE.Group();
    const color = colorHex || [0xff70a6, 0x4dabf7, 0xffd129, 0x38d9a9, 0x9775fa, 0xff4d4f][Math.floor(Math.random() * 6)];
    const balloonMat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.15,
      metalness: 0.1
    });

    // Egg-shaped balloon
    const ballGeo = new THREE.SphereGeometry(0.85, 24, 24);
    ballGeo.scale(1, 1.25, 1);
    const ball = new THREE.Mesh(ballGeo, balloonMat);
    balloon.add(ball);

    // Knot at bottom
    const knotGeo = new THREE.ConeGeometry(0.12, 0.15, 12);
    knotGeo.rotateX(Math.PI);
    const knot = new THREE.Mesh(knotGeo, balloonMat);
    knot.position.y = -1.1;
    balloon.add(knot);

    // Dangling String
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -1.15, 0),
      new THREE.Vector3(0.08, -1.45, 0.05),
      new THREE.Vector3(-0.06, -1.8, -0.05),
      new THREE.Vector3(0.04, -2.15, 0.02)
    ]);
    const stringGeo = new THREE.TubeGeometry(curve, 16, 0.02, 8, false);
    const string = new THREE.Mesh(stringGeo, this.materials.white);
    balloon.add(string);

    // Smiling face
    this.addCuteEyes(balloon, 0.28, 0.1, 0.8, 0.8);

    return balloon;
  }

  // 6. Cartoon Cloud (棉花糖小云朵)
  createCloud() {
    const cloud = new THREE.Group();
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.4,
      metalness: 0.05
    });

    const puffs = [
      { r: 0.65, x: 0, y: 0.2, z: 0 },
      { r: 0.5, x: -0.65, y: -0.05, z: 0 },
      { r: 0.45, x: 0.7, y: -0.05, z: 0 },
      { r: 0.42, x: -0.3, y: -0.2, z: 0.2 },
      { r: 0.42, x: 0.3, y: -0.2, z: 0.2 },
      { r: 0.38, x: 0, y: -0.15, z: -0.2 }
    ];

    puffs.forEach(p => {
      const geo = new THREE.SphereGeometry(p.r, 20, 20);
      const mesh = new THREE.Mesh(geo, cloudMat);
      mesh.position.set(p.x, p.y, p.z);
      cloud.add(mesh);
    });

    this.addCuteEyes(cloud, 0.26, 0.05, 0.5, 0.75);

    return cloud;
  }

  // 7. Cartoon Star (开心五角星)
  createStar() {
    const starGroup = new THREE.Group();

    // 2D Extruded star shape with bevel
    const shape = new THREE.Shape();
    const points = 5;
    const outerR = 0.95;
    const innerR = 0.45;

    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();

    const extrudeSettings = {
      depth: 0.35,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.1,
      bevelThickness: 0.1
    };

    const starGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    starGeo.center();
    const star = new THREE.Mesh(starGeo, this.materials.gold);
    starGroup.add(star);

    // Cute face
    this.addCuteEyes(starGroup, 0.22, 0.05, 0.3, 0.7);

    return starGroup;
  }

  // 8. Toy Car (童趣小汽车)
  createCar() {
    const car = new THREE.Group();

    // Car Body
    const bodyGeo = new THREE.BoxGeometry(1.6, 0.6, 0.9);
    const body = new THREE.Mesh(bodyGeo, this.materials.red);
    body.position.y = 0.45;
    car.add(body);

    // Cabin
    const cabinGeo = new THREE.BoxGeometry(0.85, 0.5, 0.85);
    const cabin = new THREE.Mesh(cabinGeo, this.materials.yellow);
    cabin.position.set(-0.1, 0.95, 0);
    car.add(cabin);

    // Windshield (cyan glossy glass)
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x4dabf7, roughness: 0.1 });
    const glassGeo = new THREE.PlaneGeometry(0.8, 0.4);
    glassGeo.rotateY(Math.PI / 2);
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(0.33, 0.95, 0);
    car.add(glass);

    // Wheels (4 chunky black tires with white rims)
    const wheelPositions = [
      [-0.55, 0.25, 0.5],
      [0.55, 0.25, 0.5],
      [-0.55, 0.25, -0.5],
      [0.55, 0.25, -0.5]
    ];

    wheelPositions.forEach(([x, y, z]) => {
      const wheelGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.18, 16);
      wheelGeo.rotateX(Math.PI / 2);
      const wheel = new THREE.Mesh(wheelGeo, this.materials.eyeBlack);
      wheel.position.set(x, y, z);

      const rimGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.2, 12);
      rimGeo.rotateX(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, this.materials.white);
      wheel.add(rim);

      car.add(wheel);
    });

    // Eyes on front
    this.addCuteEyes(car, 0.25, 0.5, 0.85, 0.6);

    return car;
  }

  // 9. 3D Chunky Floating Letter or Number Badge (立体字母/数字徽章)
  createLetterBadge(char = 'A', subText = '') {
    const badge = new THREE.Group();

    // Rounded soft pill cylinder
    const baseGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.35, 32);
    baseGeo.rotateX(Math.PI / 2);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.05
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    badge.add(base);

    // Glowing border ring
    const ringGeo = new THREE.TorusGeometry(0.92, 0.08, 16, 32);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xffd129,
      roughness: 0.1,
      metalness: 0.3
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    badge.add(ring);

    // Generate high-resolution canvas texture for the letter and emoji/word
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Background circle gradient
    const grad = ctx.createRadialGradient(256, 256, 50, 256, 256, 256);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, '#f1f3f5');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(256, 256, 250, 0, Math.PI * 2);
    ctx.fill();

    // Draw Character
    ctx.fillStyle = '#ff4d4f';
    ctx.font = 'bold 240px "Comic Sans MS", "Fredoka One", "Arial Rounded MT Bold", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetY = 8;
    ctx.fillText(char.toUpperCase(), 256, subText ? 210 : 256);

    // Subtext (Chinese / English description)
    if (subText) {
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.fillStyle = '#495057';
      ctx.font = 'bold 64px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(subText, 256, 380);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const faceMat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true
    });
    const faceGeo = new THREE.CircleGeometry(0.85, 32);
    const face = new THREE.Mesh(faceGeo, faceMat);
    face.position.z = 0.18;
    badge.add(face);

    // Also mirror back face so it looks great when rotating
    const backFace = new THREE.Mesh(faceGeo, faceMat);
    backFace.position.z = -0.18;
    backFace.rotation.y = Math.PI;
    badge.add(backFace);

    return badge;
  }

  // Random cute toy generator
  createRandomToy(keyChar = '') {
    const cleanKey = keyChar ? keyChar.toUpperCase() : '';
    const isAlphanumeric = /^[A-Z0-9]$/.test(cleanKey);

    // If letter or number, 65% chance to generate the cognitive badge, or specific toy
    if (isAlphanumeric && Math.random() < 0.65) {
      const mesh = this.createLetterBadge(cleanKey);
      mesh.userData.toyType = 'badge';
      return {
        mesh,
        type: 'badge'
      };
    }

    const toyList = [
      { create: () => this.createDuck(), type: 'duck' },
      { create: () => this.createBear(), type: 'bear' },
      { create: () => this.createBunny(), type: 'bunny' },
      { create: () => this.createDonut(), type: 'donut' },
      { create: () => this.createBalloon(), type: 'balloon' },
      { create: () => this.createCloud(), type: 'cloud' },
      { create: () => this.createStar(), type: 'star' },
      { create: () => this.createCar(), type: 'car' }
    ];

    const pick = toyList[Math.floor(Math.random() * toyList.length)];
    const mesh = pick.create();
    mesh.userData.toyType = pick.type;

    return {
      mesh,
      type: pick.type
    };
  }
}
