import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ImprovedNoise } from "three/addons/math/ImprovedNoise.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { config } from "./config.js";

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(config.sky.color);
scene.fog = new THREE.FogExp2(config.sky.fogColor, config.sky.fogDensity);

const camera = new THREE.PerspectiveCamera(
  config.camera.fov,
  window.innerWidth / window.innerHeight,
  1,
  5000,
);
camera.position.set(
  config.camera.position.x,
  config.camera.position.y,
  config.camera.position.z,
);

const renderer = new THREE.WebGLRenderer({
  antialias: config.rendering.antialias,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, config.rendering.pixelRatioMax),
);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = config.rendering.toneMappingExposure;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = config.camera.maxPolarAngle;
controls.minDistance = config.camera.minDistance;
controls.maxDistance = config.camera.maxDistance;
controls.target.set(
  config.camera.target.x,
  config.camera.target.y,
  config.camera.target.z,
);

// Lighting from config
const ambientLight = new THREE.AmbientLight(
  config.lighting.ambient.color,
  config.lighting.ambient.intensity,
);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(
  config.lighting.sun.color,
  config.lighting.sun.intensity,
);
sunLight.position.set(
  config.lighting.sun.position.x,
  config.lighting.sun.position.y,
  config.lighting.sun.position.z,
);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = config.lighting.sun.shadowMapSize;
sunLight.shadow.mapSize.height = config.lighting.sun.shadowMapSize;
sunLight.shadow.camera.near = 1;
sunLight.shadow.camera.far = 2000;
sunLight.shadow.camera.left = -800;
sunLight.shadow.camera.right = 800;
sunLight.shadow.camera.top = 800;
sunLight.shadow.camera.bottom = -800;
sunLight.shadow.bias = config.lighting.sun.shadowBias;
sunLight.shadow.normalBias = config.lighting.sun.shadowNormalBias;
scene.add(sunLight);
scene.add(sunLight.target);

const hemisphereLight = new THREE.HemisphereLight(
  config.lighting.hemisphere.skyColor,
  config.lighting.hemisphere.groundColor,
  config.lighting.hemisphere.intensity,
);
scene.add(hemisphereLight);

const fillLight = new THREE.DirectionalLight(
  config.lighting.fill.color,
  config.lighting.fill.intensity,
);
fillLight.position.set(
  config.lighting.fill.position.x,
  config.lighting.fill.position.y,
  config.lighting.fill.position.z,
);
scene.add(fillLight);

// Loaders
const textureLoader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader();

// Load textures from config paths
const dirtTexture = textureLoader.load(config.assets.textures.dirt);
dirtTexture.wrapS = dirtTexture.wrapT = THREE.RepeatWrapping;

const dirt2Texture = textureLoader.load(config.assets.textures.dirt2);
dirt2Texture.wrapS = dirt2Texture.wrapT = THREE.RepeatWrapping;

const dirt3Texture = textureLoader.load(config.assets.textures.dirt3);
dirt3Texture.wrapS = dirt3Texture.wrapT = THREE.RepeatWrapping;

const grassTexture = textureLoader.load(config.assets.textures.grass);
grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;

const forestGroundTexture = textureLoader.load(
  config.assets.textures.forestGround,
);
forestGroundTexture.wrapS = forestGroundTexture.wrapT = THREE.RepeatWrapping;

// Alpha-based foliage overlays
const foliageColorTexture = textureLoader.load(
  config.assets.textures.foliageColor,
);
foliageColorTexture.wrapS = foliageColorTexture.wrapT = THREE.RepeatWrapping;

const foliageOpacityTexture = textureLoader.load(
  config.assets.textures.foliageOpacity,
);
foliageOpacityTexture.wrapS = foliageOpacityTexture.wrapT =
  THREE.RepeatWrapping;

const foliage2ColorTexture = textureLoader.load(
  config.assets.textures.foliage2Color,
);
foliage2ColorTexture.wrapS = foliage2ColorTexture.wrapT = THREE.RepeatWrapping;

const foliage2OpacityTexture = textureLoader.load(
  config.assets.textures.foliage2Opacity,
);
foliage2OpacityTexture.wrapS = foliage2OpacityTexture.wrapT =
  THREE.RepeatWrapping;

// Terrain parameters from config
const worldWidth = config.world.resolution;
const worldDepth = config.world.resolution;
const worldSize = config.world.size;
const perlin = new ImprovedNoise();

// Generate terrain height data
function generateHeight(width, depth) {
  const size = width * depth;
  const data = new Float32Array(size);
  const t = config.terrain;
  const r = config.river;

  for (let i = 0; i < size; i++) {
    const x = i % width;
    const z = Math.floor(i / width);

    let height = 0;
    height +=
      perlin.noise(x * t.noise.layer1.scale, z * t.noise.layer1.scale, 0) *
      t.noise.layer1.amplitude;
    height +=
      perlin.noise(x * t.noise.layer2.scale, z * t.noise.layer2.scale, 0.5) *
      t.noise.layer2.amplitude;
    height +=
      perlin.noise(x * t.noise.layer3.scale, z * t.noise.layer3.scale, 1) *
      t.noise.layer3.amplitude;
    height += t.baseHeight;

    const centerX = width / 2;
    const riverCurve =
      Math.sin(z * r.curveFrequency1) * r.curveAmplitude1 +
      Math.sin(z * r.curveFrequency2) * r.curveAmplitude2;
    const distFromRiver = Math.abs(x - centerX - riverCurve);

    if (distFromRiver < r.width) {
      const t = distFromRiver / r.width;
      height -= (1 - t * t) * r.depth;
    } else if (distFromRiver < r.bankWidth) {
      const t = (distFromRiver - r.width) / (r.width * 2);
      height -= (1 - t) * r.bankDepth;
    }

    data[i] = Math.max(height, config.terrain.minHeight);
  }

  return data;
}

const heightData = generateHeight(worldWidth, worldDepth);

function getHeightAt(x, z) {
  const gridX = Math.floor((x / worldSize + 0.5) * worldWidth);
  const gridZ = Math.floor((z / worldSize + 0.5) * worldDepth);

  if (gridX < 0 || gridX >= worldWidth || gridZ < 0 || gridZ >= worldDepth)
    return 0;

  const fx = (x / worldSize + 0.5) * worldWidth - gridX;
  const fz = (z / worldSize + 0.5) * worldDepth - gridZ;

  const h00 = heightData[gridZ * worldWidth + gridX] || 0;
  const h10 =
    heightData[gridZ * worldWidth + Math.min(gridX + 1, worldWidth - 1)] || 0;
  const h01 =
    heightData[Math.min(gridZ + 1, worldDepth - 1) * worldWidth + gridX] || 0;
  const h11 =
    heightData[
      Math.min(gridZ + 1, worldDepth - 1) * worldWidth +
        Math.min(gridX + 1, worldWidth - 1)
    ] || 0;

  return (
    h00 * (1 - fx) * (1 - fz) +
    h10 * fx * (1 - fz) +
    h01 * (1 - fx) * fz +
    h11 * fx * fz
  );
}

function getRiverDistance(x, z) {
  const r = config.river;
  const gridX = (x / worldSize + 0.5) * worldWidth;
  const gridZ = (z / worldSize + 0.5) * worldDepth;
  const centerX = worldWidth / 2;
  const riverCurve =
    Math.sin(gridZ * r.curveFrequency1) * r.curveAmplitude1 +
    Math.sin(gridZ * r.curveFrequency2) * r.curveAmplitude2;
  return Math.abs(gridX - centerX - riverCurve);
}

// Create terrain geometry
const terrainGeometry = new THREE.PlaneGeometry(
  worldSize,
  worldSize,
  worldWidth - 1,
  worldDepth - 1,
);
terrainGeometry.rotateX(-Math.PI / 2);

const vertices = terrainGeometry.attributes.position.array;
for (let i = 0, j = 0, l = vertices.length / 3; i < l; i++, j += 3) {
  vertices[j + 1] = heightData[i];
}
terrainGeometry.computeVertexNormals();

// Build terrain shader from config
const tc = config.terrainColors;
const ts = config.terrainShader;

const terrainMaterial = new THREE.ShaderMaterial({
  lights: true,
  uniforms: THREE.UniformsUtils.merge([
    THREE.UniformsLib.lights,
    {
      dirtTexture: { value: dirtTexture },
      dirt2Texture: { value: dirt2Texture },
      dirt3Texture: { value: dirt3Texture },
      grassTexture: { value: grassTexture },
      forestTexture: { value: forestGroundTexture },
      foliageColorTex: { value: foliageColorTexture },
      foliageOpacityTex: { value: foliageOpacityTexture },
      foliage2ColorTex: { value: foliage2ColorTexture },
      foliage2OpacityTex: { value: foliage2OpacityTexture },
      textureScale: { value: ts.textureScale },
      textureScale2: { value: ts.textureScale2 },
      textureScale3: { value: ts.textureScale3 },
      multiScaleBlend: { value: ts.multiScaleBlend },
      foliageScale: { value: ts.foliage.scale },
      foliageStrength: { value: ts.foliage.strength },
      foliageThreshold: { value: ts.foliage.threshold },
      sunDirection: {
        value: new THREE.Vector3(
          ts.sunDirection.x,
          ts.sunDirection.y,
          ts.sunDirection.z,
        ).normalize(),
      },
      // Color uniforms
      dirtColor: { value: new THREE.Vector3(tc.dirt.r, tc.dirt.g, tc.dirt.b) },
      foliageColor: {
        value: new THREE.Vector3(tc.foliage.r, tc.foliage.g, tc.foliage.b),
      },
      dirtPathColor: {
        value: new THREE.Vector3(tc.dirtPath.r, tc.dirtPath.g, tc.dirtPath.b),
      },
      grassColor: {
        value: new THREE.Vector3(tc.grass.r, tc.grass.g, tc.grass.b),
      },
      darkGrassColor: {
        value: new THREE.Vector3(
          tc.darkGrass.r,
          tc.darkGrass.g,
          tc.darkGrass.b,
        ),
      },
      forestColor: {
        value: new THREE.Vector3(tc.forest.r, tc.forest.g, tc.forest.b),
      },
      mudColor: { value: new THREE.Vector3(tc.mud.r, tc.mud.g, tc.mud.b) },
      riverGrassColor: {
        value: new THREE.Vector3(
          tc.riverGrass.r,
          tc.riverGrass.g,
          tc.riverGrass.b,
        ),
      },
      warmTint: {
        value: new THREE.Vector3(tc.warmTint.r, tc.warmTint.g, tc.warmTint.b),
      },
      // Noise uniforms
      fbmScale1: { value: ts.noise.fbm1 },
      fbmScale2: { value: ts.noise.fbm2 },
      largeNoiseScale: { value: ts.noise.large },
      detailNoiseScale: { value: ts.noise.detail },
      // Path uniforms
      pathFreq1Y: { value: ts.paths.frequency1.y },
      pathFreq1X: { value: ts.paths.frequency1.x },
      pathFreq2X: { value: ts.paths.frequency2.x },
      pathFreq2Y: { value: ts.paths.frequency2.y },
      pathNoiseScale1: { value: ts.paths.noiseScale1 },
      pathNoiseScale2: { value: ts.paths.noiseScale2 },
      pathNoiseAmp1: { value: ts.paths.noiseAmplitude1 },
      pathNoiseAmp2: { value: ts.paths.noiseAmplitude2 },
      pathWidthMin: { value: ts.paths.width.min },
      pathWidthMax: { value: ts.paths.width.max },
      pathStrength: { value: ts.paths.strength },
      // Grass uniforms
      grassThresh1Min: { value: ts.grassMask.threshold1.min },
      grassThresh1Max: { value: ts.grassMask.threshold1.max },
      grassThresh2Min: { value: ts.grassMask.threshold2.min },
      grassThresh2Max: { value: ts.grassMask.threshold2.max },
      grassContrast: { value: ts.grassMask.contrast },
      grassStrength: { value: ts.grassMask.strength },
      // Forest uniforms
      forestThreshMin: { value: ts.forestMask.threshold.min },
      forestThreshMax: { value: ts.forestMask.threshold.max },
      forestStrength: { value: ts.forestMask.strength },
      // River grass uniforms
      riverGrassMin: { value: ts.riverGrass.range.min },
      riverGrassMax: { value: ts.riverGrass.range.max },
      riverGrassStrength: { value: ts.riverGrass.strength },
      // Mud uniforms
      mudRangeMin: { value: ts.mud.range.min },
      mudRangeMax: { value: ts.mud.range.max },
      mudStrength: { value: ts.mud.strength },
      // Lighting uniforms
      ambientStrength: { value: ts.lighting.ambient },
      diffuseStrength: { value: ts.lighting.diffuse },
      aoRangeMin: { value: ts.lighting.aoRange.min },
      aoRangeMax: { value: ts.lighting.aoRange.max },
      aoStrength: { value: ts.lighting.aoStrength },
      contrast: { value: ts.contrast },
    },
  ]),
  vertexShader: `
    #include <common>
    #include <shadowmap_pars_vertex>
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying float vHeight;

    void main() {
      vUv = uv;
      vec3 objectNormal = normal;
      vec3 transformedNormal = normalMatrix * objectNormal;
      vNormal = normalize(transformedNormal);
      vHeight = position.y;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;

      #if defined( USE_SHADOWMAP )
        vec4 worldPos = worldPosition;
        #include <shadowmap_vertex>
      #endif
    }
  `,
  fragmentShader: `
    #include <common>
    #include <packing>
    #include <lights_pars_begin>
    #include <shadowmap_pars_fragment>
    #include <shadowmask_pars_fragment>
    uniform sampler2D dirtTexture;
    uniform sampler2D dirt2Texture;
    uniform sampler2D dirt3Texture;
    uniform sampler2D grassTexture;
    uniform sampler2D forestTexture;
    uniform sampler2D foliageColorTex;
    uniform sampler2D foliageOpacityTex;
    uniform sampler2D foliage2ColorTex;
    uniform sampler2D foliage2OpacityTex;
    uniform float textureScale;
    uniform float textureScale2;
    uniform float textureScale3;
    uniform float multiScaleBlend;
    uniform float foliageScale;
    uniform float foliageStrength;
    uniform float foliageThreshold;
    uniform vec3 sunDirection;

    // Colors
    uniform vec3 dirtColor;
    uniform vec3 foliageColor;
    uniform vec3 dirtPathColor;
    uniform vec3 grassColor;
    uniform vec3 darkGrassColor;
    uniform vec3 forestColor;
    uniform vec3 mudColor;
    uniform vec3 riverGrassColor;
    uniform vec3 warmTint;

    // Noise scales
    uniform float fbmScale1;
    uniform float fbmScale2;
    uniform float largeNoiseScale;
    uniform float detailNoiseScale;

    // Path params
    uniform float pathFreq1Y;
    uniform float pathFreq1X;
    uniform float pathFreq2X;
    uniform float pathFreq2Y;
    uniform float pathNoiseScale1;
    uniform float pathNoiseScale2;
    uniform float pathNoiseAmp1;
    uniform float pathNoiseAmp2;
    uniform float pathWidthMin;
    uniform float pathWidthMax;
    uniform float pathStrength;

    // Grass params
    uniform float grassThresh1Min;
    uniform float grassThresh1Max;
    uniform float grassThresh2Min;
    uniform float grassThresh2Max;
    uniform float grassContrast;
    uniform float grassStrength;

    // Forest params
    uniform float forestThreshMin;
    uniform float forestThreshMax;
    uniform float forestStrength;

    // River grass params
    uniform float riverGrassMin;
    uniform float riverGrassMax;
    uniform float riverGrassStrength;

    // Mud params
    uniform float mudRangeMin;
    uniform float mudRangeMax;
    uniform float mudStrength;

    // Lighting params
    uniform float ambientStrength;
    uniform float diffuseStrength;
    uniform float aoRangeMin;
    uniform float aoRangeMax;
    uniform float aoStrength;
    uniform float contrast;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying float vHeight;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    float fbm(vec2 p) {
      float f = 0.0;
      f += 0.5 * noise(p); p *= 2.0;
      f += 0.25 * noise(p); p *= 2.0;
      f += 0.125 * noise(p);
      return f;
    }

    float pathNoise(vec2 p) {
      float path1 = abs(sin(p.y * pathFreq1Y + noise(p * pathNoiseScale1) * pathNoiseAmp1) + cos(p.x * pathFreq1X) * 0.5);
      float path2 = abs(sin(p.x * pathFreq2X + p.y * pathFreq2Y + noise(p * pathNoiseScale2) * pathNoiseAmp2));
      return min(path1, path2);
    }

    // Multi-scale texture sampling to break up tiling
    vec3 sampleMultiScale(sampler2D tex, vec2 uv, float scale1, float scale2, float scale3, float blend) {
      vec3 s1 = texture2D(tex, uv * scale1).rgb;
      vec3 s2 = texture2D(tex, uv * scale2 + 0.33).rgb;
      vec3 s3 = texture2D(tex, uv * scale3 + 0.67).rgb;
      // Use noise to blend between scales for variation
      float blendNoise = noise(uv * 0.5);
      vec3 result = s1;
      result = mix(result, s2, blend * blendNoise);
      result = mix(result, s3, blend * 0.5 * (1.0 - blendNoise));
      return result;
    }

    void main() {
      vec2 worldUV = vWorldPosition.xz * textureScale;
      vec2 worldUV2 = vWorldPosition.xz * textureScale2;
      vec2 worldUV3 = vWorldPosition.xz * textureScale3;

      // Multi-scale dirt sampling with texture variations
      vec3 dirtBase1 = sampleMultiScale(dirtTexture, vWorldPosition.xz, textureScale, textureScale2, textureScale3, multiScaleBlend);
      vec3 dirtBase2 = texture2D(dirt2Texture, worldUV * 0.9).rgb;
      vec3 dirtBase3 = texture2D(dirt3Texture, worldUV * 1.1).rgb;

      // Blend dirt textures using noise for variation
      float dirtBlendNoise = noise(vWorldPosition.xz * 0.015);
      float dirtBlendNoise2 = noise(vWorldPosition.xz * 0.008 + 50.0);
      vec3 dirtBase = dirtBase1;
      dirtBase = mix(dirtBase, dirtBase2, smoothstep(0.4, 0.6, dirtBlendNoise) * 0.5);
      dirtBase = mix(dirtBase, dirtBase3, smoothstep(0.45, 0.65, dirtBlendNoise2) * 0.4);

      // Multi-scale grass sampling
      vec3 grassBase = sampleMultiScale(grassTexture, vWorldPosition.xz * 0.8, textureScale, textureScale2, textureScale3, multiScaleBlend);
      vec3 forestBase = sampleMultiScale(forestTexture, vWorldPosition.xz * 0.6, textureScale, textureScale2, textureScale3, multiScaleBlend);

      // Alpha-based foliage overlay (sparse grass patches)
      vec2 foliageUV = vWorldPosition.xz * foliageScale;
      vec3 foliageCol1 = texture2D(foliageColorTex, foliageUV).rgb;
      float foliageAlpha1 = texture2D(foliageOpacityTex, foliageUV).r;
      vec3 foliageCol2 = texture2D(foliage2ColorTex, foliageUV * 1.3 + 0.5).rgb;
      float foliageAlpha2 = texture2D(foliage2OpacityTex, foliageUV * 1.3 + 0.5).r;

      vec3 dirt = dirtBase * dirtColor;
      vec3 dirtPath = dirtBase * dirtPathColor;
      vec3 grass = grassBase * grassColor;
      vec3 darkGrass = grassBase * darkGrassColor;
      vec3 forest = forestBase * forestColor;

      float n1 = fbm(vWorldPosition.xz * fbmScale1);
      float n2 = fbm(vWorldPosition.xz * fbmScale2 + 50.0);
      float n3 = noise(vWorldPosition.xz * largeNoiseScale + 100.0);
      float fineDetail = noise(vWorldPosition.xz * detailNoiseScale);

      float pathVal = pathNoise(vWorldPosition.xz);
      float pathMask = 1.0 - smoothstep(pathWidthMin, pathWidthMax, pathVal);

      float riverDist = abs(vUv.x - 0.5) * 2.0;
      float nearRiver = 1.0 - smoothstep(riverGrassMin, riverGrassMax, riverDist);

      float grassMask = smoothstep(grassThresh1Min, grassThresh1Max, n1);
      grassMask *= smoothstep(grassThresh2Min, grassThresh2Max, n2);
      grassMask = pow(grassMask, grassContrast);

      float forestMask = smoothstep(forestThreshMin, forestThreshMax, n3) * forestStrength;

      // Start with dirt base
      vec3 baseColor = dirt;

      // Layer grass with standard blending
      baseColor = mix(baseColor, grass, grassMask * grassStrength);
      baseColor = mix(baseColor, darkGrass, forestMask * grassMask);
      baseColor = mix(baseColor, forest, forestMask * (1.0 - grassMask) * 0.5);

      // Apply alpha-based foliage overlays (shows dirt through sparse patches)
      // This creates the natural clumpy grass appearance
      float foliageMask = grassMask * foliageStrength * (1.0 - pathMask);
      vec3 foliageTinted1 = foliageCol1 * foliageColor;
      vec3 foliageTinted2 = foliageCol2 * foliageColor * vec3(0.9, 1.1, 0.85);

      // Apply foliage with alpha - lets dirt show through gaps
      float alpha1 = foliageAlpha1 * foliageMask * smoothstep(foliageThreshold - 0.1, foliageThreshold + 0.1, foliageAlpha1);
      float alpha2 = foliageAlpha2 * foliageMask * smoothstep(foliageThreshold - 0.1, foliageThreshold + 0.1, foliageAlpha2) * 0.7;
      baseColor = mix(baseColor, foliageTinted1, alpha1);
      baseColor = mix(baseColor, foliageTinted2, alpha2);

      // Paths on top
      baseColor = mix(baseColor, dirtPath, pathMask * pathStrength);

      vec3 riverGrass = grass * riverGrassColor;
      baseColor = mix(baseColor, riverGrass, nearRiver * riverGrassStrength * (1.0 - pathMask));

      vec3 mud = dirt * mudColor;
      float mudMask = (1.0 - smoothstep(mudRangeMin, mudRangeMax, riverDist)) * mudStrength;
      baseColor = mix(baseColor, mud, mudMask);

      float NdotL = max(dot(vNormal, sunDirection), 0.0);
      float diffuse = NdotL * diffuseStrength;
      float heightAO = smoothstep(aoRangeMin, aoRangeMax, vHeight) * aoStrength + (1.0 - aoStrength);

      // Get shadow value
      float shadow = getShadowMask();

      float lighting = (ambientStrength + diffuse * shadow) * heightAO;

      baseColor *= 0.9 + fineDetail * 0.2;
      baseColor *= warmTint;
      baseColor = pow(baseColor, vec3(contrast));

      gl_FragColor = vec4(baseColor * lighting, 1.0);
    }
  `,
});

const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
terrain.receiveShadow = true;
scene.add(terrain);

// Water
function createWater() {
  const r = config.river;
  const w = config.water;

  const waterGeometry = new THREE.PlaneGeometry(
    r.geometry.width,
    worldSize,
    r.geometry.widthSegments,
    r.geometry.lengthSegments,
  );
  waterGeometry.rotateX(-Math.PI / 2);

  const waterVerts = waterGeometry.attributes.position.array;
  const segX = r.geometry.widthSegments + 1;
  const segZ = r.geometry.lengthSegments + 1;

  for (let zi = 0; zi < segZ; zi++) {
    const z = (zi / (segZ - 1) - 0.5) * worldSize;
    const gridZ = (z / worldSize + 0.5) * worldDepth;
    const riverCurve =
      Math.sin(gridZ * r.curveFrequency1) * r.curveAmplitude1 +
      Math.sin(gridZ * r.curveFrequency2) * r.curveAmplitude2;
    const centerX =
      ((worldWidth / 2 + riverCurve) / worldWidth - 0.5) * worldSize;

    for (let xi = 0; xi < segX; xi++) {
      const idx = (zi * segX + xi) * 3;
      const localX = (xi / (segX - 1) - 0.5) * r.geometry.width;
      waterVerts[idx] = centerX + localX;
      waterVerts[idx + 1] = getHeightAt(centerX, z) + r.waterHeight;
      waterVerts[idx + 2] = z;
    }
  }

  waterGeometry.computeVertexNormals();

  const waterMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      waterColor: { value: new THREE.Color(w.color) },
      camPos: { value: camera.position },
      opacity: { value: w.opacity },
      waveSpeedX: { value: w.waveSpeed.x },
      waveSpeedZ: { value: w.waveSpeed.z },
      waveSpeedCombined: { value: w.waveSpeed.combined },
      waveAmpX: { value: w.waveAmplitude.x },
      waveAmpZ: { value: w.waveAmplitude.z },
      waveAmpCombined: { value: w.waveAmplitude.combined },
      waveFreqX: { value: w.waveFrequency.x },
      waveFreqZ: { value: w.waveFrequency.z },
      waveFreqCombinedX: { value: w.waveFrequency.combined.x },
      waveFreqCombinedZ: { value: w.waveFrequency.combined.z },
      fresnelPower: { value: w.fresnel.power },
      fresnelSkyBlend: { value: w.fresnel.skyBlend },
      specPower: { value: w.specular.power },
      specIntensity: { value: w.specular.intensity },
      sparkleScale: { value: w.sparkle.scale },
      sparkleSpeed: { value: w.sparkle.speed },
      sparklePower: { value: w.sparkle.power },
      sparkleIntensity: { value: w.sparkle.intensity },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorldPosition;
      varying vec3 vNormal;
      uniform float time;
      uniform float waveSpeedX;
      uniform float waveSpeedZ;
      uniform float waveSpeedCombined;
      uniform float waveAmpX;
      uniform float waveAmpZ;
      uniform float waveAmpCombined;
      uniform float waveFreqX;
      uniform float waveFreqZ;
      uniform float waveFreqCombinedX;
      uniform float waveFreqCombinedZ;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec3 pos = position;
        pos.y += sin(pos.x * waveFreqX + time * waveSpeedX) * waveAmpX;
        pos.y += sin(pos.z * waveFreqZ + time * waveSpeedZ) * waveAmpZ;
        pos.y += cos(pos.x * waveFreqCombinedX + pos.z * waveFreqCombinedZ + time * waveSpeedCombined) * waveAmpCombined;
        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform vec3 waterColor;
      uniform float time;
      uniform vec3 camPos;
      uniform float opacity;
      uniform float fresnelPower;
      uniform float fresnelSkyBlend;
      uniform float specPower;
      uniform float specIntensity;
      uniform float sparkleScale;
      uniform float sparkleSpeed;
      uniform float sparklePower;
      uniform float sparkleIntensity;

      varying vec2 vUv;
      varying vec3 vWorldPosition;
      varying vec3 vNormal;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      void main() {
        vec3 viewDir = normalize(camPos - vWorldPosition);
        float fresnel = pow(1.0 - max(dot(viewDir, vec3(0.0, 1.0, 0.0)), 0.0), fresnelPower);

        float widthGrad = smoothstep(0.0, 0.5, vUv.x) * smoothstep(1.0, 0.5, vUv.x);
        vec3 deepWater = waterColor * 0.55;
        vec3 shallowWater = waterColor * 1.15;
        vec3 baseColor = mix(deepWater, shallowWater, widthGrad);

        float colorNoise = noise(vWorldPosition.xz * 0.02 + time * 0.3);
        baseColor += vec3(-0.02, 0.02, 0.03) * colorNoise;

        vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
        vec3 halfDir = normalize(lightDir + viewDir);
        float spec = pow(max(dot(vNormal, halfDir), 0.0), specPower);
        baseColor += vec3(1.0, 0.98, 0.94) * spec * specIntensity;

        float sparkleNoise = noise(vWorldPosition.xz * sparkleScale + time * sparkleSpeed);
        float sparkle = pow(sparkleNoise, sparklePower) * sparkleIntensity;
        baseColor += vec3(1.0) * sparkle;

        vec3 skyColor = vec3(0.55, 0.75, 0.88);
        baseColor = mix(baseColor, skyColor, fresnel * fresnelSkyBlend);

        gl_FragColor = vec4(baseColor, opacity);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
  });

  const water = new THREE.Mesh(waterGeometry, waterMaterial);
  scene.add(water);
  return { water, material: waterMaterial };
}

const waterObj = createWater();

// Load boulder model from config path
let boulderModel = null;
gltfLoader.load(config.assets.models.boulder, (gltf) => {
  boulderModel = gltf.scene;
  boulderModel.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  const rc = config.rocks.boulders;
  for (let i = 0; i < rc.count; i++) {
    const z = (Math.random() - 0.5) * worldSize * 0.9;
    const gridZ = (z / worldSize + 0.5) * worldDepth;
    const r = config.river;
    const riverCurve =
      Math.sin(gridZ * r.curveFrequency1) * r.curveAmplitude1 +
      Math.sin(gridZ * r.curveFrequency2) * r.curveAmplitude2;
    const offset = (Math.random() - 0.5) * rc.spreadFromRiver;
    const x =
      ((worldWidth / 2 + riverCurve + offset) / worldWidth - 0.5) * worldSize;

    const boulder = boulderModel.clone();
    const scale = rc.scale.min + Math.random() * (rc.scale.max - rc.scale.min);
    boulder.scale.setScalar(scale);
    boulder.position.set(x, getHeightAt(x, z) - 1, z);
    boulder.rotation.y = Math.random() * Math.PI * 2;
    scene.add(boulder);
  }
});

// Shared materials for performance (reuse across all trees)
const foliageMaterials = config.deciduousTrees.foliage.colors.map(
  (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85 }),
);
const cypressMaterials = config.cypressTrees.foliage.colors.map(
  (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85 }),
);
const bushMaterials = config.bushes.colors.map(
  (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85 }),
);
const trunkMaterial = new THREE.MeshStandardMaterial({
  color: config.deciduousTrees.trunk.color,
  roughness: 0.95,
});
const cypressTrunkMaterial = new THREE.MeshStandardMaterial({
  color: config.cypressTrees.trunk.color,
  roughness: 0.95,
});

// Pre-create shared geometries
const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 10, 6);
const cypressTrunkGeometry = new THREE.CylinderGeometry(0.35, 0.55, 8, 6);

// Create deformed sphere geometry once
function createDeformedSphere(radius, detail, seed) {
  const geometry = new THREE.IcosahedronGeometry(radius, detail);
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const n = perlin.noise(x * 0.3 + seed, y * 0.3, z * 0.3) * 0.3 + 1;
    pos.setXYZ(i, x * n, y * n * (y > 0 ? 1 : 0.7), z * n);
  }
  geometry.computeVertexNormals();
  return geometry;
}

// Pre-create foliage geometries (reuse for all trees)
const foliageGeoms = [
  createDeformedSphere(8, 1, 0),
  createDeformedSphere(7, 1, 10),
  createDeformedSphere(6, 1, 20),
  createDeformedSphere(5, 1, 30),
];
const smallBlobGeom = createDeformedSphere(3, 1, 40);
const medBlobGeom = createDeformedSphere(4, 1, 50);
const coneGeoms = [
  new THREE.ConeGeometry(4.5, 12, 6),
  new THREE.ConeGeometry(4, 10, 6),
  new THREE.ConeGeometry(3.5, 8, 6),
  new THREE.ConeGeometry(3, 6, 6),
];

// Deciduous tree - fluffy multi-layered canopy
function createDeciduousTree() {
  const group = new THREE.Group();
  const tc = config.deciduousTrees;

  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.y = 5;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  group.add(trunk);

  // Core canopy - 4 overlapping large spheres
  for (let i = 0; i < 4; i++) {
    const dome = new THREE.Mesh(
      foliageGeoms[i],
      foliageMaterials[i % foliageMaterials.length],
    );
    dome.position.set(
      (Math.random() - 0.5) * 3,
      tc.foliage.baseY + i * 1.5,
      (Math.random() - 0.5) * 3,
    );
    dome.castShadow = true;
    dome.receiveShadow = true;
    group.add(dome);
  }

  // Medium outer blobs for fluffy silhouette
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.5;
    const blob = new THREE.Mesh(
      medBlobGeom,
      foliageMaterials[Math.floor(Math.random() * foliageMaterials.length)],
    );
    blob.position.set(
      Math.cos(angle) * 6,
      tc.foliage.baseY + 2 + Math.random() * 5,
      Math.sin(angle) * 6,
    );
    blob.castShadow = true;
    blob.receiveShadow = true;
    group.add(blob);
  }

  // Small detail blobs for texture
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.3;
    const radius = 4 + Math.random() * 4;
    const blob = new THREE.Mesh(
      smallBlobGeom,
      foliageMaterials[Math.floor(Math.random() * foliageMaterials.length)],
    );
    blob.position.set(
      Math.cos(angle) * radius,
      tc.foliage.baseY + Math.random() * 6,
      Math.sin(angle) * radius,
    );
    blob.castShadow = true;
    blob.receiveShadow = true;
    group.add(blob);
  }

  return group;
}

// Cypress tree - tall stacked cones
function createCypressTree() {
  const group = new THREE.Group();
  const tc = config.cypressTrees;

  const trunk = new THREE.Mesh(cypressTrunkGeometry, cypressTrunkMaterial);
  trunk.position.y = 4;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  group.add(trunk);

  // 4 stacked cones for taller cypress
  for (let i = 0; i < 4; i++) {
    const cone = new THREE.Mesh(
      coneGeoms[i],
      cypressMaterials[i % cypressMaterials.length],
    );
    cone.position.y = tc.foliage.baseY + i * 5;
    cone.castShadow = true;
    cone.receiveShadow = true;
    group.add(cone);
  }

  return group;
}

// Bush - fluffy clustered blobs
function createBush(size = 1) {
  const group = new THREE.Group();
  const bc = config.bushes;

  // Core blob
  const coreSize = (2.0 + Math.random() * 0.5) * size;
  const coreGeom = new THREE.IcosahedronGeometry(coreSize, 1);
  const coreBlob = new THREE.Mesh(
    coreGeom,
    bushMaterials[Math.floor(Math.random() * bushMaterials.length)],
  );
  coreBlob.position.y = coreSize * 0.6;
  coreBlob.castShadow = true;
  coreBlob.receiveShadow = true;
  group.add(coreBlob);

  // Surrounding blobs for fluffy look
  const numBlobs = 4 + Math.floor(Math.random() * 3);
  for (let i = 0; i < numBlobs; i++) {
    const blobSize = (1.2 + Math.random() * 0.8) * size;
    const geometry = new THREE.IcosahedronGeometry(blobSize, 0);
    const blob = new THREE.Mesh(
      geometry,
      bushMaterials[Math.floor(Math.random() * bushMaterials.length)],
    );
    const angle = (i / numBlobs) * Math.PI * 2;
    const radius = bc.spread * size * 0.6;
    blob.position.set(
      Math.cos(angle) * radius + (Math.random() - 0.5) * size,
      blobSize * 0.5 + Math.random() * size * 0.5,
      Math.sin(angle) * radius + (Math.random() - 0.5) * size,
    );
    blob.castShadow = true;
    blob.receiveShadow = true;
    group.add(blob);
  }

  return group;
}

// Procedural rock
function createRock(size = 1) {
  const group = new THREE.Group();
  const rc = config.rocks.procedural;

  const rockSize =
    (rc.size.min + Math.random() * (rc.size.max - rc.size.min)) * size;
  const geometry = new THREE.DodecahedronGeometry(rockSize, 1);

  const pos = geometry.attributes.position;
  for (let j = 0; j < pos.count; j++) {
    const x = pos.getX(j);
    const y = pos.getY(j);
    const z = pos.getZ(j);
    const noise = perlin.noise(x * 0.4, y * 0.4, z * 0.4) * 0.3 + 1;
    pos.setXYZ(j, x * noise, y * noise * 0.65, z * noise);
  }
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    color: rc.colors[Math.floor(Math.random() * rc.colors.length)],
    roughness: rc.roughness,
    metalness: rc.metalness,
  });

  const rock = new THREE.Mesh(geometry, material);
  rock.position.y = rockSize * 0.2;
  rock.rotation.set(
    Math.random() * 0.4,
    Math.random() * Math.PI,
    Math.random() * 0.4,
  );
  rock.castShadow = true;
  rock.receiveShadow = true;
  group.add(rock);

  return group;
}

// Ground cover
function createGroundCover() {
  const group = new THREE.Group();
  const gc = config.groundCover;
  const numBlobs =
    gc.blobs.min + Math.floor(Math.random() * (gc.blobs.max - gc.blobs.min));

  for (let i = 0; i < numBlobs; i++) {
    const size =
      gc.blobSize.min + Math.random() * (gc.blobSize.max - gc.blobSize.min);
    const geometry = new THREE.SphereGeometry(size, 5, 4);
    const material = new THREE.MeshStandardMaterial({
      color: gc.colors[Math.floor(Math.random() * gc.colors.length)],
      roughness: 0.9,
    });
    const blob = new THREE.Mesh(geometry, material);
    blob.position.set(
      (Math.random() - 0.5) * gc.spread,
      size * 0.4,
      (Math.random() - 0.5) * gc.spread,
    );
    blob.scale.y = gc.flatness;
    blob.castShadow = true;
    group.add(blob);
  }

  return group;
}

// Instanced grass system - efficient rendering using InstancedMesh
function createInstancedGrass() {
  const gc = config.grass;
  const avgBladesPerTuft = (gc.tuft.blades.min + gc.tuft.blades.max) / 2;
  const totalBlades = Math.floor(gc.count * avgBladesPerTuft);

  // Create blade geometry once
  const h = (gc.blade.height.min + gc.blade.height.max) / 2;
  const w = gc.blade.width;

  const positions = new Float32Array([-w / 2, 0, 0, w / 2, 0, 0, 0, h, 0]);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.computeVertexNormals();

  // Create one instanced mesh per color for variety
  const instancedMeshes = [];
  const dummy = new THREE.Object3D();

  gc.colors.forEach((color) => {
    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.8,
      side: THREE.DoubleSide,
    });

    const bladesPerColor = Math.floor(totalBlades / gc.colors.length);
    const instancedMesh = new THREE.InstancedMesh(
      geometry,
      material,
      bladesPerColor,
    );
    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;

    let instanceIndex = 0;
    const tuftsPerColor = Math.floor(gc.count / gc.colors.length);

    for (let t = 0; t < tuftsPerColor && instanceIndex < bladesPerColor; t++) {
      // Random tuft position
      const tuftX = (Math.random() - 0.5) * worldSize * gc.spreadFactor;
      const tuftZ = (Math.random() - 0.5) * worldSize * gc.spreadFactor;

      // Skip if too close to river
      if (getRiverDistance(tuftX, tuftZ) < gc.minRiverDistance) continue;

      const tuftY = getHeightAt(tuftX, tuftZ);
      const tuftScale =
        gc.scale.min + Math.random() * (gc.scale.max - gc.scale.min);

      // Blades per tuft
      const numBlades =
        gc.tuft.blades.min +
        Math.floor(Math.random() * (gc.tuft.blades.max - gc.tuft.blades.min));

      for (let b = 0; b < numBlades && instanceIndex < bladesPerColor; b++) {
        const bladeX = tuftX + (Math.random() - 0.5) * gc.tuft.spread;
        const bladeZ = tuftZ + (Math.random() - 0.5) * gc.tuft.spread;
        const bladeHeight =
          gc.blade.height.min +
          Math.random() * (gc.blade.height.max - gc.blade.height.min);
        const heightScale = bladeHeight / h;

        dummy.position.set(bladeX, tuftY, bladeZ);
        dummy.rotation.set(
          (Math.random() - 0.5) * 0.3,
          Math.random() * Math.PI * 2,
          (Math.random() - 0.5) * 0.3,
        );
        dummy.scale.set(tuftScale, tuftScale * heightScale, tuftScale);
        dummy.updateMatrix();

        instancedMesh.setMatrixAt(instanceIndex, dummy.matrix);
        instanceIndex++;
      }
    }

    instancedMesh.count = instanceIndex;
    instancedMesh.instanceMatrix.needsUpdate = true;
    scene.add(instancedMesh);
    instancedMeshes.push(instancedMesh);
  });

  return instancedMeshes;
}

// Placement helper
function canPlace(x, z, minRiverDist = 20) {
  return getRiverDistance(x, z) > minRiverDist;
}

// Place deciduous trees
const dtc = config.deciduousTrees;
for (let i = 0; i < dtc.count; i++) {
  const x = (Math.random() - 0.5) * worldSize * dtc.spreadFactor;
  const z = (Math.random() - 0.5) * worldSize * dtc.spreadFactor;
  if (!canPlace(x, z, dtc.minRiverDistance)) continue;

  const tree = createDeciduousTree();
  const scale = dtc.scale.min + Math.random() * (dtc.scale.max - dtc.scale.min);
  tree.scale.setScalar(scale);
  tree.position.set(x, getHeightAt(x, z), z);
  tree.rotation.y = Math.random() * Math.PI * 2;
  scene.add(tree);
}

// Place cypress trees
const ctc = config.cypressTrees;
for (let i = 0; i < ctc.count; i++) {
  const x = (Math.random() - 0.5) * worldSize * ctc.spreadFactor;
  const z = (Math.random() - 0.5) * worldSize * ctc.spreadFactor;
  if (!canPlace(x, z, ctc.minRiverDistance)) continue;

  const tree = createCypressTree();
  const scale = ctc.scale.min + Math.random() * (ctc.scale.max - ctc.scale.min);
  tree.scale.setScalar(scale);
  tree.position.set(x, getHeightAt(x, z), z);
  tree.rotation.y = Math.random() * Math.PI * 2;
  scene.add(tree);
}

// Place bushes
const bc = config.bushes;
for (let i = 0; i < bc.count; i++) {
  const x = (Math.random() - 0.5) * worldSize * bc.spreadFactor;
  const z = (Math.random() - 0.5) * worldSize * bc.spreadFactor;
  if (!canPlace(x, z, bc.minRiverDistance)) continue;

  const bush = createBush(
    bc.scale.min + Math.random() * (bc.scale.max - bc.scale.min),
  );
  bush.position.set(x, getHeightAt(x, z), z);
  scene.add(bush);
}

// Place ground cover
const gcc = config.groundCover;
for (let i = 0; i < gcc.count; i++) {
  const x = (Math.random() - 0.5) * worldSize * gcc.spreadFactor;
  const z = (Math.random() - 0.5) * worldSize * gcc.spreadFactor;
  if (!canPlace(x, z, gcc.minRiverDistance)) continue;

  const cover = createGroundCover();
  cover.position.set(x, getHeightAt(x, z), z);
  scene.add(cover);
}

// Create instanced grass (single call, handles all placement internally)
const grassMeshes = createInstancedGrass();

// Place procedural rocks
const prc = config.rocks.procedural;
for (let i = 0; i < prc.count; i++) {
  const z = (Math.random() - 0.5) * worldSize * 0.9;
  const gridZ = (z / worldSize + 0.5) * worldDepth;
  const r = config.river;
  const riverCurve =
    Math.sin(gridZ * r.curveFrequency1) * r.curveAmplitude1 +
    Math.sin(gridZ * r.curveFrequency2) * r.curveAmplitude2;
  const offset = (Math.random() - 0.5) * prc.spreadFromRiver;
  const x =
    ((worldWidth / 2 + riverCurve + offset) / worldWidth - 0.5) * worldSize;

  const rock = createRock(
    prc.scale.min + Math.random() * (prc.scale.max - prc.scale.min),
  );
  rock.position.set(x, getHeightAt(x, z), z);
  scene.add(rock);
}

// Post-processing setup
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// Bloom for that soft, dreamy look
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.3, // strength - subtle bloom
  0.5, // radius
  0.85, // threshold - only bright areas bloom
);
composer.addPass(bloomPass);

// Color grading shader for warmer, more vibrant colors
const colorGradingShader = {
  uniforms: {
    tDiffuse: { value: null },
    saturation: { value: 1.15 },
    contrast: { value: 1.05 },
    brightness: { value: 0.02 },
    warmth: { value: new THREE.Vector3(1.04, 1.0, 0.94) },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float saturation;
    uniform float contrast;
    uniform float brightness;
    uniform vec3 warmth;
    varying vec2 vUv;

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);

      // Apply warmth tint
      color.rgb *= warmth;

      // Adjust brightness
      color.rgb += brightness;

      // Adjust contrast
      color.rgb = (color.rgb - 0.5) * contrast + 0.5;

      // Adjust saturation
      float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      color.rgb = mix(vec3(gray), color.rgb, saturation);

      // Slight vignette for depth
      vec2 uv = vUv * (1.0 - vUv.yx);
      float vig = uv.x * uv.y * 15.0;
      vig = pow(vig, 0.15);
      color.rgb *= vig;

      gl_FragColor = color;
    }
  `,
};

const colorPass = new ShaderPass(colorGradingShader);
composer.addPass(colorPass);

// Output pass for proper tone mapping
const outputPass = new OutputPass();
composer.addPass(outputPass);

// Animation loop
let time = 0;
function animate() {
  requestAnimationFrame(animate);
  time += 0.016;
  waterObj.material.uniforms.time.value = time;
  waterObj.material.uniforms.camPos.value.copy(camera.position);
  controls.update();
  composer.render();
}

animate();

// Resize handler
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});
