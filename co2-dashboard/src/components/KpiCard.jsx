import React from 'react';
import { Card } from 'primereact/card';

// A simple card that shows a single KPI metric.
// Props:
//   title  - label shown above the value
//   value  - the main number/text to display
//   delta  - optional change string (e.g. "+1.1%")
//   trend  - "up" | "down" | null  (controls delta color)
//   icon   - PrimeIcons class string (e.g. "pi pi-globe")
function KpiCard({ title, value, delta, trend, icon }) {
  const deltaColor =
    trend === 'up' ? '#e53935' : trend === 'down' ? '#43a047' : '#888';

  return (
    <Card className="kpi-card">
      <div className="kpi-inner">
        {icon && (
          <span className="kpi-icon">
            <i className={icon} />
          </span>
        )}
        <p className="kpi-title">{title}</p>
        <p className="kpi-value">{value}</p>
        {delta && (
          <p className="kpi-delta" style={{ color: deltaColor }}>
            {delta}
          </p>
        )}
      </div>
    </Card>
  );
}

export default KpiCard;
