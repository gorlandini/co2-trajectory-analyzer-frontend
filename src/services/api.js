import axios from 'axios';

// ---------------------------------------------------------
// TO CONNECT THE REAL SPRING BOOT BACKEND:
// 1. Change USE_MOCK to false
// 2. Set BASE_URL to your backend address (e.g. http://localhost:8080)
// Everything else in the app stays the same.
// ---------------------------------------------------------
const USE_MOCK = true;
const BASE_URL = 'http://localhost:8080/api';

// Loads mock JSON from /src/data/
const getMockData = async () => {
  const { default: data } = await import('../data/co2_mock.json');
  return data;
};

// Returns all country stats, optionally filtered by year
export const fetchCountryStats = async (year = null) => {
  if (USE_MOCK) {
    const data = await getMockData();
    if (year) {
      return data.countryStats.filter((row) => row.year === year);
    }
    return data.countryStats;
  }
  // Real backend call (year param is optional)
  const params = year ? { year } : {};
  const response = await axios.get(`${BASE_URL}/country-stats`, { params });
  return response.data;
};

// Returns global CO2 totals per year (for the timeline chart)
export const fetchGlobalTimeline = async () => {
  if (USE_MOCK) {
    const data = await getMockData();
    return data.globalTimeline;
  }
  const response = await axios.get(`${BASE_URL}/global-timeline`);
  return response.data;
};
