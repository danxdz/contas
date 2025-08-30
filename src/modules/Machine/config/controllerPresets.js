export const controllerPresets = {
  fanuc0i: {
    id: 'fanuc0i',
    name: 'Fanuc 0i',
    manufacturer: 'Fanuc',
    model: '0i-MF',
    protocol: 'RS232',
    defaultParams: {
      baudRate: 9600,
      dataBits: 8,
      stopBits: 2,
      parity: 'even',
      enableMacros: true,
      enableSubprograms: true,
      enableToolCompensation: true,
      bufferSize: 128,
      timeout: 5000,
      gcodePrefix: 'O',
      gcodeSuffix: 'M30'
    },
    features: [
      'High-speed machining',
      'Advanced look-ahead',
      'Nano interpolation',
      'AI contour control',
      'Custom macro B'
    ]
  },

  fanuc30i: {
    id: 'fanuc30i',
    name: 'Fanuc 30i',
    manufacturer: 'Fanuc',
    model: '30i-B',
    protocol: 'Ethernet',
    defaultParams: {
      baudRate: 115200,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      enableMacros: true,
      enableSubprograms: true,
      enableToolCompensation: true,
      bufferSize: 256,
      timeout: 3000,
      gcodePrefix: 'O',
      gcodeSuffix: 'M30'
    },
    features: [
      '5-axis simultaneous control',
      'High-speed smooth TCP',
      'Advanced preview control',
      'Collision detection',
      'Energy monitoring'
    ]
  },

  siemens828d: {
    id: 'siemens828d',
    name: 'Sinumerik 828D',
    manufacturer: 'Siemens',
    model: '828D',
    protocol: 'Ethernet',
    defaultParams: {
      baudRate: 115200,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      enableMacros: true,
      enableSubprograms: true,
      enableToolCompensation: true,
      bufferSize: 128,
      timeout: 5000,
      gcodePrefix: '%',
      gcodeSuffix: 'M30'
    },
    features: [
      'ShopMill/ShopTurn',
      'Animated elements',
      'Graphical programming',
      'Tool management',
      'Integrated safety'
    ]
  },

  siemens840d: {
    id: 'siemens840d',
    name: 'Sinumerik 840D sl',
    manufacturer: 'Siemens',
    model: '840D sl',
    protocol: 'Profinet',
    defaultParams: {
      baudRate: 115200,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      enableMacros: true,
      enableSubprograms: true,
      enableToolCompensation: true,
      bufferSize: 512,
      timeout: 3000,
      gcodePrefix: '%',
      gcodeSuffix: 'M30'
    },
    features: [
      'Advanced surface quality',
      'Top surface',
      'Synchronized actions',
      'Compile cycles',
      'Virtual machine'
    ]
  },

  heidenhainTNC640: {
    id: 'heidenhainTNC640',
    name: 'TNC 640',
    manufacturer: 'Heidenhain',
    model: 'TNC 640',
    protocol: 'Ethernet',
    defaultParams: {
      baudRate: 115200,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      enableMacros: false,
      enableSubprograms: true,
      enableToolCompensation: true,
      bufferSize: 256,
      timeout: 4000,
      gcodePrefix: 'BEGIN PGM',
      gcodeSuffix: 'END PGM'
    },
    features: [
      'Conversational programming',
      'Dynamic collision monitoring',
      'Adaptive feed control',
      'KinematicsOpt',
      'Connected Machining'
    ]
  },

  haasNGC: {
    id: 'haasNGC',
    name: 'Haas NGC',
    manufacturer: 'Haas',
    model: 'Next Generation Control',
    protocol: 'Ethernet',
    defaultParams: {
      baudRate: 115200,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      enableMacros: true,
      enableSubprograms: true,
      enableToolCompensation: true,
      bufferSize: 128,
      timeout: 5000,
      gcodePrefix: 'O',
      gcodeSuffix: 'M30'
    },
    features: [
      'Intuitive programming',
      'Visual quick code',
      'Wireless intuitive probing',
      'Tool load monitoring',
      'Remote monitoring'
    ]
  },

  mazatrol: {
    id: 'mazatrol',
    name: 'Mazatrol SmoothX',
    manufacturer: 'Mazak',
    model: 'SmoothX',
    protocol: 'Ethernet',
    defaultParams: {
      baudRate: 115200,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      enableMacros: true,
      enableSubprograms: true,
      enableToolCompensation: true,
      bufferSize: 256,
      timeout: 4000,
      gcodePrefix: 'O',
      gcodeSuffix: 'M30'
    },
    features: [
      'Conversational programming',
      'Intelligent machining',
      'Smooth technology',
      'Multi-tasking support',
      'Voice guidance'
    ]
  },

  okuma: {
    id: 'okuma',
    name: 'OSP-P300',
    manufacturer: 'Okuma',
    model: 'OSP-P300',
    protocol: 'Ethernet',
    defaultParams: {
      baudRate: 115200,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      enableMacros: true,
      enableSubprograms: true,
      enableToolCompensation: true,
      bufferSize: 256,
      timeout: 4000,
      gcodePrefix: 'O',
      gcodeSuffix: 'M30'
    },
    features: [
      'Thermo-friendly concept',
      'Collision avoidance',
      'Super-NURBS',
      'Machining navi',
      'Advanced one-touch IGF'
    ]
  },

  mitsubishi: {
    id: 'mitsubishi',
    name: 'M800/M80',
    manufacturer: 'Mitsubishi',
    model: 'M800/M80',
    protocol: 'Ethernet',
    defaultParams: {
      baudRate: 115200,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      enableMacros: true,
      enableSubprograms: true,
      enableToolCompensation: true,
      bufferSize: 128,
      timeout: 5000,
      gcodePrefix: 'O',
      gcodeSuffix: 'M30'
    },
    features: [
      'High-speed high-accuracy',
      'Smart manufacturing',
      'Interactive programming',
      'Energy saving',
      'Predictive maintenance'
    ]
  },

  grbl: {
    id: 'grbl',
    name: 'GRBL',
    manufacturer: 'Open Source',
    model: 'v1.1',
    protocol: 'USB Serial',
    defaultParams: {
      baudRate: 115200,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      enableMacros: false,
      enableSubprograms: false,
      enableToolCompensation: false,
      bufferSize: 32,
      timeout: 10000,
      gcodePrefix: '',
      gcodeSuffix: ''
    },
    features: [
      'Real-time control',
      'Acceleration management',
      'Arc support',
      'Spindle/laser control',
      'Limit switches'
    ]
  },

  linuxcnc: {
    id: 'linuxcnc',
    name: 'LinuxCNC',
    manufacturer: 'Open Source',
    model: '2.8',
    protocol: 'Parallel/Ethernet',
    defaultParams: {
      baudRate: 115200,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      enableMacros: true,
      enableSubprograms: true,
      enableToolCompensation: true,
      bufferSize: 256,
      timeout: 5000,
      gcodePrefix: '%',
      gcodeSuffix: 'M2'
    },
    features: [
      'Real-time kernel',
      'Custom kinematics',
      'Ladder logic',
      'Python scripting',
      'HAL configuration'
    ]
  },

  mach4: {
    id: 'mach4',
    name: 'Mach4',
    manufacturer: 'Newfangled Solutions',
    model: 'Industrial',
    protocol: 'Ethernet',
    defaultParams: {
      baudRate: 115200,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      enableMacros: true,
      enableSubprograms: true,
      enableToolCompensation: true,
      bufferSize: 128,
      timeout: 5000,
      gcodePrefix: '',
      gcodeSuffix: 'M30'
    },
    features: [
      'Modular architecture',
      'Lua scripting',
      'Screen designer',
      'Industrial features',
      'Plugin support'
    ]
  }
};

export const getControllerPreset = (id) => controllerPresets[id] || null;

export const getControllersByManufacturer = () => {
  const grouped = {};
  Object.values(controllerPresets).forEach(controller => {
    if (!grouped[controller.manufacturer]) {
      grouped[controller.manufacturer] = [];
    }
    grouped[controller.manufacturer].push(controller);
  });
  return grouped;
};