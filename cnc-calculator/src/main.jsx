import React from 'react'
import ReactDOM from 'react-dom/client'

// CNC Pro Suite with FreeCAD-like Workbench System
import CNCProSuiteModular from './CNCProSuiteModular'
import './CNCProSuiteModular.css'

// Other versions available:
// import CNCProSuite from './CNCProSuite'       // Original monolithic version
// import ModularCAM from './ModularCAM'        // Simple modular version
// import AIMachiningSystem from './AIMachiningSystem'  // AI version

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CNCProSuiteModular />
  </React.StrictMode>,
)