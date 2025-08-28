import React from 'react'
import ReactDOM from 'react-dom/client'

// Original CNCProSuite - Complete version
import CNCProSuite from './CNCProSuite'
import './CNCProSuite.css'

// Other versions available:
// import CNCProSuiteModular from './CNCProSuiteModular'  // FreeCAD-like workbench version
// import ModularCAM from './ModularCAM'        // Simple modular version
// import AIMachiningSystem from './AIMachiningSystem'  // AI version

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CNCProSuite />
  </React.StrictMode>,
)