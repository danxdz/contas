export const meta = {
  id: 'viewer',
  name: 'Viewer',
  area: 'center',
  order: 0,
  icon: '👁️',
};

export default function ViewerModule() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#0b1224', border: '1px dashed #17304d' }}>
      <div style={{ color: '#7fbaff' }}>3D Viewer Placeholder</div>
    </div>
  );
}

