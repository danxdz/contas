import React, { useState, useEffect } from 'react';
import './AppPro.css';

// Basic Calculators
import ThreadCalculator from './components/ThreadCalculator';
import TrigonometryCalculator from './components/TrigonometryCalculator';
import CuttingSpeedCalculator from './components/CuttingSpeedCalculator';
import FaceMillingCalculator from './components/FaceMillingCalculator';
import VariousTools from './components/VariousTools';

// Advanced Modules
import {
  ToolLifeCalculator,
  CircularInterpolation,
  PowerTorqueCalculator,
  GeometryTools,
  PocketMillingWizard,
  FeedsSpeedsOptimizer,
  ToolDatabase,
  GCodeVisualizer,
  GCodeSimulator,
  ProfessionalSimulator,
  ShopFloorUtilities
} from './components/modules/index.jsx';

// Module Categories
const moduleCategories = {
  calculators: {
    name: 'Calculators',
    icon: '🧮',
    modules: [
      { id: 'speed', name: 'Speeds & Feeds', component: CuttingSpeedCalculator, icon: '⚡' },
      { id: 'thread', name: 'Thread', component: ThreadCalculator, icon: '🔩' },
      { id: 'trig', name: 'Trigonometry', component: TrigonometryCalculator, icon: '📐' },
      { id: 'face', name: 'Face Milling', component: FaceMillingCalculator, icon: '🔧' },
      { id: 'power', name: 'Power & Torque', component: PowerTorqueCalculator, icon: '💪' },
      { id: 'toollife', name: 'Tool Life', component: ToolLifeCalculator, icon: '⏱️' },
    ]
  },
  tooling: {
    name: 'Tooling',
    icon: '🛠️',
    modules: [
      { id: 'database', name: 'Tool Database', component: ToolDatabase, icon: '🗄️' },
      { id: 'optimize', name: 'Optimization', component: FeedsSpeedsOptimizer, icon: '📈' },
      { id: 'tools', name: 'Tool Utilities', component: VariousTools, icon: '🔨' },
    ]
  },
  programming: {
    name: 'Programming',
    icon: '💻',
    modules: [
      { id: 'circular', name: 'Circular Interpolation', component: CircularInterpolation, icon: '🔄' },
      { id: 'geometry', name: 'Geometry', component: GeometryTools, icon: '📏' },
      { id: 'pocket', name: 'Pocket Milling', component: PocketMillingWizard, icon: '📦' },
    ]
  },
  simulation: {
    name: 'CAM/Simulation',
    icon: '🎬',
    modules: [
      { id: 'cam', name: 'Professional CAM', component: ProfessionalSimulator, icon: '🏆' },
      { id: 'visualizer', name: 'G-Code Viewer', component: GCodeVisualizer, icon: '👁️' },
      { id: 'simulator', name: 'Simulator', component: GCodeSimulator, icon: '🚀' },
    ]
  },
  production: {
    name: 'Production',
    icon: '🏭',
    modules: [
      { id: 'shopfloor', name: 'Shop Floor', component: ShopFloorUtilities, icon: '⚙️' },
    ]
  }
};

function AppPro() {
  const [activeCategory, setActiveCategory] = useState('calculators');
  const [activeModule, setActiveModule] = useState('speed');
  const [darkMode, setDarkMode] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [toolDatabase, setToolDatabase] = useState([]);

  // Load preferences and tool database
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedCategory = localStorage.getItem('activeCategory') || 'calculators';
    const savedModule = localStorage.getItem('activeModule') || 'speed';
    const savedTools = localStorage.getItem('cncToolDatabase');
    
    setDarkMode(savedDarkMode);
    setActiveCategory(savedCategory);
    setActiveModule(savedModule);
    
    if (savedDarkMode) {
      document.body.classList.add('dark-mode');
    }
    
    // Load or initialize tool database
    if (savedTools) {
      setToolDatabase(JSON.parse(savedTools));
    } else {
      initializeToolDatabase();
    }
  }, []);

  // Initialize tool database with professional tools
  const initializeToolDatabase = () => {
    const defaultTools = [
      // End Mills
      {
        id: 'EM001',
        tNumber: 'T1',
        name: '1/2" 4FL Carbide End Mill',
        type: 'endmill',
        diameter: 12.7,
        flutes: 4,
        material: 'carbide',
        coating: 'AlTiN',
        manufacturer: 'Sandvik',
        partNumber: 'R216.24-12050',
        fluteLength: 30,
        overallLength: 75,
        rpm: { aluminum: 8000, steel: 3000, stainless: 2000 },
        feed: { aluminum: 0.15, steel: 0.08, stainless: 0.05 }
      },
      {
        id: 'EM002',
        tNumber: 'T2',
        name: '1/4" 2FL Carbide End Mill',
        type: 'endmill',
        diameter: 6.35,
        flutes: 2,
        material: 'carbide',
        coating: 'TiAlN',
        manufacturer: 'Kennametal',
        partNumber: 'KC730M',
        fluteLength: 20,
        overallLength: 50,
        rpm: { aluminum: 12000, steel: 4500, stainless: 3000 },
        feed: { aluminum: 0.12, steel: 0.06, stainless: 0.04 }
      },
      {
        id: 'EM003',
        tNumber: 'T3',
        name: '3/8" 3FL Aluminum End Mill',
        type: 'endmill',
        diameter: 9.525,
        flutes: 3,
        material: 'carbide',
        coating: 'ZrN',
        manufacturer: 'OSG',
        partNumber: 'VGM3-0375',
        fluteLength: 25,
        overallLength: 65,
        rpm: { aluminum: 10000, steel: 0, stainless: 0 },
        feed: { aluminum: 0.18, steel: 0, stainless: 0 }
      },
      // Drills
      {
        id: 'DR001',
        tNumber: 'T4',
        name: '10mm Carbide Drill',
        type: 'drill',
        diameter: 10,
        flutes: 2,
        material: 'carbide',
        coating: 'TiN',
        manufacturer: 'Mitsubishi',
        partNumber: 'MWS1000',
        fluteLength: 40,
        overallLength: 90,
        rpm: { aluminum: 3000, steel: 1200, stainless: 800 },
        feed: { aluminum: 0.25, steel: 0.15, stainless: 0.10 }
      },
      {
        id: 'DR002',
        tNumber: 'T5',
        name: '6mm Carbide Drill',
        type: 'drill',
        diameter: 6,
        flutes: 2,
        material: 'carbide',
        coating: 'AlCrN',
        manufacturer: 'Guhring',
        partNumber: '5512-6.000',
        fluteLength: 30,
        overallLength: 70,
        rpm: { aluminum: 5000, steel: 2000, stainless: 1300 },
        feed: { aluminum: 0.20, steel: 0.12, stainless: 0.08 }
      },
      // Face Mills
      {
        id: 'FM001',
        tNumber: 'T6',
        name: '2" Face Mill',
        type: 'facemill',
        diameter: 50,
        flutes: 5,
        material: 'carbide',
        coating: 'PVD',
        manufacturer: 'Iscar',
        partNumber: 'F45NM D050',
        fluteLength: 0,
        overallLength: 40,
        rpm: { aluminum: 2500, steel: 1000, stainless: 700 },
        feed: { aluminum: 0.20, steel: 0.12, stainless: 0.08 }
      },
      // Taps
      {
        id: 'TP001',
        tNumber: 'T7',
        name: 'M8x1.25 Spiral Tap',
        type: 'tap',
        diameter: 8,
        flutes: 3,
        material: 'HSS',
        coating: 'TiCN',
        manufacturer: 'Emuge',
        partNumber: 'CE081250',
        fluteLength: 20,
        overallLength: 80,
        rpm: { aluminum: 800, steel: 400, stainless: 250 },
        feed: { aluminum: 1.25, steel: 1.25, stainless: 1.25 }
      },
      // Reamers
      {
        id: 'RM001',
        tNumber: 'T8',
        name: '8mm Carbide Reamer',
        type: 'reamer',
        diameter: 8,
        flutes: 6,
        material: 'carbide',
        coating: 'Diamond',
        manufacturer: 'Mapal',
        partNumber: 'C4-8.0',
        fluteLength: 35,
        overallLength: 85,
        rpm: { aluminum: 1200, steel: 600, stainless: 400 },
        feed: { aluminum: 0.30, steel: 0.20, stainless: 0.15 }
      },
      // Ball End Mills
      {
        id: 'BM001',
        tNumber: 'T9',
        name: '10mm Ball End Mill',
        type: 'ballmill',
        diameter: 10,
        flutes: 2,
        material: 'carbide',
        coating: 'AlTiN',
        manufacturer: 'Seco',
        partNumber: 'JH730100',
        fluteLength: 20,
        overallLength: 60,
        rpm: { aluminum: 6000, steel: 2500, stainless: 1800 },
        feed: { aluminum: 0.10, steel: 0.06, stainless: 0.04 }
      },
      // Chamfer Mills
      {
        id: 'CM001',
        tNumber: 'T10',
        name: '90° Chamfer Mill',
        type: 'chamfer',
        diameter: 12,
        flutes: 4,
        material: 'carbide',
        coating: 'TiAlN',
        manufacturer: 'Harvey',
        partNumber: '72540',
        fluteLength: 15,
        overallLength: 60,
        rpm: { aluminum: 5000, steel: 2000, stainless: 1500 },
        feed: { aluminum: 0.08, steel: 0.05, stainless: 0.03 }
      }
    ];
    
    localStorage.setItem('cncToolDatabase', JSON.stringify(defaultTools));
    setToolDatabase(defaultTools);
  };

  // Save preferences
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    localStorage.setItem('activeCategory', activeCategory);
    localStorage.setItem('activeModule', activeModule);
  }, [darkMode, activeCategory, activeModule]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode');
  };

  // Get current component
  const getCurrentComponent = () => {
    const category = moduleCategories[activeCategory];
    if (!category) return null;
    
    const module = category.modules.find(m => m.id === activeModule);
    if (!module) return null;
    
    const Component = module.component;
    
    // Pass tool database to CAM simulator
    if (module.id === 'cam' || module.id === 'simulator' || module.id === 'visualizer') {
      return <Component toolDatabase={toolDatabase} onToolSelect={(tool) => console.log('Selected tool:', tool)} />;
    }
    
    // Pass database management to Tool Database component
    if (module.id === 'database') {
      return <Component 
        tools={toolDatabase} 
        onUpdate={(newTools) => {
          setToolDatabase(newTools);
          localStorage.setItem('cncToolDatabase', JSON.stringify(newTools));
        }} 
      />;
    }
    
    return <Component />;
  };

  const currentModule = moduleCategories[activeCategory]?.modules.find(m => m.id === activeModule);

  return (
    <div className={`app-pro ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="app-header">
        <div className="header-brand">
          <button 
            className="mobile-menu-toggle"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            ☰
          </button>
          <h1 className="app-title">
            <span className="title-icon">🏭</span>
            CNC Pro Suite
          </h1>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          {Object.entries(moduleCategories).map(([key, category]) => (
            <button
              key={key}
              className={`nav-button ${activeCategory === key ? 'active' : ''}`}
              onClick={() => {
                setActiveCategory(key);
                setActiveModule(category.modules[0].id);
              }}
            >
              <span className="nav-icon">{category.icon}</span>
              <span className="nav-label">{category.name}</span>
            </button>
          ))}
        </nav>
        
        <div className="header-actions">
          <button 
            className="theme-toggle"
            onClick={toggleDarkMode}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Mobile Navigation */}
      {showMobileMenu && (
        <div className="mobile-nav">
          {Object.entries(moduleCategories).map(([key, category]) => (
            <button
              key={key}
              className={`mobile-nav-button ${activeCategory === key ? 'active' : ''}`}
              onClick={() => {
                setActiveCategory(key);
                setActiveModule(category.modules[0].id);
                setShowMobileMenu(false);
              }}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Sub Navigation */}
      <div className="sub-nav">
        {moduleCategories[activeCategory]?.modules.map(module => (
          <button
            key={module.id}
            className={`sub-nav-button ${activeModule === module.id ? 'active' : ''}`}
            onClick={() => setActiveModule(module.id)}
          >
            <span className="module-icon">{module.icon}</span>
            <span className="module-name">{module.name}</span>
          </button>
        ))}
      </div>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-header">
          <h2 className="module-title">
            {currentModule?.icon} {currentModule?.name}
          </h2>
        </div>
        
        <div className="module-container">
          {getCurrentComponent()}
        </div>
      </main>
    </div>
  );
}

export default AppPro;