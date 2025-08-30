# Enhanced Machine Module for CNC Studio

## Overview

The Enhanced Machine Module provides a comprehensive system for configuring and managing CNC machine setups in CNC Studio. It features a modular architecture with support for various machine types, axis configurations, controller settings, and preset management.

## Features

### 1. **Machine Selection & Configuration**
- **Preset Machines**: Pre-configured machines including:
  - 3-Axis Mill
  - 4-Axis Mill
  - 5-Axis Mill
  - 2-Axis Lathe
  - Multi-Axis Lathe
  - CNC Router
  - Plasma Cutter
  - Laser Cutter
- **Custom Machines**: Create custom machine configurations from scratch
- **Specifications Management**: Configure work envelope, spindle speeds, feed rates, and tool capacity

### 2. **Axis Tree Configuration**
- **Hierarchical Axis Structure**: Visual tree representation of machine axes
- **Axis Types**: Support for both linear and rotary axes
- **Parent-Child Relationships**: Define complex kinematic chains
- **Axis Properties**:
  - Movement limits (min/max)
  - Home positions
  - Current positions
  - Enable/disable states
- **Interactive Editing**: Click to edit axis names and properties
- **Dynamic Management**: Add, remove, and reorganize axes on the fly

### 3. **Controller Configuration**
- **Extensive Controller Library**:
  - Fanuc (0i, 30i series)
  - Siemens (Sinumerik 828D, 840D sl)
  - Heidenhain (TNC 640)
  - Haas (NGC)
  - Mazak (Mazatrol SmoothX)
  - Okuma (OSP-P300)
  - Mitsubishi (M800/M80)
  - Open Source (GRBL, LinuxCNC, Mach4)
- **Communication Settings**: Baud rate, data bits, stop bits, parity
- **Advanced Parameters**:
  - Macro support
  - Subprogram handling
  - Tool compensation
  - Buffer sizes
  - Timeout settings
  - Custom G-code prefixes/suffixes

### 4. **Preset Management**
- **Save Configurations**: Store current machine setup as a named preset
- **Load Presets**: Quickly switch between saved configurations
- **Export/Import**: Share configurations via JSON files
- **Persistent Storage**: All settings saved to browser localStorage
- **Preset Metadata**: Track creation dates and configuration details

## Architecture

```
src/modules/Machine/
├── components/
│   ├── MachineSelector.jsx    # Machine type selection UI
│   ├── AxisTree.jsx           # Hierarchical axis configuration
│   ├── ControllerConfig.jsx   # Controller settings management
│   └── MachinePresets.jsx     # Preset save/load functionality
├── config/
│   ├── machinePresets.js      # Pre-defined machine configurations
│   └── controllerPresets.js   # Controller specifications
├── hooks/
│   └── useMachineState.js     # State management and persistence
├── MachineModule.jsx           # Main module component
├── index.jsx                   # Module export
└── README.md                   # This file
```

## Component Details

### MachineSelector
Provides an intuitive interface for selecting from preset machines or creating custom configurations. Features a grid layout with visual icons and quick specifications overview.

### AxisTree
Interactive tree component for managing machine axes:
- Expandable/collapsible nodes
- Inline editing of axis names
- Drag-and-drop reordering (future enhancement)
- Visual indicators for axis types (linear/rotary)

### ControllerConfig
Comprehensive controller setup with:
- Manufacturer-grouped controller selection
- Protocol-specific settings
- Advanced parameter configuration
- Feature capability display

### MachinePresets
Complete preset management system:
- Save current configuration with custom names
- Load saved presets instantly
- Export to JSON for backup or sharing
- Import configurations from other users

## State Management

The module uses a custom hook (`useMachineState`) that provides:
- Centralized state management
- Automatic persistence to localStorage
- Integration with the CNC viewer component
- Undo/redo capability (future enhancement)

## Data Format

Machine configurations are stored as JSON objects:

```javascript
{
  id: "mill3axis",
  name: "3-Axis Mill",
  type: "Milling",
  axes: [
    {
      id: "x_axis",
      name: "X Axis",
      type: "linear",
      parent: null,
      limits: { min: -200, max: 200 },
      homePosition: 0,
      currentPosition: 0,
      enabled: true
    }
    // ... more axes
  ],
  controller: {
    id: "fanuc0i",
    name: "Fanuc 0i",
    manufacturer: "Fanuc",
    protocol: "RS232",
    customParams: {
      baudRate: 9600,
      dataBits: 8,
      // ... more parameters
    }
  },
  specifications: {
    workEnvelope: { x: 400, y: 300, z: 200 },
    spindleSpeed: { min: 100, max: 20000 },
    feedRate: { max: 10000 },
    rapidRate: { max: 30000 },
    toolCapacity: 20
  }
}
```

## Usage

1. **Select a Machine Type**: Choose from presets or create custom
2. **Configure Axes**: Use the Axes Setup tab to define machine kinematics
3. **Set Controller**: Select and configure the CNC controller
4. **Save Configuration**: Store your setup as a preset for future use
5. **Export/Import**: Share configurations with team members

## Future Enhancements

- [ ] Visual 3D preview of machine configuration
- [ ] Kinematic simulation
- [ ] Collision detection zones
- [ ] Tool changer configuration
- [ ] Work coordinate system management
- [ ] Machine-specific G-code validation
- [ ] Integration with CAM post-processors
- [ ] Real-time machine monitoring interface
- [ ] Multi-language support
- [ ] Cloud sync for configurations

## Integration

The module integrates with the CNC Studio viewer through the global `window.cncViewer` object, automatically updating:
- Table dimensions
- Spindle home position
- Axis limits and positions

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires localStorage support for persistence.

## Contributing

To add new machine presets or controller configurations:
1. Edit `config/machinePresets.js` or `config/controllerPresets.js`
2. Follow the existing data structure
3. Test the configuration thoroughly
4. Submit a pull request with details

## License

Part of CNC Studio - see main project license.