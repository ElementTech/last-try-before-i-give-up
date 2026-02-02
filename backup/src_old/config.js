// Terrain Generation Configuration
// Modify these values to customize the terrain appearance

export const config = {
  // ===================
  // ASSET PATHS
  // ===================
  assets: {
    textures: {
      // Professional PBR textures
      dirt: "/textures/Ground054_1K-JPG_Color.jpg",
      dirt2: "/textures/Ground054_1K-JPG_Color.jpg",
      dirt3: "/textures/Ground054_1K-JPG_Color.jpg",
      grass: "/textures/Grass001_1K-JPG_Color.jpg",
      forestGround: "/textures/Grass001_1K-JPG_Color.jpg",
      // Normal maps for detail
      grassNormal: "/textures/Grass001_1K-JPG_NormalGL.jpg",
      dirtNormal: "/textures/Ground054_1K-JPG_NormalGL.jpg",
      // Alpha-based foliage overlays
      foliageColor: "/textures/Foliage001_1K-PNG_Color.png",
      foliageOpacity: "/textures/Foliage001_1K-PNG_Opacity.png",
      foliage2Color: "/textures/Foliage003_Color.png",
      foliage2Opacity: "/textures/Foliage003_Opacity.png",
      // Heightmap for terrain (grayscale PNG)
      heightmap: "/textures/heightmap_rugged.png",
      // Splatmap/diffuse for terrain coloring
      splatmap: "/textures/splatmap_rugged.png",
    },
    models: {
      boulder: "/models/boulder_01/boulder_01_1k.gltf",
    },
  },

  // ===================
  // HEIGHTMAP SETTINGS
  // ===================
  heightmap: {
    enabled: true, // Using Rugged Terrain heightmap
    heightScale: 100, // Realistic elevation with rivers and valleys
    heightOffset: 0, // Base height offset
  },

  // ===================
  // SPLATMAP SETTINGS
  // ===================
  splatmap: {
    enabled: true, // Using realistic diffuse texture from Rugged Terrain pack
    blendWithProcedural: 0.15, // Blend slightly with procedural
  },

  // ===================
  // WATER SETTINGS
  // ===================
  waterPlane: {
    enabled: true,
    height: 8, // Low enough to sit in valleys/rivers
  },

  // ===================
  // OCEAN SHADER
  // ===================
  ocean: {
    textureWidth: 512,
    textureHeight: 512,
    waterColor: 0x4a8aaa, // Clear blue water visible in valleys
    distortionScale: 1.0, // Calm water
    sunColor: 0xfff8f0,
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
    fov: 60, // Standard FOV matching reference
    position: { x: 100, y: 60, z: 150 }, // Lower angle closer to terrain like reference
    target: { x: 0, y: 20, z: 0 },
    minDistance: 50,
    maxDistance: 800,
    maxPolarAngle: Math.PI / 2.2,
  },

  // ===================
  // SKY & FOG
  // ===================
  sky: {
    // Atmospheric sky shader parameters - CRYSTAL CLEAR
    turbidity: 0.1, // Almost zero atmospheric density
    rayleigh: 0.1, // Minimal scattering
    mieCoefficient: 0.0001, // Almost zero haze
    mieDirectionalG: 0.3,
    sunElevation: 55, // High clear sun
    sunAzimuth: 120,
    // NO FOG WHATSOEVER
    fogColor: 0xffffff,
    fogDensity: 0,
  },

  // ===================
  // LIGHTING
  // ===================
  lighting: {
    ambient: {
      color: 0xfff8f0,
      intensity: 0.5, // Softer ambient
    },
    sun: {
      // Warm directional sunlight like reference
      color: 0xfff5e8,
      intensity: 1.8, // Moderate for natural shadows
      position: { x: 100, y: 100, z: 50 }, // Morning/afternoon angle
      shadowMapSize: 2048, // Good quality without performance hit
      shadowBias: -0.0005,
      shadowNormalBias: 0.03,
      shadowCameraSize: 400, // Large shadow coverage
    },
    hemisphere: {
      skyColor: 0xffeeb1, // Warm sky color
      groundColor: 0x8B7355, // Earthy ground reflection
      intensity: 0.7, // Good ambient fill
    },
    fill: {
      color: 0xf5e8d0,
      intensity: 0.25,
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
  // TERRAIN SHADER COLORS
  // ===================
  terrainColors: {
    // Mixed terrain - prominent brown/tan with green
    dirt: { r: 0.70, g: 0.55, b: 0.35 },         // Brown dirt base
    dirtPath: { r: 0.90, g: 0.75, b: 0.55 },     // VERY bright tan roads
    grass: { r: 0.50, g: 0.80, b: 0.40 },        // Vibrant grass
    darkGrass: { r: 0.40, g: 0.70, b: 0.35 },    // Rich grass
    forest: { r: 0.45, g: 0.75, b: 0.38 },       // Forest areas
    mud: { r: 0.42, g: 0.35, b: 0.28 },
    riverGrass: { r: 0.38, g: 0.62, b: 0.30 },
    warmTint: { r: 1.0, g: 0.98, b: 0.95 },
    foliage: { r: 0.35, g: 0.65, b: 0.28 },
    // Height-based terrain colors
    sand: { r: 0.85, g: 0.78, b: 0.60 },
    rock: { r: 0.45, g: 0.43, b: 0.42 },
    snow: { r: 0.95, g: 0.96, b: 0.98 },
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
    // Path generation - SUPER PROMINENT roads
    paths: {
      frequency1: { y: 0.0015, x: 0.001 }, // Long wide roads
      frequency2: { x: 0.002, y: 0.0008 },
      noiseScale1: 0.0005,
      noiseScale2: 0.001,
      noiseAmplitude1: 0.8,
      noiseAmplitude2: 0.6,
      width: { min: 0.15, max: 0.40 }, // MASSIVE roads - super visible
      strength: 1.0, // Maximum prominence
    },
    // Blending - LESS grass coverage, more dirt showing
    grassMask: {
      threshold1: { min: 0.4, max: 0.75 }, // Harder to get grass
      threshold2: { min: 0.35, max: 0.65 },
      contrast: 0.6,
      strength: 0.7, // Less grass overall
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
    // Height-based terrain blending (splatmap-like behavior)
    heightBlend: {
      // Beach/sand at low elevations
      beachMax: 5,
      beachBlend: 3,
      // Grass zone
      grassMin: 3,
      grassMax: 120,
      // Rock appears on steep slopes and high elevations
      rockSlopeThreshold: 0.5, // More aggressive - show rock on moderate slopes
      rockHeightMin: 80, // Start showing rock at this height
      // Snow at highest elevations
      snowMin: 150,
      snowBlend: 20,
    },
  },

  // ===================
  // TREES - DECIDUOUS
  // ===================
  deciduousTrees: {
    count: 800, // Denser like reference
    spreadFactor: 0.94,
    minRiverDistance: 6,
    scale: { min: 0.9, max: 1.5 }, // Bigger realistic trees
    // EZ-Tree configuration for realistic deciduous trees
    ezTree: {
      baseSeed: 12345,
      trunk: {
        length: 12,
        radius: 0.6,
      },
      branch: {
        levels: 4, // More branch complexity
        children: 5, // More branches
        angle: 32,
        length: 0.75,
        taper: 0.65,
        gnarliness: 0.25, // Subtle organic curves
      },
      leaves: {
        type: "Oak",
        count: 400, // Denser foliage
        size: 1.8,
        tint: 0x3a8040, // Natural forest green, less saturated
      },
      bark: {
        type: "Oak",
        tint: 0x4a3528, // Natural brown bark
      },
    },
  },

  // ===================
  // TREES - CONIFER/PINE
  // ===================
  cypressTrees: {
    count: 300, // Doubled for denser forests
    spreadFactor: 0.92, // Allow more clustering
    minRiverDistance: 15, // Closer to water
    scale: { min: 0.65, max: 1.2 }, // More size variation
    // EZ-Tree configuration for realistic conifer/pine trees
    ezTree: {
      baseSeed: 54321,
      trunk: {
        length: 18,
        radius: 0.5,
      },
      branch: {
        levels: 5, // Tall pine structure
        children: 7, // Many small branches
        angle: 50, // Wider spread
        length: 0.55,
        taper: 0.75,
        gnarliness: 0.05, // Straight conifer branches
      },
      leaves: {
        type: "Pine",
        count: 500, // Dense needles
        size: 1.4,
        tint: 0x2a6a40, // Dark pine green, more natural
      },
      bark: {
        type: "Pine",
        tint: 0x3a2820, // Darker brown bark
      },
    },
  },

  // ===================
  // BUSHES
  // ===================
  bushes: {
    count: 400, // Optimized for performance
    spreadFactor: 0.92,
    minRiverDistance: 6,
    scale: { min: 0.6, max: 1.2 },
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
    count: 800,
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
    count: 1500, // Optimized for performance
    spreadFactor: 0.94,
    minRiverDistance: 5,
    // Natural grass greens matching reference
    colors: [
      0x4a7a38, // Natural grass green
      0x3a6a30, // Medium forest green
      0x5a8a48, // Lighter grass
      0x3a7a35, // Rich olive green
      0x4a8040, // Fresh grass
      0x3d7332, // Dark grass
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
    // Procedural rocks - optimized
    procedural: {
      count: 80, // Optimized for performance
      spreadFromRiver: 120,
      scale: { min: 0.8, max: 1.5 },
      size: { min: 2, max: 4 }, // More realistic size
      colors: [0x7a7a80, 0x6a6a70, 0x808088, 0x707078],
      roughness: 0.9,
      metalness: 0.05,
    },
    // Boulder models
    boulders: {
      count: 40, // Optimized for performance
      spreadFromRiver: 150,
      scale: { min: 2, max: 6 }, // Realistic boulder size, not massive
    },
  },

  // ===================
  // RENDERING
  // ===================
  rendering: {
    antialias: true,
    pixelRatioMax: 2,
    toneMapping: "ACESFilmic", // Cinematic tone mapping
    toneMappingExposure: 1.0, // Natural exposure
    shadowMapType: "PCFSoft", // Soft realistic shadows
  },
};
