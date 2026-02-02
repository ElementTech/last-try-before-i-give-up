import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ImprovedNoise } from "three/addons/math/ImprovedNoise.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { config } from "./config.js";

// ============================================
// SCENE SETUP
// ============================================

const worldWidth = config.world.resolution;
const worldDepth = config.world.resolution;
const worldSize = config.world.size;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa8d5e8); // Soft blue sky
scene.fog = new THREE.Fog(0xb8d5e8, 500, 2000); // Light fog for depth

const camera = new THREE.PerspectiveCamera(
  60, // Wider FOV to see more terrain
  window.innerWidth / window.innerHeight,
  1,
  3000
);
// CRITICAL: Camera ABOVE terrain (max height 80) looking down
camera.position.set(400, 350, 400);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2.1;
controls.minDistance = 100;
controls.maxDistance = 1200;
controls.target.set(0, 0, 0);

// ============================================
// LIGHTING - Realistic outdoor setup
// ============================================

// Directional sun - stronger for better shadows
const sun = new THREE.DirectionalLight(0xfff5e8, 2.0);
sun.position.set(150, 200, 100);
sun.castShadow = true;
sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;
sun.shadow.camera.left = -600;
sun.shadow.camera.right = 600;
sun.shadow.camera.top = 600;
sun.shadow.camera.bottom = -600;
sun.shadow.camera.near = 0.5;
sun.shadow.camera.far = 1000;
sun.shadow.bias = -0.0001;
sun.shadow.normalBias = 0.02;
scene.add(sun);

// Hemisphere light for natural sky/ground bounce
const hemiLight = new THREE.HemisphereLight(0xaaccff, 0x775533, 0.6);
scene.add(hemiLight);

// Ambient for fill
const ambient = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambient);

// ============================================
// TERRAIN GENERATION - With visible roads
// ============================================

function generateHeight(width, height) {
  let seed = Math.PI / 4;
  window.Math.random = function () {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const size = width * height;
  const data = new Uint8Array(size);
  const perlin = new ImprovedNoise();
  const z = Math.random() * 100;

  let quality = 1;
  for (let j = 0; j < 4; j++) {
    for (let i = 0; i < size; i++) {
      const x = i % width;
      const y = ~~(i / width);
      data[i] += Math.abs(perlin.noise(x / quality, y / quality, z) * quality * 2.0);
    }
    quality *= 4;
  }

  return data;
}

function generateTexture(data, width, height) {
  const vector3 = new THREE.Vector3(0, 0, 0);
  const sun = new THREE.Vector3(1, 1, 1);
  sun.normalize();

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  context.fillStyle = "#000";
  context.fillRect(0, 0, width, height);

  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  const imageData = image.data;

  // Generate road paths using sine waves
  const roadPaths = [];
  const numRoads = 3;
  for (let r = 0; r < numRoads; r++) {
    roadPaths.push({
      offsetX: (Math.random() - 0.5) * width * 0.3,
      offsetZ: (Math.random() - 0.5) * height * 0.3,
      freq1: 0.008 + Math.random() * 0.004,
      freq2: 0.003 + Math.random() * 0.002,
      amp1: 40 + Math.random() * 30,
      amp2: 20 + Math.random() * 20,
    });
  }

  for (let i = 0, j = 0, l = imageData.length; i < l; i += 4, j++) {
    const x = j % width;
    const z = ~~(j / width);

    // Calculate normal and shading
    vector3.x = data[j - 2] - data[j + 2];
    vector3.y = 2;
    vector3.z = data[j - width * 2] - data[j + width * 2];
    vector3.normalize();

    const shade = vector3.dot(sun);
    const heightFactor = data[j] / 255;

    // Check if on road path
    let onRoad = false;
    const roadWidth = 20; // Wider roads for visibility

    for (let road of roadPaths) {
      const roadCenterX = road.offsetX + Math.sin(z * road.freq1) * road.amp1 + Math.sin(z * road.freq2) * road.amp2;
      const distToRoad = Math.abs(x - width/2 - roadCenterX);

      if (distToRoad < roadWidth) {
        onRoad = true;
        break;
      }
    }

    // Check if in crop field area (striped pattern like reference)
    let inCropField = false;
    const cropFieldSize = 40;
    const cropStripeWidth = 4;
    if (x % cropFieldSize < cropFieldSize * 0.8 && z % cropFieldSize < cropFieldSize * 0.8) {
      // Create striped pattern
      const stripePos = (x + z * 0.3) % (cropStripeWidth * 2);
      inCropField = stripePos < cropStripeWidth && heightFactor > 0.25 && heightFactor < 0.6;
    }

    if (onRoad) {
      // PROMINENT brown/tan roads - even brighter
      const roadBase = 200 + shade * 50;
      imageData[i] = roadBase * 0.90;
      imageData[i + 1] = roadBase * 0.75;
      imageData[i + 2] = roadBase * 0.55;
    } else if (inCropField) {
      // Crop fields - alternating light/dark green stripes
      const isDarkStripe = ((x + Math.floor(z * 0.3)) % (cropStripeWidth * 2)) < cropStripeWidth;
      if (isDarkStripe) {
        imageData[i] = (70 + shade * 90) * 0.7;
        imageData[i + 1] = (130 + shade * 120) * 0.8;
        imageData[i + 2] = (55 + shade * 70) * 0.6;
      } else {
        imageData[i] = (85 + shade * 100) * 0.75;
        imageData[i + 1] = (145 + shade * 130) * 0.85;
        imageData[i + 2] = (65 + shade * 75) * 0.65;
      }
    } else if (heightFactor < 0.15) {
      // Low areas - dirt/mud
      imageData[i] = (100 + shade * 100) * 0.7;
      imageData[i + 1] = (70 + shade * 80) * 0.7;
      imageData[i + 2] = (40 + shade * 60) * 0.7;
    } else {
      // Green grass on higher ground
      const baseGreen = 0.75 + heightFactor * 0.15;
      imageData[i] = (65 + shade * 90) * (0.65 + heightFactor * 0.35);
      imageData[i + 1] = (120 + shade * 130) * baseGreen;
      imageData[i + 2] = (50 + shade * 70) * (0.55 + heightFactor * 0.3);
    }
  }

  context.putImageData(image, 0, 0);

  // Scale up 4x
  const canvasScaled = document.createElement("canvas");
  canvasScaled.width = width * 4;
  canvasScaled.height = height * 4;

  const contextScaled = canvasScaled.getContext("2d");
  contextScaled.scale(4, 4);
  contextScaled.drawImage(canvas, 0, 0);

  const imageScaled = contextScaled.getImageData(0, 0, canvasScaled.width, canvasScaled.height);
  const imageDataScaled = imageScaled.data;

  // Add noise variation
  for (let i = 0, l = imageDataScaled.length; i < l; i += 4) {
    const v = ~~(Math.random() * 8);
    imageDataScaled[i] += v;
    imageDataScaled[i + 1] += v;
    imageDataScaled[i + 2] += v;
  }

  contextScaled.putImageData(imageScaled, 0, 0);
  return canvasScaled;
}

// Generate terrain
const heightData = generateHeight(worldWidth, worldDepth);

const geometry = new THREE.PlaneGeometry(
  worldSize,
  worldSize,
  worldWidth - 1,
  worldDepth - 1
);
geometry.rotateX(-Math.PI / 2);

const vertices = geometry.attributes.position.array;
// Scale terrain height properly - max 100 units high, not 2550!
for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
  vertices[j + 1] = (heightData[i] / 255) * 80; // Max 80 units height
}
geometry.computeVertexNormals();

const texture = new THREE.CanvasTexture(generateTexture(heightData, worldWidth, worldDepth));
texture.wrapS = THREE.ClampToEdgeWrapping;
texture.wrapT = THREE.ClampToEdgeWrapping;
texture.colorSpace = THREE.SRGBColorSpace;

const terrainMaterial = new THREE.MeshStandardMaterial({
  map: texture,
  roughness: 0.9,
  metalness: 0.0,
});

const terrain = new THREE.Mesh(geometry, terrainMaterial);
terrain.receiveShadow = true;
scene.add(terrain);

console.log("Terrain created with prominent roads");

// ============================================
// WATER PLANE
// ============================================

const waterGeometry = new THREE.PlaneGeometry(worldSize * 0.95, worldSize * 0.95);
waterGeometry.rotateX(-Math.PI / 2);

const waterMaterial = new THREE.MeshStandardMaterial({
  color: 0x4a8aaa,
  transparent: true,
  opacity: 0.6,
  roughness: 0.1,
  metalness: 0.8,
});

const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.position.y = 10; // Below most terrain
water.receiveShadow = true;
scene.add(water);

// ============================================
// LOAD AND INSTANCE REAL TREE MODELS
// ============================================

const loader = new GLTFLoader();
const loadedModels = {};
let modelsLoaded = 0;
const modelsToLoad = [
  'tree_default.glb',
  'tree_detailed.glb',
  'tree_oak.glb',
  'tree_fat.glb',
  'tree_pineRoundD.glb',
  'tree_tall.glb',
];

modelsToLoad.forEach((modelName) => {
  loader.load(
    `/models/${modelName}`,
    (gltf) => {
      loadedModels[modelName] = gltf.scene;
      modelsLoaded++;

      if (modelsLoaded === modelsToLoad.length) {
        createForest();
      }
    },
    undefined,
    (error) => {
      console.error(`Error loading ${modelName}:`, error);
    }
  );
});

function getTerrainHeight(x, z) {
  const gridX = Math.floor(((x + worldSize / 2) / worldSize) * worldWidth);
  const gridZ = Math.floor(((z + worldSize / 2) / worldSize) * worldDepth);

  if (gridX < 0 || gridX >= worldWidth || gridZ < 0 || gridZ >= worldDepth) {
    return 0;
  }

  const index = gridZ * worldWidth + gridX;
  return (heightData[index] / 255) * 80; // Same scaling as terrain
}

function createForest() {
  console.log("Creating forest with real 3D tree models...");

  const treeCount = 2000; // Very dense forest like reference
  const dummy = new THREE.Object3D();

  // Create clusters
  const clusters = [];
  for (let i = 0; i < 10; i++) {
    clusters.push({
      x: (Math.random() - 0.5) * worldSize * 0.7,
      z: (Math.random() - 0.5) * worldSize * 0.7,
      radius: 60 + Math.random() * 80,
    });
  }

  for (let i = 0; i < treeCount; i++) {
    let x, z;

    // 80% clustered, 20% scattered
    if (Math.random() < 0.8) {
      const cluster = clusters[Math.floor(Math.random() * clusters.length)];
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * cluster.radius;
      x = cluster.x + Math.cos(angle) * radius;
      z = cluster.z + Math.sin(angle) * radius;
    } else {
      x = (Math.random() - 0.5) * worldSize * 0.75;
      z = (Math.random() - 0.5) * worldSize * 0.75;
    }

    const y = getTerrainHeight(x, z);

    // Pick random tree model
    const modelNames = Object.keys(loadedModels);
    const modelName = modelNames[Math.floor(Math.random() * modelNames.length)];
    const modelTemplate = loadedModels[modelName];

    // Clone and add to scene
    const tree = modelTemplate.clone();
    tree.position.set(x, y, z);

    const scale = 5 + Math.random() * 5; // Visible tree size for overview
    tree.scale.set(scale, scale, scale);
    tree.rotation.y = Math.random() * Math.PI * 2;

    tree.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        // Override with natural green colors for foliage
        if (child.material) {
          const originalColor = child.material.color;
          // If it's the default teal/cyan Kenney color, make it green
          if (originalColor.r < 0.6 && originalColor.g > 0.6) {
            const greenShades = [0x3a7a35, 0x2a6a30, 0x4a8a40, 0x357a30, 0x408a38, 0x2d7a2d];
            child.material = child.material.clone();
            child.material.color.setHex(greenShades[Math.floor(Math.random() * greenShades.length)]);
          }
          // Brown for trunks
          else if (originalColor.r > 0.4 && originalColor.r < 0.8 && originalColor.g < 0.6) {
            child.material = child.material.clone();
            child.material.color.setHex(0x4a3528);
          }
        }
      }
    });

    scene.add(tree);
  }

  console.log(`Added ${treeCount} realistic trees to scene`);

  // Add rocks
  loader.load('/models/rock_smallA.glb', (gltf) => {
    const rockTemplate = gltf.scene;
    for (let i = 0; i < 150; i++) {
      const x = (Math.random() - 0.5) * worldSize * 0.75;
      const z = (Math.random() - 0.5) * worldSize * 0.75;
      const y = getTerrainHeight(x, z);

      const rock = rockTemplate.clone();
      rock.position.set(x, y, z);
      rock.scale.setScalar(2 + Math.random() * 3);
      rock.rotation.y = Math.random() * Math.PI * 2;

      rock.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      scene.add(rock);
    }
    console.log('Added rocks');
  });

  // Add grass tufts
  loader.load('/models/grass.glb', (gltf) => {
    const grassTemplate = gltf.scene;
    for (let i = 0; i < 300; i++) {
      const x = (Math.random() - 0.5) * worldSize * 0.8;
      const z = (Math.random() - 0.5) * worldSize * 0.8;
      const y = getTerrainHeight(x, z);

      const grass = grassTemplate.clone();
      grass.position.set(x, y, z);
      grass.scale.setScalar(3 + Math.random() * 2);
      grass.rotation.y = Math.random() * Math.PI * 2;

      scene.add(grass);
    }
    console.log('Added grass tufts');
  });
}

// ============================================
// ANIMATION LOOP
// ============================================

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// ============================================
// WINDOW RESIZE
// ============================================

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start
camera.lookAt(0, 0, 0);
animate();

console.log("Scene initialized - loading tree models...");
