import React from 'react'
import ReactDOM from 'react-dom/client'

// AI-Powered CAM System - The Future of Machining
import AIMachiningSystem from './AIMachiningSystem'
import './AIMachiningSystem.css'

// Legacy versions still available:
// import CNCProSuite from './CNCProSuite'
// import './CNCProSuite.css'
// import App from './App'
// import './App.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AIMachiningSystem />
  </React.StrictMode>,
)