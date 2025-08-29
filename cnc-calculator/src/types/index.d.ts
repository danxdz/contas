// Type definitions for CNC Pro Suite

export interface Position {
  x: number;
  y: number;
  z: number;
  a?: number;
  b?: number;
  c?: number;
}

export interface SimulationState {
  isPlaying: boolean;
  isPaused: boolean;
  currentLine: number;
  position: Position;
  feedRate: number;
  spindleSpeed: number;
  spindleOn: boolean;
  coolantOn: boolean;
  selectedTool: Tool | null;
  g43Active: boolean;
  activeOffset: string;
  g90Absolute: boolean;
  totalLines: number;
  elapsedTime: number;
  estimatedTime: number;
  toolAssembly?: ToolAssembly;
  speed: number;
}

export interface Tool {
  id: number;
  tNumber: string;
  name: string;
  diameter: number;
  flutes: number;
  type: string;
  material: string;
  coating: string;
  lengthOffset: number;
  wearOffset: number;
  holder: ToolHolder;
  stickout: number;
  cuttingLength: number;
  overallLength: number;
}

export interface ToolHolder {
  type: string;
  holderType: string;
  collet: string | null;
}

export interface ToolAssembly {
  id: string;
  name: string;
  components: {
    holder?: any;
    tool?: any;
    extensions?: any[];
  };
  totalLength: number;
  stickout: number;
}

export interface WorkOffset {
  x: number;
  y: number;
  z: number;
  description?: string;
}

export interface WorkOffsets {
  activeOffset: string;
  G54: WorkOffset;
  G55: WorkOffset;
  G56: WorkOffset;
  G57: WorkOffset;
  G58: WorkOffset;
  G59: WorkOffset;
}

export interface Panel {
  visible: boolean;
  minimized: boolean;
  docked: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export interface PanelState {
  [key: string]: Panel;
}

export interface SetupConfig {
  stock: {
    dimensions: { x: number; y: number; z: number };
    material: string;
    position: Position;
  };
  fixture: {
    type: string;
    jawWidth: number;
    clampingForce: number;
    position: Position;
  };
  part: {
    name: string;
    material: string;
    dimensions: { x: number; y: number; z: number };
    position: Position;
    rotation: Position;
  };
  machine: {
    type: string;
    travels: { x: number; y: number; z: number };
    spindleSpeed: { min: number; max: number };
    rapidFeedRate: number;
    toolCapacity: number;
  };
  workOffsets: WorkOffsets;
}

export interface Project {
  name: string;
  gcode: {
    channel1: string;
    channel2?: string;
  };
  created?: Date;
  modified?: Date;
  settings?: any;
}

export interface AppState {
  simulation: SimulationState;
  panels: PanelState;
  setupConfig: SetupConfig;
  ui: {
    isMobile: boolean;
    mobileMenuOpen: boolean;
    activeMobilePanel: string | null;
    bottomSheetOpen: boolean;
  };
  features: {
    materialRemoval: boolean;
    collisionDetection: boolean;
    collisionStopOnHit: boolean;
    collisionCount: number;
    collisionHistory: any[];
  };
  project: Project;
  toolDatabase: Tool[];
  toolAssemblies: ToolAssembly[];
  toolOffsetTable: {
    H: Array<{ register: number; lengthGeometry: number; lengthWear: number }>;
    D: Array<{ register: number; diameterGeometry: number; diameterWear: number }>;
  };
  activePanelId: string | null;
}

export interface ErrorState {
  message: string;
  details?: string;
  original?: Error;
}

export interface LightConfig {
  ambient: {
    enabled: boolean;
    intensity: number;
    color: string;
  };
  directional1: {
    enabled: boolean;
    intensity: number;
    color: string;
    position: Position;
    castShadow: boolean;
  };
  directional2: {
    enabled: boolean;
    intensity: number;
    color: string;
    position: Position;
    castShadow: boolean;
  };
  spot1: {
    enabled: boolean;
    intensity: number;
    color: string;
    position: Position;
    angle: number;
    penumbra: number;
    castShadow: boolean;
  };
  hemisphere: {
    enabled: boolean;
    skyColor: string;
    groundColor: string;
    intensity: number;
  };
}