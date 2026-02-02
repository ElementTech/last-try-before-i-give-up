// Terrain Generation Configuration
// Modify these values to customize the terrain appearance

export const config = {
  // ===================
  // ASSET PATHS
  // ===================
  assets: {
    textures: {
      // Primary textures
      dirt: "/textures/brown_mud_diff.jpg",
      dirt2: "/textures/Ground054_1K-JPG_Color.jpg",
      dirt3: "/textures/Ground037_1K-JPG_Color.jpg",
      grass: "/textures/grass_rock_diff.jpg",
      forestGround: "/textures/forest_ground_diff.jpg",
      // Alpha-based foliage overlays
      foliageColor: "/textures/Foliage001_1K-PNG_Color.png",
      foliageOpacity: "/textures/Foliage001_1K-PNG_Opacity.png",
      foliage2Color: "/textures/Foliage003_Color.png",
      foliage2Opacity: "/textures/Foliage003_Opacity.png",
    },
    models: {
      boulder: "/models/boulder_01/boulder_01_1k.gltf",
    },
  },

  // ===================
  // WORLD SETTINGS
  // ===================
  world: {
    size: 1000, // Total world size
    resolution: 256, // Grid resolution (worldWidth/worldDepth)
  },

  // ===================
  // CAMERA
  // ===================
  camera: {
    fov: 50,
    position: { x: 150, y: 180, z: 350 },
    target: { x: 0, y: 20, z: 0 },
    minDistance: 50,
    maxDistance: 800,
    maxPolarAngle: Math.PI / 2.2,
  },

  // ===================
  // SKY & FOG
  // ===================
  sky: {
    // Softer, warmer sky like reference
    color: 0x8ec8e8,
    fogColor: 0xa8c8d8,
    fogDensity: 0.0008,
  },

  // ===================
  // LIGHTING
  // ===================
  lighting: {
    ambient: {
      color: 0xfff8f0,
      intensity: 0.35,
    },
    sun: {
      // Warm golden sunlight
      color: 0xfff4e8,
      intensity: 2.8,
      position: { x: 350, y: 500, z: 250 },
      shadowMapSize: 4096,
      shadowBias: -0.0001,
      shadowNormalBias: 0.02,
    },
    hemisphere: {
      skyColor: 0x90d0ff,
      groundColor: 0x556633,
      intensity: 0.6,
    },
    fill: {
      color: 0xb0d0ff,
      intensity: 0.2,
      position: { x: -300, y: 150, z: -200 },
    },
  },

  // ===================
  // TERRAIN HEIGHT
  // ===================
  terrain: {
    baseHeight: 40,
    // Noise layers for terrain shape
    noise: {
      layer1: { scale: 0.008, amplitude: 50 },
      layer2: { scale: 0.02, amplitude: 20 },
      layer3: { scale: 0.05, amplitude: 8 },
    },
    minHeight: 5,
  },

  // ===================
  // RIVER
  // ===================
  river: {
    width: 12,
    bankWidth: 36, // riverWidth * 3
    curveFrequency1: 0.025,
    curveAmplitude1: 25,
    curveFrequency2: 0.008,
    curveAmplitude2: 40,
    depth: 20,
    bankDepth: 8,
    waterHeight: 0.8, // Above terrain
    geometry: {
      width: 55,
      widthSegments: 80,
      lengthSegments: 800,
    },
  },

  // ===================
  // WATER SHADER
  // ===================
  water: {
    color: 0x4a8a9a,
    opacity: 0.75,
    waveSpeed: { x: 1.2, z: 0.9, combined: 1.5 },
    waveAmplitude: { x: 0.2, z: 0.15, combined: 0.1 },
    waveFrequency: { x: 0.08, z: 0.06, combined: { x: 0.12, z: 0.08 } },
    fresnel: {
      power: 2.5,
      skyBlend: 0.4,
    },
    specular: {
      power: 60,
      intensity: 0.4,
    },
    sparkle: {
      scale: 0.5,
      speed: 2.0,
      power: 6.0,
      intensity: 0.2,
    },
  },

  // ===================
  // TERRAIN SHADER COLORS
  // ===================
  terrainColors: {
    // More vibrant, saturated colors like reference
    dirt: { r: 0.85, g: 0.65, b: 0.45 },
    dirtPath: { r: 1.0, g: 0.8, b: 0.55 },
    grass: { r: 0.5, g: 1.6, b: 0.35 },
    darkGrass: { r: 0.35, g: 1.3, b: 0.25 },
    forest: { r: 0.4, g: 1.4, b: 0.3 },
    mud: { r: 0.5, g: 0.4, b: 0.3 },
    riverGrass: { r: 0.55, g: 1.4, b: 0.45 },
    warmTint: { r: 1.02, g: 1.0, b: 0.96 },
    foliage: { r: 0.55, g: 1.5, b: 0.4 },
  },

  // ===================
  // TERRAIN SHADER NOISE
  // ===================
  terrainShader: {
    textureScale: 0.05,
    // Multi-scale sampling to break up tiling
    textureScale2: 0.15,
    textureScale3: 0.008,
    multiScaleBlend: 0.3,
    sunDirection: { x: 0.4, y: 0.6, z: 0.7 },
    // FBM noise scales
    noise: {
      fbm1: 0.012,
      fbm2: 0.025,
      large: 0.006,
      detail: 0.08,
    },
    // Foliage alpha overlay settings
    foliage: {
      scale: 0.08,
      strength: 0.85,
      threshold: 0.3,
    },
    // Path generation - sharper, more defined dirt roads
    paths: {
      frequency1: { y: 0.006, x: 0.004 },
      frequency2: { x: 0.005, y: 0.003 },
      noiseScale1: 0.002,
      noiseScale2: 0.003,
      noiseAmplitude1: 2.0,
      noiseAmplitude2: 1.5,
      width: { min: 0.04, max: 0.12 },
      strength: 0.92,
    },
    // Blending
    grassMask: {
      threshold1: { min: 0.3, max: 0.65 },
      threshold2: { min: 0.25, max: 0.55 },
      contrast: 0.7,
      strength: 0.9,
    },
    forestMask: {
      threshold: { min: 0.55, max: 0.8 },
      strength: 0.7,
    },
    riverGrass: {
      range: { min: 0.05, max: 0.2 },
      strength: 0.6,
    },
    mud: {
      range: { min: 0.0, max: 0.06 },
      strength: 0.5,
    },
    lighting: {
      ambient: 0.35,
      diffuse: 0.65,
      aoRange: { min: 20, max: 60 },
      aoStrength: 0.15,
    },
    contrast: 1.1,
  },

  // ===================
  // TREES - DECIDUOUS
  // ===================
  deciduousTrees: {
    count: 500,
    spreadFactor: 0.88,
    minRiverDistance: 30,
    scale: { min: 0.5, max: 1.1 },
    trunk: {
      radiusTop: 0.5,
      radiusBottom: 0.7,
      height: 10,
      segments: 6,
      color: 0x3a2518,
    },
    foliage: {
      // More vibrant greens with variation
      colors: [0x2a8a2a, 0x3d9b3d, 0x4aad4a, 0x228822, 0x339933],
      layers: 3,
      baseY: 12,
      layerSpacing: 3,
      baseRadius: 7,
      radiusShrink: 0.12,
      segments: 10,
      detailBlobs: 10,
      blobSize: { min: 1.8, max: 3.6 },
      blobDistance: { min: 5, max: 7.5 },
    },
  },

  // ===================
  // TREES - CYPRESS
  // ===================
  cypressTrees: {
    count: 250,
    spreadFactor: 0.88,
    minRiverDistance: 30,
    scale: { min: 0.55, max: 1.0 },
    trunk: {
      radiusTop: 0.35,
      radiusBottom: 0.55,
      height: 8,
      segments: 6,
      color: 0x2a1810,
    },
    foliage: {
      // Darker, richer greens for cypresses
      colors: [0x1a6a3a, 0x1f5530, 0x257540, 0x186830],
      layers: 3,
      baseHeight: 28,
      heightShrink: 0.1,
      baseRadius: 3.5,
      radiusGrow: 0.06,
      segments: 8,
      baseY: 8,
    },
  },

  // ===================
  // BUSHES
  // ===================
  bushes: {
    count: 1200,
    spreadFactor: 0.92,
    minRiverDistance: 10,
    scale: { min: 0.4, max: 1.0 },
    // More varied and vibrant bush colors
    colors: [0x3a8a3a, 0x2f7f2f, 0x4a9a4a, 0x358535, 0x2a7a2a],
    blobs: { min: 5, max: 9 },
    blobSize: { min: 1.4, max: 2.9 },
    spread: 3,
  },

  // ===================
  // GROUND COVER
  // ===================
  groundCover: {
    count: 1800,
    spreadFactor: 0.92,
    minRiverDistance: 12,
    colors: [0x3a8a3a, 0x4a9a4a, 0x2f7f2f, 0x459045],
    blobs: { min: 3, max: 5 },
    blobSize: { min: 0.4, max: 0.9 },
    spread: 1.2,
    flatness: 0.6,
  },

  // ===================
  // GRASS TUFTS
  // ===================
  grass: {
    count: 10000,
    spreadFactor: 0.95,
    minRiverDistance: 8,
    // More vibrant greens
    colors: [
      0x5a9c42, // Bright yellow-green
      0x4a8c35, // Medium green
      0x6aac52, // Light green
      0x3a7a28, // Rich green
      0x7abc5a, // Very bright green
      0x4a9540, // Fresh green
    ],
    // Blade geometry
    blade: {
      width: 0.35,
      height: { min: 2.0, max: 5.0 },
    },
    // Tuft = cluster of blades
    tuft: {
      blades: { min: 6, max: 15 },
      spread: 1.0,
    },
    scale: { min: 0.7, max: 1.5 },
  },

  // ===================
  // ROCKS
  // ===================
  rocks: {
    // Procedural rocks along river
    procedural: {
      count: 100,
      spreadFromRiver: 50,
      scale: { min: 0.2, max: 0.6 },
      size: { min: 2, max: 4.5 },
      colors: [0x5a5a65, 0x4a4a55, 0x656575, 0x555560],
      roughness: 0.85,
      metalness: 0.1,
    },
    // Boulder models
    boulders: {
      count: 80,
      spreadFromRiver: 55,
      scale: { min: 2, max: 8 },
    },
  },

  // ===================
  // RENDERING
  // ===================
  rendering: {
    antialias: true,
    pixelRatioMax: 2,
    toneMapping: "ACESFilmic",
    toneMappingExposure: 1.1,
    shadowMapType: "PCFSoft",
  },
};
