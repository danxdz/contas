# Simple Machine Module (v0.002)

A practical, visual Machine module for CNC Studio that creates real 3D geometry in the scene.

## Features

### Real 3D Machine Components
- **Table**: With T-slots for workholding
- **Spindle**: Cylindrical spindle with tool holder
- **Frame**: Machine column and supports
- **Rails**: Linear motion guides
- **Base**: Machine foundation

### Simple Controls
- Machine type selection (3-axis, 4-axis, 5-axis, lathe)
- Table size adjustment (X, Y dimensions)
- Spindle height configuration
- Show/hide machine toggle
- Quick size presets (Small, Medium, Large)

## What It Creates in the Scene

The module generates actual THREE.js geometry:

```
Machine Group
├── Table (with T-slots)
├── Column (back frame)
├── Side Supports
├── Spindle Assembly
│   ├── Spindle Head
│   ├── Spindle
│   └── Tool Holder
├── Linear Rails (X/Y axes)
├── Way Covers
└── Base Platform
```

## Usage

1. Select machine type from dropdown
2. Adjust table size (X, Y in mm)
3. Set spindle height (Z in mm)
4. Use quick presets for common sizes
5. Toggle visibility with checkbox

## Integration

The module automatically:
- Creates geometry in the CNC viewer scene
- Updates when parameters change
- Provides references for other modules:
  - `window.cncViewer.machineGroup`
  - `window.cncViewer.table`
  - `window.cncViewer.spindle`

## Benefits

- **Visual**: See the actual machine in 3D
- **Simple**: Easy to understand and use
- **Practical**: Focuses on real geometry
- **Lightweight**: No complex state management
- **Immediate**: Changes appear instantly in scene

## Version Management

Current Version: **v0.006**

### Version History
- **v0.005** - Fixed panel styling to match CNC Studio design
- **v0.004** - Added 4-axis, 5-axis, lathe, save/load configs
- **v0.003** - Fixed Machine-Viewer integration
- **v0.002** - Fixed initialization, added status indicator
- **v0.001** - Initial simplified machine with real 3D geometry

### Committing with Version

#### Automatic (Recommended):
```bash
# From Machine module directory
./commit-with-version.sh "Your commit message"
# This will create: [v0.006] Your commit message
```

#### Manual:
```bash
# Update version first
node update-version.js "Your change description"
# Then commit with version in message
git commit -m "[v0.006] feat: Your feature description"
```

### Version Format
Always include version in commit messages:
- `[v0.XXX] type: description`
- Examples:
  - `[v0.006] feat: Add tool changer visualization`
  - `[v0.007] fix: Correct spindle rotation direction`

## Troubleshooting

If the machine doesn't appear:
1. Check that the Viewer module is loaded
2. Look for the status indicator (should show "✓ Connected to viewer")
3. Check browser console for errors
4. Try refreshing the page

## Future Enhancements

- Animate spindle rotation
- Add axis movement simulation
- Include tool changer visualization
- Add coolant nozzles
- Create different machine styles