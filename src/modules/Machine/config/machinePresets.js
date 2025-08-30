export const machinePresets = {
  mill3axis: {
    id: 'mill3axis',
    name: '3-Axis Mill',
    type: 'Milling',
    icon: '🏭',
    axes: [
      {
        id: 'x_axis',
        name: 'X Axis',
        type: 'linear',
        parent: null,
        limits: { min: -200, max: 200 },
        homePosition: 0,
        currentPosition: 0,
        enabled: true
      },
      {
        id: 'y_axis',
        name: 'Y Axis',
        type: 'linear',
        parent: null,
        limits: { min: -150, max: 150 },
        homePosition: 0,
        currentPosition: 0,
        enabled: true
      },
      {
        id: 'z_axis',
        name: 'Z Axis',
        type: 'linear',
        parent: null,
        limits: { min: -100, max: 100 },
        homePosition: 100,
        currentPosition: 100,
        enabled: true
      }
    ],
    specifications: {
      workEnvelope: { x: 400, y: 300, z: 200 },
      spindleSpeed: { min: 100, max: 20000 },
      feedRate: { max: 10000 },
      rapidRate: { max: 30000 },
      toolCapacity: 20
    }
  },

  mill4axis: {
    id: 'mill4axis',
    name: '4-Axis Mill',
    type: 'Milling',
    icon: '⚙️',
    axes: [
      {
        id: 'x_axis',
        name: 'X Axis',
        type: 'linear',
        parent: null,
        limits: { min: -300, max: 300 },
        homePosition: 0,
        currentPosition: 0,
        enabled: true
      },
      {
        id: 'y_axis',
        name: 'Y Axis',
        type: 'linear',
        parent: null,
        limits: { min: -200, max: 200 },
        homePosition: 0,
        currentPosition: 0,
        enabled: true
      },
      {
        id: 'z_axis',
        name: 'Z Axis',
        type: 'linear',
        parent: null,
        limits: { min: -150, max: 150 },
        homePosition: 150,
        currentPosition: 150,
        enabled: true
      },
      {
        id: 'a_axis',
        name: 'A Axis',
        type: 'rotary',
        parent: null,
        limits: { min: -120, max: 120 },
        homePosition: 0,
        currentPosition: 0,
        enabled: true
      }
    ],
    specifications: {
      workEnvelope: { x: 600, y: 400, z: 300 },
      spindleSpeed: { min: 100, max: 24000 },
      feedRate: { max: 15000 },
      rapidRate: { max: 40000 },
      toolCapacity: 30
    }
  },

  mill5axis: {
    id: 'mill5axis',
    name: '5-Axis Mill',
    type: 'Milling',
    icon: '🔧',
    axes: [
      {
        id: 'x_axis',
        name: 'X Axis',
        type: 'linear',
        parent: null,
        limits: { min: -400, max: 400 },
        homePosition: 0,
        currentPosition: 0,
        enabled: true
      },
      {
        id: 'y_axis',
        name: 'Y Axis',
        type: 'linear',
        parent: null,
        limits: { min: -300, max: 300 },
        homePosition: 0,
        currentPosition: 0,
        enabled: true
      },
      {
        id: 'z_axis',
        name: 'Z Axis',
        type: 'linear',
        parent: null,
        limits: { min: -200, max: 200 },
        homePosition: 200,
        currentPosition: 200,
        enabled: true
      },
      {
        id: 'a_axis',
        name: 'A Axis',
        type: 'rotary',
        parent: null,
        limits: { min: -120, max: 120 },
        homePosition: 0,
        currentPosition: 0,
        enabled: true
      },
      {
        id: 'c_axis',
        name: 'C Axis',
        type: 'rotary',
        parent: null,
        limits: { min: -360, max: 360 },
        homePosition: 0,
        currentPosition: 0,
        enabled: true
      }
    ],
    specifications: {
      workEnvelope: { x: 800, y: 600, z: 400 },
      spindleSpeed: { min: 100, max: 30000 },
      feedRate: { max: 20000 },
      rapidRate: { max: 50000 },
      toolCapacity: 40
    }
  },

  lathe2axis: {
    id: 'lathe2axis',
    name: '2-Axis Lathe',
    type: 'Turning',
    icon: '🔄',
    axes: [
      {
        id: 'x_axis',
        name: 'X Axis (Diameter)',
        type: 'linear',
        parent: null,
        limits: { min: 0, max: 200 },
        homePosition: 200,
        currentPosition: 200,
        enabled: true
      },
      {
        id: 'z_axis',
        name: 'Z Axis (Length)',
        type: 'linear',
        parent: null,
        limits: { min: -500, max: 0 },
        homePosition: 0,
        currentPosition: 0,
        enabled: true
      }
    ],
    specifications: {
      workEnvelope: { x: 200, z: 500 },
      spindleSpeed: { min: 50, max: 4000 },
      feedRate: { max: 5000 },
      rapidRate: { max: 15000 },
      toolCapacity: 12,
      maxDiameter: 400,
      maxLength: 500
    }
  },

  lathe4axis: {
    id: 'lathe4axis',
    name: 'Multi-Axis Lathe',
    type: 'Turning',
    icon: '⚡',
    axes: [
      {
        id: 'x_axis',
        name: 'X Axis (Diameter)',
        type: 'linear',
        parent: null,
        limits: { min: 0, max: 250 },
        homePosition: 250,
        currentPosition: 250,
        enabled: true
      },
      {
        id: 'z_axis',
        name: 'Z Axis (Length)',
        type: 'linear',
        parent: null,
        limits: { min: -600, max: 0 },
        homePosition: 0,
        currentPosition: 0,
        enabled: true
      },
      {
        id: 'c_axis',
        name: 'C Axis (Spindle)',
        type: 'rotary',
        parent: null,
        limits: { min: -360, max: 360 },
        homePosition: 0,
        currentPosition: 0,
        enabled: true
      },
      {
        id: 'y_axis',
        name: 'Y Axis (Live Tool)',
        type: 'linear',
        parent: null,
        limits: { min: -50, max: 50 },
        homePosition: 0,
        currentPosition: 0,
        enabled: true
      }
    ],
    specifications: {
      workEnvelope: { x: 250, y: 100, z: 600 },
      spindleSpeed: { min: 50, max: 6000 },
      feedRate: { max: 8000 },
      rapidRate: { max: 20000 },
      toolCapacity: 24,
      maxDiameter: 500,
      maxLength: 600,
      liveTooling: true
    }
  },

  router3axis: {
    id: 'router3axis',
    name: 'CNC Router',
    type: 'Routing',
    icon: '📐',
    axes: [
      {
        id: 'x_axis',
        name: 'X Axis',
        type: 'linear',
        parent: null,
        limits: { min: 0, max: 1200 },
        homePosition: 0,
        currentPosition: 0,
        enabled: true
      },
      {
        id: 'y_axis',
        name: 'Y Axis',
        type: 'linear',
        parent: null,
        limits: { min: 0, max: 800 },
        homePosition: 0,
        currentPosition: 0,
        enabled: true
      },
      {
        id: 'z_axis',
        name: 'Z Axis',
        type: 'linear',
        parent: null,
        limits: { min: -150, max: 0 },
        homePosition: 0,
        currentPosition: 0,
        enabled: true
      }
    ],
    specifications: {
      workEnvelope: { x: 1200, y: 800, z: 150 },
      spindleSpeed: { min: 1000, max: 24000 },
      feedRate: { max: 20000 },
      rapidRate: { max: 40000 },
      toolCapacity: 8,
      tableType: 'vacuum'
    }
  },

  plasma2axis: {
    id: 'plasma2axis',
    name: 'Plasma Cutter',
    type: 'Cutting',
    icon: '⚡',
    axes: [
      {
        id: 'x_axis',
        name: 'X Axis',
        type: 'linear',
        parent: null,
        limits: { min: 0, max: 2000 },
        homePosition: 0,
        currentPosition: 0,
        enabled: true
      },
      {
        id: 'y_axis',
        name: 'Y Axis',
        type: 'linear',
        parent: null,
        limits: { min: 0, max: 1000 },
        homePosition: 0,
        currentPosition: 0,
        enabled: true
      },
      {
        id: 'z_axis',
        name: 'Z Axis (Torch Height)',
        type: 'linear',
        parent: null,
        limits: { min: 0, max: 100 },
        homePosition: 50,
        currentPosition: 50,
        enabled: true
      }
    ],
    specifications: {
      workEnvelope: { x: 2000, y: 1000, z: 100 },
      feedRate: { max: 15000 },
      rapidRate: { max: 30000 },
      torchType: 'plasma',
      thcEnabled: true,
      maxThickness: 25
    }
  },

  laser3axis: {
    id: 'laser3axis',
    name: 'Laser Cutter',
    type: 'Cutting',
    icon: '💥',
    axes: [
      {
        id: 'x_axis',
        name: 'X Axis',
        type: 'linear',
        parent: null,
        limits: { min: 0, max: 600 },
        homePosition: 0,
        currentPosition: 0,
        enabled: true
      },
      {
        id: 'y_axis',
        name: 'Y Axis',
        type: 'linear',
        parent: null,
        limits: { min: 0, max: 400 },
        homePosition: 0,
        currentPosition: 0,
        enabled: true
      },
      {
        id: 'z_axis',
        name: 'Z Axis (Focus)',
        type: 'linear',
        parent: null,
        limits: { min: 0, max: 50 },
        homePosition: 25,
        currentPosition: 25,
        enabled: true
      }
    ],
    specifications: {
      workEnvelope: { x: 600, y: 400, z: 50 },
      laserPower: { min: 0, max: 100 },
      feedRate: { max: 30000 },
      rapidRate: { max: 50000 },
      laserType: 'CO2',
      wavelength: 10600,
      maxThickness: { wood: 10, acrylic: 15, metal: 0 }
    }
  }
};

export const getMachinePreset = (id) => machinePresets[id] || null;

export const getMachineTypes = () => {
  const types = new Set();
  Object.values(machinePresets).forEach(preset => {
    types.add(preset.type);
  });
  return Array.from(types);
};