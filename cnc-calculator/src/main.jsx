import React from 'react'
import ReactDOM from 'react-dom/client'

// Truly Modular CAM System - Clean, Expandable, Real
import CNCProSuite from './CNCProSuite'
import './CNCProSuite.css'

// Other versions available:
// import ModularCAM from './ModularCAM'        // Modular version
// import AIMachiningSystem from './AIMachiningSystem'  // AI version
// import App from './App'                      // Experimental modular

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CNCProSuite />
  </React.StrictMode>,
)