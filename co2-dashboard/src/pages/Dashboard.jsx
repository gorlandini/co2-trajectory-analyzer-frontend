import React, { useState, useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { ProgressSpinner } from 'primereact/progressspinner';
import { fetchCountryStats, fetchGlobalTimeline } from '../services/api';
import KpiCard from '../components/KpiCard';
import EmissionsChart from '../components/EmissionsChart';
import CountryTable from '../components/CountryTable';

const YEAR_OPTIONS = [
  { label: 'All years', value: null },
  { label: '2020',      value: 2020 },
  { label: '2021',      value: 2021 },
  { label: '2022',      value: 2022 },
  { label: '2023',      value: 2023 },
];

function Dashboard() {
  // --- State ---
  const [selectedYear, setSelectedYear]         = useState(2023);
  const [selectedCountries, setSelectedCountries] = useState([]);  // MultiSelect filter
  const [countryStats, setCountryStats]         = useState([]);
  const [timeline, setTimeline]                 = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState(null);

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

  // --- Fetch country stats whenever selected year changes ---
  useEffect(() => {
    const loadCountryStats = async () => {
      setLoading(true);
      setError(null);
      // Reset country filter when year changes so nothing gets hidden by accident
      setSelectedCountries([]);
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
  }, [selectedYear]);

  // --- Distinct country list for the MultiSelect options ---
  const countryOptions = [...new Set(countryStats.map((r) => r.country))]
    .sort()
    .map((c) => ({ label: c, value: c }));

  // --- Apply country filter on top of the fetched data ---
  // If nothing is selected in MultiSelect, show everything
  const filteredStats =
    selectedCountries.length > 0
      ? countryStats.filter((r) => selectedCountries.includes(r.country))
      : countryStats;

  // --- Derived values for KPI cards ---
  const latestGlobal = timeline.length ? timeline[timeline.length - 1] : null;

  const countryCount = [...new Set(countryStats.map((r) => r.country))].length;

  const topEmitter = countryStats.length
    ? [...countryStats].sort((a, b) => b.avgCo2 - a.avgCo2)[0]
    : null;

  // Top 5 from the FILTERED set for the bar chart
  const top5 = [...filteredStats]
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

        <div className="dash-filters">
          {/* Year filter */}
          <div className="dash-filter">
            <label htmlFor="yearFilter">Year</label>
            <Dropdown
              inputId="yearFilter"
              value={selectedYear}
              options={YEAR_OPTIONS}
              onChange={(e) => setSelectedYear(e.value)}
              placeholder="Select year"
            />
          </div>

          {/* Country filter — only visible after data loads */}
          {!loading && countryOptions.length > 0 && (
            <div className="dash-filter">
              <label htmlFor="countryFilter">Countries</label>
              <MultiSelect
                inputId="countryFilter"
                value={selectedCountries}
                options={countryOptions}
                onChange={(e) => setSelectedCountries(e.value)}
                placeholder="All countries"
                maxSelectedLabels={2}
                style={{ minWidth: '180px' }}
              />
            </div>
          )}
        </div>
      </header>

      {/* Active filter indicator */}
      {selectedCountries.length > 0 && (
        <div className="filter-banner">
          <i className="pi pi-filter" />
          Showing {selectedCountries.length} selected{' '}
          {selectedCountries.length === 1 ? 'country' : 'countries'}
          <button
            className="filter-clear"
            onClick={() => setSelectedCountries([])}
          >
            Clear filter
          </button>
        </div>
      )}

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

          <section aria-label="Country data table">
            <CountryTable data={filteredStats} />
          </section>
        </>
      )}
    </div>
  );
}

export default Dashboard;
