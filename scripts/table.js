export default class Table {
  constructor(tableSelector, searchSelector, storageKey = 'sheetData') {
    this.table = document.querySelector(tableSelector);
    this.searchInput = document.querySelector(searchSelector);
    this.storageKey = storageKey;
    this.data = this.loadData();
    this.renderTable();
    this.addListeners();
  }

  /** Load data from localStorage */
  loadData() {
    const saved = localStorage.getItem(this.storageKey);
    return saved ? JSON.parse(saved) : [];
  }

  /** Save data to localStorage */
  saveData() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.data));
  }

  /** Render the table UI */
  renderTable(filteredData = null) {
    const dataToRender = filteredData || this.data;
    this.table.innerHTML = `
      <thead>
        <tr>
          <th>Website</th>
          <th>Username</th>
          <th>Password</th>
          <th>Category</th>
          <th>Notes</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${dataToRender.map((row, index) => `
          <tr>
            <td contenteditable="true" data-field="weblink">${row.weblink || ''}</td>
            <td contenteditable="true" data-field="username">${row.username || ''}</td>
            <td contenteditable="true" data-field="password">${row.password || ''}</td>
            <td contenteditable="true" data-field="category">${row.category || ''}</td>
            <td contenteditable="true" data-field="notes">${row.notes || ''}</td>
            <td>
              <button class="remove-btn" data-index="${index}">❌</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    `;
  }

  /** Add a new row */
  addRow(row = { weblink: '', username: '', password: '', category: '', notes: '' }) {
    this.data.push(row);
    this.saveData();
    this.renderTable();
  }

  /** Remove a row */
  removeRow(index) {
    this.data.splice(index, 1);
    this.saveData();
    this.renderTable();
  }

  /** Search filtering */
  liveSearch(query) {
    const filtered = this.data.filter(row =>
      Object.values(row).some(val => val && val.toLowerCase().includes(query.toLowerCase()))
    );
    this.renderTable(filtered);
  }

  /** Parse CSV string into objects */
  parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines.shift().split(',');
    return lines.map(line => {
      const values = line.split(',');
      const obj = {};
      headers.forEach((h, i) => obj[h.trim()] = values[i]?.trim() || '');
      return obj;
    });
  }

  /** Parse JSON string into objects */
  parseJSON(jsonText) {
    try {
      const parsed = JSON.parse(jsonText);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      alert('Invalid JSON');
      return [];
    }
  }

  /** Export to CSV */
  exportCSV() {
    if (!this.data.length) return;
    const headers = Object.keys(this.data[0]);
    const csvRows = [headers.join(',')];
    this.data.forEach(row => {
      csvRows.push(headers.map(h => `"${row[h] || ''}"`).join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    this.downloadFile(blob, 'data.csv');
  }

  /** Export to JSON */
  exportJSON() {
    const blob = new Blob([JSON.stringify(this.data, null, 2)], { type: 'application/json' });
    this.downloadFile(blob, 'data.json');
  }

  /** Helper to download file */
  downloadFile(blob, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  }

  handleImport(event) {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target.result
      if(file.name.endsWith('.json')) {
        try {
          this.importJSON(content)
        } catch (err) {
          alert('Failed to parse JSON.')
        }
      } else if(file.name.endsWith('.csv')) {
        this.importCSV(file)
      } else {
        alert('Unsupported file type')
      }
    }
  }

  /** Import CSV file */
  importCSV(file) {
    const reader = new FileReader();
    reader.onload = () => {
      const importedData = this.parseCSV(reader.result);
      this.data = [...this.data, ...importedData];
      this.saveData();
      this.renderTable();
    };
    reader.readAsText(file);
  }

  /** Import JSON file */
  importJSON(file) {
    const reader = new FileReader();
    reader.onload = () => {
      const importedData = this.parseJSON(reader.result);
      this.data = [...this.data, ...importedData];
      this.saveData();
      this.renderTable();
    };
    reader.readAsText(file);
  }

  /** Add all event listeners */
  addListeners() {
    // Search
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.liveSearch(e.target.value);
      });
    }

    // Remove row
    this.table.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-btn')) {
        const index = e.target.dataset.index;
        this.removeRow(index);
      }
    });

    // Editable cells save on blur
    this.table.addEventListener('blur', (e) => {
      if (e.target.matches('[contenteditable]')) {
        const rowIndex = e.target.closest('tr').rowIndex - 1; // minus header
        const field = e.target.dataset.field;
        this.data[rowIndex][field] = e.target.textContent.trim();
        this.saveData();
      }
    }, true);
  }
}
