// Machine Module Version
// Update this with each significant change
export const MACHINE_MODULE_VERSION = 'v0.006';

// Version History
export const VERSION_HISTORY = [
  {
    version: 'v0.006',
    date: '2024-12-30',
    changes: [
      'Added commit-with-version.sh script',
      'Updated documentation for version in commit messages',
      'Established version commit format [vX.XXX]'
    ]
  },
  {
    version: 'v0.005',
    date: '2024-12-30',
    changes: [
      'Fixed panel styling to match CNC Studio design',
      'Removed custom backgrounds and borders',
      'Consistent gap spacing (8px)',
      'Standard label/input structure',
      'Inline version display',
      'Cleaner saved machines list'
    ]
  },
  {
    version: 'v0.004',
    date: '2024-12-30',
    changes: [
      'Rotated machine 180° so back faces Y+',
      'Removed "Connected to viewer" status indicator',
      'Fixed white square issue (added proper background)',
      'Added save/load custom machine configurations',
      'Implemented 4-axis mill with rotary table',
      'Implemented 5-axis mill with trunnion table',
      'Implemented lathe with chuck and tailstock',
      'Added saved machines list with localStorage'
    ]
  },
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