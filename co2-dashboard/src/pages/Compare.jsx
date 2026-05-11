import React, { useState, useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { ProgressSpinner } from 'primereact/progressspinner';
import { fetchCountryStats, fetchCountryTimeline } from '../services/api';

// Country colors: A = green, B = amber
const COLOR_A = { border: '#1a6b3c', bg: 'rgba(26,107,60,0.10)' };
const COLOR_B = { border: '#d97706', bg: 'rgba(217,119,6,0.10)'  };

function Compare() {
  // --- State ---
  const [countryOptions, setCountryOptions] = useState([]);   // list for dropdowns
  const [countryA, setCountryA]             = useState(null);
  const [countryB, setCountryB]             = useState(null);
  const [timelineA, setTimelineA]           = useState([]);
  const [timelineB, setTimelineB]           = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingChart, setLoadingChart]     = useState(false);
  const [error, setError]                   = useState(null);

  // --- Load country list once on mount (uses 2023 data to get distinct names) ---
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const data = await fetchCountryStats(null); // all years
        const distinct = [...new Set(data.map((r) => r.country))].sort();
        setCountryOptions(distinct.map((c) => ({ label: c, value: c })));
      } catch (err) {
        setError('Failed to load country list.');
        console.error(err);
      } finally {
        setLoadingOptions(false);
      }
    };
    loadOptions();
  }, []);

  // --- Fetch timeline for country A whenever it changes ---
  useEffect(() => {
    if (!countryA) { setTimelineA([]); return; }
    const load = async () => {
      setLoadingChart(true);
      try {
        const data = await fetchCountryTimeline(countryA);
        setTimelineA(data);
      } catch (err) {
        setError(`Failed to load data for ${countryA}.`);
      } finally {
        setLoadingChart(false);
      }
    };
    load();
  }, [countryA]);

  // --- Fetch timeline for country B whenever it changes ---
  useEffect(() => {
    if (!countryB) { setTimelineB([]); return; }
    const load = async () => {
      setLoadingChart(true);
      try {
        const data = await fetchCountryTimeline(countryB);
        setTimelineB(data);
      } catch (err) {
        setError(`Failed to load data for ${countryB}.`);
      } finally {
        setLoadingChart(false);
      }
    };
    load();
  }, [countryB]);

  // --- Build chart data from both timelines ---
  // Use union of all years from both countries as labels
  const allYears = [
    ...new Set([
      ...timelineA.map((r) => r.year),
      ...timelineB.map((r) => r.year),
    ]),
  ].sort((a, b) => a - b);

  const getValue = (timeline, year) => {
    const row = timeline.find((r) => r.year === year);
    return row ? row.avgCo2 : null;
  };

  const chartData = {
    labels: allYears,
    datasets: [
      countryA && {
        label: countryA,
        data: allYears.map((y) => getValue(timelineA, y)),
        borderColor: COLOR_A.border,
        backgroundColor: COLOR_A.bg,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 7,
        borderWidth: 2,
      },
      countryB && {
        label: countryB,
        data: allYears.map((y) => getValue(timelineB, y)),
        borderColor: COLOR_B.border,
        backgroundColor: COLOR_B.bg,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 7,
        borderWidth: 2,
        borderDash: [5, 3],
      },
    ].filter(Boolean),
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 13 } } },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y?.toFixed(2)} Gt`,
        },
      },
    },
    scales: {
      y: {
        ticks: { callback: (v) => v + ' Gt', font: { size: 11 } },
        grid: { color: 'rgba(0,0,0,0.06)' },
      },
      x: {
        ticks: { font: { size: 11 } },
        grid: { display: false },
      },
    },
  };

  // --- Summary stat cards for each country ---
  const summarize = (timeline, label, color) => {
    if (!timeline.length) return null;
    const values  = timeline.map((r) => r.avgCo2);
    const latest  = timeline[timeline.length - 1].avgCo2;
    const first   = timeline[0].avgCo2;
    const change  = ((latest - first) / first) * 100;
    const max     = Math.max(...values);
    const min     = Math.min(...values);

    return (
      <div className="compare-summary" style={{ borderTop: `3px solid ${color}` }}>
        <p className="compare-country-name">{label}</p>
        <div className="compare-stats-grid">
          <div className="compare-stat">
            <span className="compare-stat-label">Latest</span>
            <span className="compare-stat-value">{latest.toFixed(2)} Gt</span>
          </div>
          <div className="compare-stat">
            <span className="compare-stat-label">Change</span>
            <span
              className="compare-stat-value"
              style={{ color: change > 0 ? '#e53935' : '#43a047' }}
            >
              {change > 0 ? '+' : ''}{change.toFixed(1)}%
            </span>
          </div>
          <div className="compare-stat">
            <span className="compare-stat-label">Peak</span>
            <span className="compare-stat-value">{max.toFixed(2)} Gt</span>
          </div>
          <div className="compare-stat">
            <span className="compare-stat-label">Lowest</span>
            <span className="compare-stat-value">{min.toFixed(2)} Gt</span>
          </div>
        </div>
      </div>
    );
  };

  const bothSelected = countryA && countryB;

  // --- Render ---
  return (
    <div className="dashboard">

      <header className="dash-header">
        <div className="dash-title">
          <i className="pi pi-chart-bar" style={{ fontSize: '1.4rem', color: '#1a6b3c' }} />
          <h1>Country Comparator</h1>
          <span className="dash-badge">Select two countries to compare</span>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <i className="pi pi-exclamation-triangle" /> {error}
        </div>
      )}

      {/* Country selectors */}
      {loadingOptions ? (
        <div className="spinner-wrapper"><ProgressSpinner /></div>
      ) : (
        <Card className="compare-selectors-card">
          <div className="compare-selectors">
            <div className="compare-selector-group">
              <label htmlFor="countryA" className="compare-selector-label">
                <span className="compare-dot" style={{ background: COLOR_A.border }} />
                Country A
              </label>
              <Dropdown
                inputId="countryA"
                value={countryA}
                options={countryOptions.filter((o) => o.value !== countryB)}
                onChange={(e) => setCountryA(e.value)}
                placeholder="Select country A"
                filter
                style={{ width: '100%' }}
              />
            </div>

            <div className="compare-vs">vs</div>

            <div className="compare-selector-group">
              <label htmlFor="countryB" className="compare-selector-label">
                <span className="compare-dot" style={{ background: COLOR_B.border }} />
                Country B
              </label>
              <Dropdown
                inputId="countryB"
                value={countryB}
                options={countryOptions.filter((o) => o.value !== countryA)}
                onChange={(e) => setCountryB(e.value)}
                placeholder="Select country B"
                filter
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Prompt when nothing selected yet */}
      {!countryA && !countryB && !loadingOptions && (
        <div className="compare-empty">
          <i className="pi pi-arrow-up" style={{ fontSize: '2rem', color: '#ccc' }} />
          <p>Select two countries above to compare their CO₂ trajectories.</p>
        </div>
      )}

      {/* Chart */}
      {(countryA || countryB) && (
        <>
          <Card
            title={
              bothSelected
                ? `${countryA} vs ${countryB} — CO₂ emissions over time`
                : 'CO₂ emissions over time'
            }
            className="chart-card"
          >
            {loadingChart ? (
              <div className="spinner-wrapper"><ProgressSpinner /></div>
            ) : (
              <div style={{ height: '320px' }}>
                <Chart type="line" data={chartData} options={chartOptions} />
              </div>
            )}
          </Card>

          {/* Summary stats below the chart */}
          {!loadingChart && (
            <div className="compare-summaries">
              {countryA && summarize(timelineA, countryA, COLOR_A.border)}
              {countryB && summarize(timelineB, countryB, COLOR_B.border)}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Compare;
