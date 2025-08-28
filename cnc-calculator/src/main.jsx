import React from 'react'
import ReactDOM from 'react-dom/client'
// Use the original with all features
import CNCProSuite from './CNCProSuite'
import './CNCProSuite.css'

// New modular version (experimental)
// import App from './App'
// import './App.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CNCProSuite />
  </React.StrictMode>,
)