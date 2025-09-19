import '../styles/table-header.css'

export default function TableHeader() {
  return (
    <div class="controls">
      <div class="controls-left">
        <button id="addRowBtn">Add Row</button>
        <input type="text" id="searchInput" placeholder="Search table..." />
        <div style={{marginBottom: '1rem'}}>
          <p>Import from existing file</p>
          <input type="file" id="importFile" accept=".json,.csv" />
        </div>
      </div>

      <div class="controls-right">
        <div style={{marginBottom: '1rem', display: 'block', float: 'right'}}>
          <button id="exportJsonBtn">Export JSON</button>
          <button id="exportCsvBtn">Export CSV</button>
          <button id="clearBtn">Clear Table</button>
        </div>
      </div>
    </div>
  )
}