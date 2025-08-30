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
