import React, { useState, useEffect } from 'react';
import './App.css';

// Core Calculators
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

// Module Registry with categories
const moduleRegistry = {
  'Basic Calculators': [
    { id: 'thread', name: 'Thread Calculator', icon: '🔩', component: ThreadCalculator },
    { id: 'trig', name: 'Trigonometry', icon: '📐', component: TrigonometryCalculator },
    { id: 'speed', name: 'Cutting Speed', icon: '⚡', component: CuttingSpeedCalculator },
    { id: 'face', name: 'Face Milling', icon: '🔧', component: FaceMillingCalculator },
    { id: 'tools', name: 'Various Tools', icon: '🛠️', component: VariousTools },
  ],
  'Advanced Tools': [
    { id: 'toollife', name: 'Tool Life & Cost', icon: '💰', component: ToolLifeCalculator },
    { id: 'circular', name: 'Circular/Helical', icon: '🔄', component: CircularInterpolation },
    { id: 'power', name: 'Power & Torque', icon: '💪', component: PowerTorqueCalculator },
    { id: 'geometry', name: 'Geometry Tools', icon: '📏', component: GeometryTools },
    { id: 'pocket', name: 'Pocket Milling', icon: '📦', component: PocketMillingWizard },
  ],
  'Optimization': [
    { id: 'optimize', name: 'Feeds & Speeds', icon: '📈', component: FeedsSpeedsOptimizer },
    { id: 'database', name: 'Tool Database', icon: '🗄️', component: ToolDatabase },
  ],
  'Simulation': [
    { id: 'visualizer', name: 'G-Code Visualizer', icon: '🎬', component: GCodeVisualizer },
    { id: 'simulator', name: 'Advanced Simulator', icon: '🚀', component: GCodeSimulator },
    { id: 'professional', name: 'Professional CAM', icon: '🏆', component: ProfessionalSimulator },
  ],
  'Shop Management': [
    { id: 'shopfloor', name: 'Shop Floor Utils', icon: '🏭', component: ShopFloorUtilities },
  ]
};

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Always start with sidebar open
  const [selectedModule, setSelectedModule] = useState('thread');
  const [favoriteModules, setFavoriteModules] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(
    Object.keys(moduleRegistry).reduce((acc, cat) => ({ ...acc, [cat]: true }), {})
  );

  // Load preferences
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedFavorites = JSON.parse(localStorage.getItem('favoriteModules') || '[]');
    const savedModule = localStorage.getItem('selectedModule') || 'thread';
    
    setDarkMode(savedDarkMode);
    setFavoriteModules(savedFavorites);
    setSelectedModule(savedModule);
    
    if (savedDarkMode) {
      document.body.classList.add('dark-mode');
    }

    // Handle window resize
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save selected module
  useEffect(() => {
    localStorage.setItem('selectedModule', selectedModule);
  }, [selectedModule]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    document.body.classList.toggle('dark-mode');
  };

  const toggleFavorite = (moduleId) => {
    const newFavorites = favoriteModules.includes(moduleId)
      ? favoriteModules.filter(id => id !== moduleId)
      : [...favoriteModules, moduleId];
    
    setFavoriteModules(newFavorites);
    localStorage.setItem('favoriteModules', JSON.stringify(newFavorites));
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const selectModule = (moduleId) => {
    setSelectedModule(moduleId);
    // Auto-close sidebar on mobile after selection
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  // Get all modules flat
  const allModules = Object.values(moduleRegistry).flat();
  
  // Filter modules based on search
  const filteredRegistry = {};
  Object.entries(moduleRegistry).forEach(([category, modules]) => {
    const filtered = modules.filter(m => 
      m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      filteredRegistry[category] = filtered;
    }
  });

  // Get current module component
  const currentModule = allModules.find(m => m.id === selectedModule);
  const CurrentComponent = currentModule?.component || ThreadCalculator;

  // Create favorites category if any
  const displayRegistry = { ...filteredRegistry };
  if (favoriteModules.length > 0 && !searchTerm) {
    const favModules = allModules.filter(m => favoriteModules.includes(m.id));
    displayRegistry['⭐ Favorites'] = favModules;
    // Move favorites to top
    const reordered = { '⭐ Favorites': favModules, ...filteredRegistry };
    Object.keys(displayRegistry).forEach(key => delete displayRegistry[key]);
    Object.assign(displayRegistry, reordered);
  }

  return (
    <div className={`app-container ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <button 
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            <span className="hamburger">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
          <h1 className="app-title">
            <span className="title-icon">🏭</span>
            <span className="title-text">CNC Calculator Pro</span>
          </h1>
        </div>
        
        <div className="header-right">
          <button 
            className="theme-toggle"
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <div className="app-layout">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <input
              type="text"
              className="module-search"
              placeholder="Search modules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <nav className="sidebar-nav">
            {Object.entries(displayRegistry).map(([category, modules]) => (
              <div key={category} className="nav-category">
                <button
                  className="category-header"
                  onClick={() => toggleCategory(category)}
                >
                  <span className="category-title">{category}</span>
                  <span className="category-arrow">
                    {expandedCategories[category] ? '▼' : '▶'}
                  </span>
                </button>
                
                {expandedCategories[category] && (
                  <div className="category-modules">
                    {modules.map(module => (
                      <button
                        key={module.id}
                        className={`module-item ${selectedModule === module.id ? 'active' : ''}`}
                        onClick={() => selectModule(module.id)}
                      >
                        <span className="module-icon">{module.icon}</span>
                        <span className="module-name">{module.name}</span>
                        <button
                          className={`favorite-btn ${favoriteModules.includes(module.id) ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(module.id);
                          }}
                        >
                          {favoriteModules.includes(module.id) ? '⭐' : '☆'}
                        </button>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="sidebar-footer">
            <div className="app-info">
              <small>v2.0.0 | Made with ❤️</small>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <div className="content-header">
            <h2 className="module-title">
              <span>{currentModule?.icon}</span>
              <span>{currentModule?.name}</span>
            </h2>
          </div>

          <div className="module-container">
            <CurrentComponent />
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && window.innerWidth <= 768 && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default App;