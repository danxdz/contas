import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import ThreadCalculator from './components/ThreadCalculator';
import TrigonometryCalculator from './components/TrigonometryCalculator';
import CuttingSpeedCalculator from './components/CuttingSpeedCalculator';
import FaceMillingCalculator from './components/FaceMillingCalculator';
import VariousTools from './components/VariousTools';

function App() {
  return (
    <div className="container">
      <header className="header">
        <h1>⚙️ CNC Calculator</h1>
        <p>Professional Machining and Programming Tools</p>
      </header>
      
      <Tabs>
        <TabList>
          <Tab>🔩 Threads</Tab>
          <Tab>📐 Trigonometry</Tab>
          <Tab>⚡ Cutting Speed</Tab>
          <Tab>🔧 Face Milling</Tab>
          <Tab>🛠️ Various Tools</Tab>
        </TabList>

        <TabPanel>
          <ThreadCalculator />
        </TabPanel>
        
        <TabPanel>
          <TrigonometryCalculator />
        </TabPanel>
        
        <TabPanel>
          <CuttingSpeedCalculator />
        </TabPanel>
        
        <TabPanel>
          <FaceMillingCalculator />
        </TabPanel>
        
        <TabPanel>
          <VariousTools />
        </TabPanel>
      </Tabs>
    </div>
  );
}

export default App;