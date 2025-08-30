// Machine Module Version
// Update this with each significant change
export const MACHINE_MODULE_VERSION = 'v0.003';

// Version History
export const VERSION_HISTORY = [
  {
    version: 'v0.003',
    date: '2024-12-30',
    changes: [
      'Fixed viewer connection issue',
      'Exposed scene, camera, renderer in window.cncViewer',
      'Remove default table and tool when Machine module loads',
      'Added proper integration between Viewer and Machine modules'
    ]
  },
  {
    version: 'v0.002',
    date: '2024-12-30',
    changes: [
      'Added version tracking',
      'Fixed initialization issues',
      'Added status indicator',
      'Improved error handling',
      'Added debug information'
    ]
  },
  {
    version: 'v0.001',
    date: '2024-12-30',
    changes: [
      'Initial simplified machine module',
      'Real 3D geometry creation',
      'Basic controls for table and spindle',
      'Quick size presets'
    ]
  }
];

export default MACHINE_MODULE_VERSION;