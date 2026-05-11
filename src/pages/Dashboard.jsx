import React, { useState, useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { ProgressSpinner } from 'primereact/progressspinner';
import { fetchCountryStats, fetchGlobalTimeline } from '../services/api';
import KpiCard from '../components/KpiCard';
import EmissionsChart from '../components/EmissionsChart';
import CountryTable from '../components/CountryTable';

// Available years for the filter dropdown
const YEAR_OPTIONS = [
  { label: 'All years', value: null },
  { label: '2020',      value: 2020 },
  { label: '2021',      value: 2021 },
  { label: '2022',      value: 2022 },
  { label: '2023',      value: 2023 },
];

function Dashboard() {
  // --- State ---
  const [selectedYear, setSelectedYear]   = useState(2023);   // current filter
  const [countryStats, setCountryStats]   = useState([]);     // table + bar chart data
  const [timeline, setTimeline]           = useState([]);     // line chart data
  const [loading, setLoading]             = useState(true);   // spinner flag
  const [error, setError]                 = useState(null);   // error message

  // --- Fetch global timeline once on mount ---
  useEffect(() => {
    const loadTimeline = async () => {
      try {
        const data = await fetchGlobalTimeline();
        setTimeline(data);
      } catch (err) {
        setError('Failed to load global timeline.');
        console.error(err);
      }
    };
    loadTimeline();
  }, []);

  // --- Fetch country stats whenever the selected year changes ---
  useEffect(() => {
    const loadCountryStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCountryStats(selectedYear);
        setCountryStats(data);
      } catch (err) {
        setError('Failed to load country statistics.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadCountryStats();
  }, [selectedYear]); // re-runs every time selectedYear changes

  // --- Derived values for KPI cards ---
  // Total global emissions for the latest year in the timeline
  const latestGlobal = timeline.length
    ? timeline[timeline.length - 1]
    : null;

  // Total number of distinct countries in the current dataset
  const countryCount = [...new Set(countryStats.map((r) => r.country))].length;

  // Highest emitter in the selected year
  const topEmitter = countryStats.length
    ? [...countryStats].sort((a, b) => b.avgCo2 - a.avgCo2)[0]
    : null;

  // Top 5 countries sorted by avgCo2 for the bar chart
  const top5 = [...countryStats]
    .sort((a, b) => b.avgCo2 - a.avgCo2)
    .slice(0, 5);

  // --- Render ---
  return (
    <div className="dashboard">

      {/* Header */}
      <header className="dash-header">
        <div className="dash-title">
          <i className="pi pi-globe" style={{ fontSize: '1.4rem', color: '#1a6b3c' }} />
          <h1>CO₂ Trajectory Analyzer</h1>
          <span className="dash-badge">Apache Beam · Spring Boot · React</span>
        </div>

        {/* Year filter */}
        <div className="dash-filter">
          <label htmlFor="yearFilter">Filter by year</label>
          <Dropdown
            inputId="yearFilter"
            value={selectedYear}
            options={YEAR_OPTIONS}
            onChange={(e) => setSelectedYear(e.value)}
            placeholder="Select year"
          />
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="error-banner">
          <i className="pi pi-exclamation-triangle" /> {error}
        </div>
      )}

      {/* KPI cards */}
      <section className="kpi-row" aria-label="Key metrics">
        <KpiCard
          title="Global emissions (2023)"
          value={latestGlobal ? `${latestGlobal.totalGt} Gt` : '—'}
          delta="+1.6% vs 2022"
          trend="up"
          icon="pi pi-chart-line"
        />
        <KpiCard
          title="Countries tracked"
          value={countryCount || '—'}
          icon="pi pi-flag"
        />
        <KpiCard
          title="Top emitter"
          value={topEmitter ? topEmitter.country : '—'}
          delta={topEmitter ? `${topEmitter.avgCo2.toFixed(1)} Gt avg` : null}
          trend="up"
          icon="pi pi-map-marker"
        />
        <KpiCard
          title="Paris Agreement target"
          value="29.0 Gt"
          delta="Threshold for 1.5 °C"
          trend={null}
          icon="pi pi-sun"
        />
      </section>

      {/* Charts */}
      {loading ? (
        <div className="spinner-wrapper">
          <ProgressSpinner />
        </div>
      ) : (
        <>
          <section aria-label="Emissions charts">
            <EmissionsChart timeline={timeline} topCountries={top5} />
          </section>

          {/* Table */}
          <section aria-label="Country data table">
            <CountryTable data={countryStats} />
          </section>
        </>
      )}
    </div>
  );
}

export default Dashboard;
