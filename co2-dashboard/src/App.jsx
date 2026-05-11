import React, { useState } from 'react';
import { TabMenu } from 'primereact/tabmenu';
import Dashboard from './pages/Dashboard';
import Compare from './pages/Compare';

// PrimeReact theme + core styles
import 'primereact/resources/themes/lara-light-green/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './index.css';

// Navigation tabs
const NAV_ITEMS = [
  { label: 'Dashboard', icon: 'pi pi-home' },
  { label: 'Compare countries', icon: 'pi pi-chart-bar' },
];

function App() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <>
      {/* Top navigation */}
      <nav className="app-nav">
        <TabMenu
          model={NAV_ITEMS}
          activeIndex={activeTab}
          onTabChange={(e) => setActiveTab(e.index)}
        />
      </nav>

      {/* Page content — swap without unmounting to keep state */}
      <main>
        <div style={{ display: activeTab === 0 ? 'block' : 'none' }}>
          <Dashboard />
        </div>
        <div style={{ display: activeTab === 1 ? 'block' : 'none' }}>
          <Compare />
        </div>
      </main>
    </>
  );
}

export default App;
