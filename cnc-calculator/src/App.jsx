import React, { useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

// Core Calculators
import ThreadCalculator from './components/ThreadCalculator';
import TrigonometryCalculator from './components/TrigonometryCalculator';
import CuttingSpeedCalculator from './components/CuttingSpeedCalculator';
import FaceMillingCalculator from './components/FaceMillingCalculator';
import VariousTools from './components/VariousTools';

// New Advanced Modules
import {
  ToolLifeCalculator,
  CircularInterpolation,
  PowerTorqueCalculator,
  GeometryTools,
  PocketMillingWizard,
  FeedsSpeedsOptimizer,
  ToolDatabase,
  GCodeVisualizer,
  ShopFloorUtilities
} from './components/modules/index.jsx';

// Module Registry for easy expansion
const moduleRegistry = {
  core: [
    { id: 'thread', name: '🔩 Threads', component: ThreadCalculator },
    { id: 'trig', name: '📐 Trigonometry', component: TrigonometryCalculator },
    { id: 'speed', name: '⚡ Cutting Speed', component: CuttingSpeedCalculator },
    { id: 'face', name: '🔧 Face Milling', component: FaceMillingCalculator },
    { id: 'tools', name: '🛠️ Various Tools', component: VariousTools },
  ],
  advanced: [
    { id: 'toollife', name: '💰 Tool Life', component: ToolLifeCalculator },
    { id: 'circular', name: '🔄 Circular/Helical', component: CircularInterpolation },
    { id: 'power', name: '💪 Power/Torque', component: PowerTorqueCalculator },
    { id: 'geometry', name: '📏 Geometry', component: GeometryTools },
    { id: 'pocket', name: '📦 Pocket Milling', component: PocketMillingWizard },
    { id: 'optimize', name: '📈 Optimizer', component: FeedsSpeedsOptimizer },
    { id: 'database', name: '🗄️ Tool DB', component: ToolDatabase },
    { id: 'visualizer', name: '🎬 G-Code Viz', component: GCodeVisualizer },
    { id: 'shopfloor', name: '🏭 Shop Floor', component: ShopFloorUtilities },
  ]
};

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [favoriteModules, setFavoriteModules] = useState([]);

  // Load preferences from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedFavorites = JSON.parse(localStorage.getItem('favoriteModules') || '[]');
    setDarkMode(savedDarkMode);
    setFavoriteModules(savedFavorites);
    
    if (savedDarkMode) {
      document.body.classList.add('dark-mode');
    }
  }, []);

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

  // Combine all modules for rendering
  const allModules = [...moduleRegistry.core, ...moduleRegistry.advanced];
  
  // Sort favorites first if any
  const sortedModules = favoriteModules.length > 0
    ? [
        ...allModules.filter(m => favoriteModules.includes(m.id)),
        ...allModules.filter(m => !favoriteModules.includes(m.id))
      ]
    : allModules;

  return (
    <div className={`app-container ${darkMode ? 'dark' : ''}`}>
      <header className="header">
        <div className="header-content">
          <div className="header-title">
            <button 
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              ☰
            </button>
            <h1>⚙️ CNC Calculator Pro</h1>
          </div>
          <div className="header-controls">
            <button 
              className="dark-mode-toggle"
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button 
              className="settings-btn"
              onClick={() => setSelectedTabIndex(allModules.length)}
              aria-label="Settings"
            >
              ⚙️
            </button>
          </div>
        </div>
        <p className="header-subtitle">Professional Machining & Programming Suite</p>
      </header>
      
      <div className="container">
        <Tabs 
          selectedIndex={selectedTabIndex} 
          onSelect={index => setSelectedTabIndex(index)}
          className="tabs-container"
        >
          <TabList className={`tab-list ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            {sortedModules.map((module) => (
              <Tab key={module.id} className="tab-item">
                <span className="tab-content">
                  <span className="tab-name">{module.name}</span>
                  {favoriteModules.includes(module.id) && (
                    <span className="favorite-star">⭐</span>
                  )}
                </span>
              </Tab>
            ))}
            <Tab className="tab-item settings-tab">
              <span className="tab-content">
                <span className="tab-name">⚙️ Settings</span>
              </span>
            </Tab>
          </TabList>

          {sortedModules.map((module) => (
            <TabPanel key={module.id} className="tab-panel">
              <div className="module-header">
                <button
                  className={`favorite-btn ${favoriteModules.includes(module.id) ? 'active' : ''}`}
                  onClick={() => toggleFavorite(module.id)}
                  aria-label={`${favoriteModules.includes(module.id) ? 'Remove from' : 'Add to'} favorites`}
                >
                  {favoriteModules.includes(module.id) ? '⭐' : '☆'}
                </button>
              </div>
              <module.component />
            </TabPanel>
          ))}
          
          <TabPanel className="tab-panel">
            <SettingsPanel 
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
              favoriteModules={favoriteModules}
              allModules={allModules}
              toggleFavorite={toggleFavorite}
            />
          </TabPanel>
        </Tabs>
      </div>
      
      <MobileNavBar 
        modules={sortedModules}
        selectedIndex={selectedTabIndex}
        onSelect={setSelectedTabIndex}
      />
    </div>
  );
}

// Settings Panel Component
function SettingsPanel({ darkMode, toggleDarkMode, favoriteModules, allModules, toggleFavorite }) {
  const clearCache = () => {
    localStorage.clear();
    window.location.reload();
  };

  const exportSettings = () => {
    const settings = {
      darkMode,
      favoriteModules,
      savedCalculations: localStorage.getItem('savedCalculations'),
      toolDatabase: localStorage.getItem('toolDatabase'),
    };
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cnc-calculator-settings.json';
    a.click();
  };

  return (
    <div className="calculator-section settings-section">
      <h2>Settings & Preferences</h2>
      
      <div className="settings-group">
        <h3>Appearance</h3>
        <div className="setting-item">
          <label className="setting-label">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={toggleDarkMode}
            />
            <span>Dark Mode</span>
          </label>
        </div>
      </div>

      <div className="settings-group">
        <h3>Favorite Modules</h3>
        <div className="favorite-modules-list">
          {allModules.map(module => (
            <div key={module.id} className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={favoriteModules.includes(module.id)}
                  onChange={() => toggleFavorite(module.id)}
                />
                <span>{module.name}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="settings-group">
        <h3>Data Management</h3>
        <div className="button-group">
          <button className="btn" onClick={exportSettings}>
            Export Settings
          </button>
          <button className="btn btn-secondary" onClick={clearCache}>
            Clear Cache
          </button>
        </div>
      </div>

      <div className="settings-group">
        <h3>About</h3>
        <p className="info-text">
          CNC Calculator Pro v2.0<br />
          Professional Machining & Programming Suite<br />
          © 2024 - Open Source Project
        </p>
      </div>
    </div>
  );
}

// Mobile Navigation Bar Component
function MobileNavBar({ modules, selectedIndex, onSelect }) {
  const [showNav, setShowNav] = useState(false);

  return (
    <div className="mobile-nav-bar">
      <button 
        className="mobile-nav-toggle"
        onClick={() => setShowNav(!showNav)}
      >
        <span className="current-module">
          {modules[selectedIndex]?.name || 'Select'}
        </span>
        <span className="nav-arrow">▼</span>
      </button>
      
      {showNav && (
        <div className="mobile-nav-dropdown">
          {modules.map((module, index) => (
            <button
              key={module.id}
              className={`mobile-nav-item ${index === selectedIndex ? 'active' : ''}`}
              onClick={() => {
                onSelect(index);
                setShowNav(false);
              }}
            >
              {module.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;