# CNC Studio (Modular, auto-discovered modules)

Modular CNC programming and verification shell. Modules are auto-discovered using Vite's `import.meta.glob`.

How to add a module:
- Create a folder under `src/modules/<ModuleName>/`
- Add an `index.jsx` that exports a default React component and optional `export const meta`:

```jsx
export const meta = { id: 'myModule', name: 'My Module', area: 'left', order: 10, icon: '🧩' };
export default function MyModule() { return <div>Content</div>; }
```

Areas: `left`, `right`, `bottom`, `center`. Panels can be minimized/maximized and toggled from the top bar.

Mobile: Uses flex layout with responsive breakpoints for ~4-inch screens; panels stack vertically.

## Units & Scale System

The CNC Studio uses a centralized units and scale management system:

- **Canonical Units**: All geometry inputs are in millimeters (mm) internally
- **World Scale**: MM values are converted to world units using a configurable scale factor (default: 0.01, meaning 1mm = 0.01 world units)
- **Inch Support**: Inches are converted to mm first (25.4mm per inch), then to world units
- **Display Units**: The UI can toggle between mm and inch display, but this only affects readouts - geometry scale remains consistent

### Key APIs

The system provides these utilities via `src/modules/shared/units.js`:
- `mmToWorld(mm)` - Convert millimeters to world units
- `worldToMm(world)` - Convert world units to millimeters  
- `inToMm(inches)` - Convert inches to millimeters
- `mmToIn(mm)` - Convert millimeters to inches
- `setWorldScale(scale)` - Update the world scale factor

The `UnitsContext` provider wraps the app and provides units state and converters to all components.

### Viewer API

The viewer exposes scale functions via `window.cncViewer`:
- `mmToWorld`, `worldToMm` - Conversion functions
- `getWorldScale`, `setWorldScale` - Scale management
- `onState(callback)` - Subscribe to state changes (returns unsubscribe function)
- `onTick(callback)` - Subscribe to line tick events (returns unsubscribe function)

Dev:
```bash
npm install
npm run dev
```

Build:
```bash
npm run build && npm run preview
```

Deploy to Netlify:

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/danxdz/contas&base=cnc-studio&build=npm%20run%20build&publish=dist)

This button deploys the `cnc-studio` subfolder.
