import React from 'react'
import ReactDOM from 'react-dom/client'

// Truly Modular CAM System - Clean, Expandable, Real
import ModularCAM from './ModularCAM'
import './ModularCAM.css'

// Other versions available:
// import CNCProSuite from './CNCProSuite'      // Original full-featured
// import AIMachiningSystem from './AIMachiningSystem'  // AI version
// import App from './App'                      // Experimental modular

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ModularCAM />
  </React.StrictMode>,
)