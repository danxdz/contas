import React from 'react'
import ReactDOM from 'react-dom/client'
import CNCProSuite from './CNCProSuite'
import ErrorBoundary from './components/ErrorBoundary'
import { AppProvider } from './context/AppContext'
import './CNCProSuite.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppProvider>
        <CNCProSuite />
      </AppProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)