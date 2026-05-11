import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';

// Renders a sortable table of country stats for the selected year.
// Props:
//   data - array of { country, year, avgCo2, maxCo2, minCo2, totalCo2, recordCount }
function CountryTable({ data }) {

  // Format a number to 2 decimal places + " Gt"
  const gtTemplate = (field) => (row) =>
    `${Number(row[field]).toFixed(2)} Gt`;

  // Color-coded badge based on avgCo2 level
  const statusTemplate = (row) => {
    if (row.avgCo2 >= 5)   return <Tag value="Very High" severity="danger" />;
    if (row.avgCo2 >= 2)   return <Tag value="High"      severity="warning" />;
    if (row.avgCo2 >= 0.5) return <Tag value="Moderate"  severity="info" />;
    return                        <Tag value="Low"        severity="success" />;
  };

  return (
    <Card title="Country Statistics" className="table-card">
      <DataTable
        value={data}
        sortMode="single"
        removableSort
        paginator
        rows={8}
        stripedRows
        emptyMessage="No data available for the selected filters."
        className="co2-table"
      >
        <Column field="country"     header="Country"     sortable />
        <Column field="year"        header="Year"        sortable />
        <Column
          field="avgCo2"
          header="Avg CO₂"
          sortable
          body={gtTemplate('avgCo2')}
        />
        <Column
          field="maxCo2"
          header="Max CO₂"
          sortable
          body={gtTemplate('maxCo2')}
        />
        <Column
          field="minCo2"
          header="Min CO₂"
          sortable
          body={gtTemplate('minCo2')}
        />
        <Column
          field="recordCount"
          header="Records"
          sortable
        />
        <Column
          header="Level"
          body={statusTemplate}
        />
      </DataTable>
    </Card>
  );
}

export default CountryTable;
