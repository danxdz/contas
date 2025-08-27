import React, { useState, useEffect } from 'react';
import './AppModular.css';
import ErrorBoundary from './components/ErrorBoundary';

// Math & Calculations
import TrigonometryCalculator from './components/TrigonometryCalculator';
import ThreadCalculator from './components/ThreadCalculator';

// Machining Tools
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
  ShopFloorUtilities
} from './components/modules/index.jsx';

import UnifiedSimulator from './components/modules/UnifiedSimulator';

// Settings Component
const SettingsModule = ({ settings, onUpdate }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleToggle = (category, moduleId) => {
    const newSettings = { ...localSettings };
    if (!newSettings.enabledModules[category]) {
      newSettings.enabledModules[category] = {};
    }
    newSettings.enabledModules[category][moduleId] = !newSettings.enabledModules[category][moduleId];
    setLocalSettings(newSettings);
    onUpdate(newSettings);
  };

  const themes = ['dark', 'light', 'blue', 'green'];
  const layouts = ['default', 'compact', 'wide', 'mobile'];

  return (
    <div className="settings-module">
      <h2>⚙️ Application Settings</h2>
      
      <div className="settings-section">
        <h3>Appearance</h3>
        <div className="settings-group">
          <label>Theme:</label>
          <select 
            value={localSettings.theme} 
            onChange={(e) => {
              const newSettings = { ...localSettings, theme: e.target.value };
              setLocalSettings(newSettings);
              onUpdate(newSettings);
            }}
          >
            {themes.map(theme => (
              <option key={theme} value={theme}>{theme.charAt(0).toUpperCase() + theme.slice(1)}</option>
            ))}
          </select>
        </div>
        
        <div className="settings-group">
          <label>Layout:</label>
          <select 
            value={localSettings.layout} 
            onChange={(e) => {
              const newSettings = { ...localSettings, layout: e.target.value };
              setLocalSettings(newSettings);
              onUpdate(newSettings);
            }}
          >
            {layouts.map(layout => (
              <option key={layout} value={layout}>{layout.charAt(0).toUpperCase() + layout.slice(1)}</option>
            ))}
          </select>
        </div>

        <div className="settings-group">
          <label>
            <input 
              type="checkbox" 
              checked={localSettings.showAnimations}
              onChange={(e) => {
                const newSettings = { ...localSettings, showAnimations: e.target.checked };
                setLocalSettings(newSettings);
                onUpdate(newSettings);
              }}
            />
            Enable Animations
          </label>
        </div>

        <div className="settings-group">
          <label>
            <input 
              type="checkbox" 
              checked={localSettings.compactMode}
              onChange={(e) => {
                const newSettings = { ...localSettings, compactMode: e.target.checked };
                setLocalSettings(newSettings);
                onUpdate(newSettings);
              }}
            />
            Compact Mode
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h3>Module Management</h3>
        <p className="settings-info">Enable or disable modules to customize your workspace</p>
        
        {Object.entries(moduleRegistry).map(([categoryKey, category]) => (
          <div key={categoryKey} className="module-settings-category">
            <h4>{category.icon} {category.name}</h4>
            <div className="module-toggles">
              {category.modules.map(module => (
                <label key={module.id} className="module-toggle">
                  <input 
                    type="checkbox"
                    checked={localSettings.enabledModules[categoryKey]?.[module.id] !== false}
                    onChange={() => handleToggle(categoryKey, module.id)}
                  />
                  <span>{module.icon} {module.name}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="settings-section">
        <h3>Performance</h3>
        <div className="settings-group">
          <label>
            <input 
              type="checkbox" 
              checked={localSettings.highQuality3D}
              onChange={(e) => {
                const newSettings = { ...localSettings, highQuality3D: e.target.checked };
                setLocalSettings(newSettings);
                onUpdate(newSettings);
              }}
            />
            High Quality 3D Rendering
          </label>
        </div>
        <div className="settings-group">
          <label>
            <input 
              type="checkbox" 
              checked={localSettings.autoSave}
              onChange={(e) => {
                const newSettings = { ...localSettings, autoSave: e.target.checked };
                setLocalSettings(newSettings);
                onUpdate(newSettings);
              }}
            />
            Auto-save Settings
          </label>
        </div>
      </div>

      <div className="settings-actions">
        <button className="btn-reset" onClick={() => {
          if (confirm('Reset all settings to defaults?')) {
            localStorage.clear();
            window.location.reload();
          }
        }}>
          Reset to Defaults
        </button>
        <button className="btn-export" onClick={() => {
          const dataStr = JSON.stringify(localSettings, null, 2);
          const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
          const exportFileDefaultName = 'cnc-settings.json';
          const linkElement = document.createElement('a');
          linkElement.setAttribute('href', dataUri);
          linkElement.setAttribute('download', exportFileDefaultName);
          linkElement.click();
        }}>
          Export Settings
        </button>
      </div>
    </div>
  );
};

// Properly organized module registry
const moduleRegistry = {
  mathematics: {
    name: 'Mathematics',
    icon: '📐',
    description: 'Mathematical calculations and conversions',
    modules: [
      { id: 'trigonometry', name: 'Trigonometry', component: TrigonometryCalculator, icon: '📏', description: 'Sine, cosine, tangent calculations' },
      { id: 'geometry', name: 'Geometry Tools', component: GeometryTools, icon: '📐', description: 'Advanced geometry calculations' },
    ]
  },
  machining: {
    name: 'Machining',
    icon: '🔧',
    description: 'Cutting tools and machining calculations',
    modules: [
      { id: 'speeds', name: 'Cutting Speeds', component: CuttingSpeedCalculator, icon: '⚡', description: 'Calculate optimal cutting speeds' },
      { id: 'facemilling', name: 'Face Milling', component: FaceMillingCalculator, icon: '🔨', description: 'Face milling operations' },
      { id: 'thread', name: 'Thread Calculator', component: ThreadCalculator, icon: '🔩', description: 'Thread specifications and calculations' },
      { id: 'toollife', name: 'Tool Life', component: ToolLifeCalculator, icon: '⏱️', description: 'Tool life and cost analysis' },
      { id: 'powerTorque', name: 'Power & Torque', component: PowerTorqueCalculator, icon: '💪', description: 'Power and torque requirements' },
      { id: 'utilities', name: 'Tool Utilities', component: VariousTools, icon: '🛠️', description: 'Various tool calculations' },
    ]
  },
  programming: {
    name: 'Programming',
    icon: '💻',
    description: 'CNC programming and code generation',
    modules: [
      { id: 'simulator', name: 'G-Code Simulator', component: UnifiedSimulator, icon: '🎮', description: 'Simulate and verify G-code' },
      { id: 'interpolation', name: 'Circular Interpolation', component: CircularInterpolation, icon: '🔄', description: 'Arc and circular movements' },
      { id: 'pocket', name: 'Pocket Milling', component: PocketMillingWizard, icon: '📦', description: 'Generate pocket milling code' },
    ]
  },
  optimization: {
    name: 'Optimization',
    icon: '📊',
    description: 'Optimize machining parameters',
    modules: [
      { id: 'feedspeeds', name: 'Feeds & Speeds', component: FeedsSpeedsOptimizer, icon: '📈', description: 'Optimize cutting parameters' },
      { id: 'database', name: 'Tool Database', component: ToolDatabase, icon: '🗄️', description: 'Manage cutting tools' },
    ]
  },
  production: {
    name: 'Production',
    icon: '🏭',
    description: 'Shop floor management tools',
    modules: [
      { id: 'shopfloor', name: 'Shop Floor', component: ShopFloorUtilities, icon: '⚙️', description: 'Production management tools' },
    ]
  }
};

const AppModular = () => {
  // Load settings from localStorage
  const loadSettings = () => {
    const saved = localStorage.getItem('cncAppSettings');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      theme: 'dark',
      layout: 'default',
      showAnimations: true,
      compactMode: false,
      highQuality3D: true,
      autoSave: true,
      enabledModules: {}
    };
  };

  const [settings, setSettings] = useState(loadSettings());
  const [activeCategory, setActiveCategory] = useState('mathematics');
  const [activeModule, setActiveModule] = useState('trigonometry');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('cncFavorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Apply theme
  useEffect(() => {
    document.body.className = `theme-${settings.theme} ${settings.compactMode ? 'compact' : ''}`;
    if (settings.autoSave) {
      localStorage.setItem('cncAppSettings', JSON.stringify(settings));
    }
  }, [settings]);

  // Save favorites
  useEffect(() => {
    localStorage.setItem('cncFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Toggle favorite
  const toggleFavorite = (categoryId, moduleId) => {
    const favId = `${categoryId}-${moduleId}`;
    setFavorites(prev => 
      prev.includes(favId) 
        ? prev.filter(f => f !== favId)
        : [...prev, favId]
    );
  };

  // Get filtered modules based on settings and search
  const getFilteredModules = () => {
    const filtered = {};
    Object.entries(moduleRegistry).forEach(([catKey, category]) => {
      const enabledModules = category.modules.filter(module => {
        // Check if module is enabled
        if (settings.enabledModules[catKey]?.[module.id] === false) {
          return false;
        }
        // Check search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return module.name.toLowerCase().includes(query) ||
                 module.description?.toLowerCase().includes(query);
        }
        return true;
      });
      
      if (enabledModules.length > 0) {
        filtered[catKey] = {
          ...category,
          modules: enabledModules
        };
      }
    });
    return filtered;
  };

  // Get current component
  const getCurrentComponent = () => {
    // Special case for settings
    if (activeCategory === 'settings') {
      return <SettingsModule settings={settings} onUpdate={setSettings} />;
    }

    const category = moduleRegistry[activeCategory];
    if (!category) return null;
    
    const module = category.modules.find(m => m.id === activeModule);
    if (!module) return null;
    
    // Check if module is disabled
    if (settings.enabledModules[activeCategory]?.[activeModule] === false) {
      return (
        <div className="module-disabled">
          <h3>Module Disabled</h3>
          <p>This module has been disabled in settings.</p>
          <button onClick={() => {
            setActiveCategory('settings');
            setActiveModule(null);
          }}>
            Go to Settings
          </button>
        </div>
      );
    }
    
    const Component = module.component;
    if (!Component) {
      return (
        <div className="module-error">
          <h3>Module Not Found</h3>
          <p>The component for {module.name} could not be loaded.</p>
        </div>
      );
    }
    
    try {
      // Special props for specific modules
      if (module.id === 'simulator') {
        const toolDatabase = JSON.parse(localStorage.getItem('cncToolDatabase') || '[]');
        return <Component toolDatabase={toolDatabase} settings={settings} />;
      }
      
      if (module.id === 'database') {
        const toolDatabase = JSON.parse(localStorage.getItem('cncToolDatabase') || '[]');
        return <Component 
          tools={toolDatabase}
          onUpdate={(newTools) => {
            localStorage.setItem('cncToolDatabase', JSON.stringify(newTools));
          }}
        />;
      }
      
      return <Component settings={settings} />;
    } catch (error) {
      console.error('Error rendering module:', error);
      return (
        <div className="module-error">
          <h3>Error Loading Module</h3>
          <p>{error.message}</p>
        </div>
      );
    }
  };

  const filteredModules = getFilteredModules();
  const currentModule = moduleRegistry[activeCategory]?.modules.find(m => m.id === activeModule);

  return (
    <div className={`app-modular`}>
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <button 
            className="menu-toggle"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            ☰
          </button>
          <h1 className="app-title">
            <span className="title-icon">🔧</span>
            CNC Pro Suite
          </h1>
        </div>
        
        <div className="header-center">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input 
              type="text"
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        
        <div className="header-right">
          <button 
            className="header-btn"
            onClick={() => {
              setActiveCategory('settings');
              setActiveModule(null);
            }}
          >
            ⚙️ Settings
          </button>
        </div>
      </header>

      {/* Main Navigation */}
      <nav className="main-nav">
        {Object.entries(filteredModules).map(([key, category]) => (
          <button
            key={key}
            className={`nav-button ${activeCategory === key ? 'active' : ''}`}
            onClick={() => {
              setActiveCategory(key);
              if (category.modules.length > 0) {
                setActiveModule(category.modules[0].id);
              }
            }}
          >
            <span className="nav-icon">{category.icon}</span>
            <span className="nav-label">{category.name}</span>
          </button>
        ))}
        <button
          className={`nav-button ${activeCategory === 'settings' ? 'active' : ''}`}
          onClick={() => {
            setActiveCategory('settings');
            setActiveModule(null);
          }}
        >
          <span className="nav-icon">⚙️</span>
          <span className="nav-label">Settings</span>
        </button>
      </nav>

      {/* Sub Navigation */}
      {activeCategory !== 'settings' && filteredModules[activeCategory] && (
        <div className="sub-nav">
          {filteredModules[activeCategory].modules.map(module => {
            const isFavorite = favorites.includes(`${activeCategory}-${module.id}`);
            return (
              <button
                key={module.id}
                className={`sub-nav-button ${activeModule === module.id ? 'active' : ''}`}
                onClick={() => setActiveModule(module.id)}
              >
                <span className="module-icon">{module.icon}</span>
                <span className="module-name">{module.name}</span>
                <button 
                  className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(activeCategory, module.id);
                  }}
                >
                  {isFavorite ? '⭐' : '☆'}
                </button>
              </button>
            );
          })}
        </div>
      )}

      {/* Favorites Bar */}
      {favorites.length > 0 && (
        <div className="favorites-bar">
          <span className="favorites-label">⭐ Quick Access:</span>
          {favorites.map(favId => {
            const [catId, modId] = favId.split('-');
            const category = moduleRegistry[catId];
            const module = category?.modules.find(m => m.id === modId);
            if (!module) return null;
            
            return (
              <button
                key={favId}
                className="favorite-quick"
                onClick={() => {
                  setActiveCategory(catId);
                  setActiveModule(modId);
                }}
              >
                {module.icon} {module.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Content */}
      <main className="main-content">
        {currentModule && (
          <div className="content-header">
            <h2 className="module-title">
              {currentModule.icon} {currentModule.name}
            </h2>
            {currentModule.description && (
              <p className="module-description">{currentModule.description}</p>
            )}
          </div>
        )}
        
        <div className="module-container">
          <ErrorBoundary>
            {getCurrentComponent()}
          </ErrorBoundary>
        </div>
      </main>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="mobile-menu-overlay" onClick={() => setShowMobileMenu(false)}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <h3>Navigation</h3>
              <button onClick={() => setShowMobileMenu(false)}>✕</button>
            </div>
            {Object.entries(filteredModules).map(([key, category]) => (
              <div key={key} className="mobile-menu-category">
                <h4>{category.icon} {category.name}</h4>
                {category.modules.map(module => (
                  <button
                    key={module.id}
                    className="mobile-menu-item"
                    onClick={() => {
                      setActiveCategory(key);
                      setActiveModule(module.id);
                      setShowMobileMenu(false);
                    }}
                  >
                    {module.icon} {module.name}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppModular;