import React from 'react';
import { Chart } from 'primereact/chart';
import { Card } from 'primereact/card';

// Renders two charts side by side:
//   - Line chart: global CO2 timeline (Gt per year)
//   - Bar chart: top 5 emitters for the selected year
//
// Props:
//   timeline     - array of { year, totalGt }
//   topCountries - array of { country, avgCo2 } already filtered & sorted
function EmissionsChart({ timeline, topCountries }) {

  // --- Line chart data ---
  const lineData = {
    labels: timeline.map((row) => row.year),
    datasets: [
      {
        label: 'Global CO₂ (Gt)',
        data: timeline.map((row) => row.totalGt),
        fill: true,
        tension: 0.4,
        borderColor: '#1a6b3c',
        backgroundColor: 'rgba(26,107,60,0.10)',
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 2,
      },
      {
        label: 'Paris Agreement target',
        data: timeline.map(() => 29.0),
        borderColor: '#f59e0b',
        borderDash: [6, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 12 } } },
      tooltip: { callbacks: { label: (ctx) => ` ${ctx.parsed.y.toFixed(1)} Gt` } },
    },
    scales: {
      y: {
        min: 20,
        max: 42,
        ticks: { callback: (v) => v + ' Gt', font: { size: 11 } },
        grid: { color: 'rgba(0,0,0,0.06)' },
      },
      x: {
        ticks: { font: { size: 11 }, maxTicksLimit: 10 },
        grid: { display: false },
      },
    },
  };

  // --- Bar chart data ---
  const barColors = ['#1a6b3c', '#2d9e5f', '#4ec27d', '#80d9a3', '#b3ecc9'];

  const barData = {
    labels: topCountries.map((c) => c.country),
    datasets: [
      {
        label: 'Avg CO₂ (Gt)',
        data: topCountries.map((c) => c.avgCo2),
        backgroundColor: barColors.slice(0, topCountries.length),
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => ` ${ctx.parsed.x.toFixed(2)} Gt` } },
    },
    scales: {
      x: {
        ticks: { callback: (v) => v + ' Gt', font: { size: 11 } },
        grid: { color: 'rgba(0,0,0,0.06)' },
      },
      y: {
        ticks: { font: { size: 12 } },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="charts-row">
      <Card title="Global CO₂ Emissions (2000–2023)" className="chart-card">
        <div style={{ height: '280px' }}>
          <Chart type="line" data={lineData} options={lineOptions} />
        </div>
      </Card>

      <Card title="Top 5 Emitters — Selected Year" className="chart-card">
        <div style={{ height: '280px' }}>
          {topCountries.length > 0 ? (
            <Chart type="bar" data={barData} options={barOptions} />
          ) : (
            <p className="no-data">No data for selected year.</p>
          )}
        </div>
      </Card>
    </div>
  );
}

export default EmissionsChart;
