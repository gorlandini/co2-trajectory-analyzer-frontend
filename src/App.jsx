import React, { useState } from 'react';
import { TabMenu } from 'primereact/tabmenu';
import Dashboard from './pages/Dashboard';
import Compare from './pages/Compare';

import 'primereact/resources/themes/lara-light-green/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './index.css';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: 'pi pi-home' },
  { label: 'Compare countries', icon: 'pi pi-chart-bar' },
];

function App() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <>
      <nav className="app-nav">
        <TabMenu
          model={NAV_ITEMS}
          activeIndex={activeTab}
          onTabChange={(e) => setActiveTab(e.index)}
        />
      </nav>
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
