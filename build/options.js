(function () {
  'use strict';

  class Table {
    constructor(tableSelector, searchSelector, storageKey='pwdManagerData') {
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
      return saved ? JSON.parse(saved) : []
    }

    /** Save data to localStorage */
    saveData() {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }

    /** Render the table UI */
    renderTable(filteredData = null) {
      const dataToRender = filteredData || this.data;
      if(this.data.length === 0) {
        this.table.innerHTML = `<p style="text-align: center; col: 100%">No data available. Add a new row.</p>`;
        return  
      }
      this.table.innerHTML = `
      <tbody>
        ${dataToRender.map((row, index) => `
          <tr>
            <td contenteditable='true' data-field='name'>${row.name || ''}</td>
            <td contenteditable='true' data-field='weblink'>${row.weblink || ''}</td>
            <td contenteditable='true' data-field='username'>${row.username || ''}</td>
            <td contenteditable='true' data-field='password'>${row.password || ''}</td>
            <td contenteditable='true' data-field='category'>${row.category || ''}</td>
            <td contenteditable='true' data-field='notes'>${row.notes || ''}</td>
            <td><button class='remove-btn' data-index='${index}'>
              <svg class="icon close"><use href="../assets/x-circle.svg" /></svg>
            </button></td>
          </tr>
        `).join('')}
      </tbody>
    `;
    }

    /** Add a new row */
    addRow(row = { name: '', weblink: '', username: '', password: '', category: '', notes: '' }) {
      this.data.unshift(row);
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
    _parseCSV(csvText) {
      const lines = csvText.trim().replaceAll('"', '').split('\n');
      const headers = lines.shift().split(',');
      return lines.map(line => {
        const values = line.split(',');
        const obj = {};
        headers.forEach((h, i) => obj[h.trim()] = values[i]?.trim() || '');
        return obj;
      });
    }

    /** Parse JSON string into objects */
    _parseJSON(jsonText) {
      try {
        const parsed = JSON.parse(jsonText);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        alert('Invalid JSON');
        return [];
      }
    }

    /** Export to CSV */
    exportCSV(sep=',') {
      if(!this.data.length) return
      const headers = Object.keys(this.data[0]);
      const csvRows = [headers.join(sep)];
      this.data.forEach(row => {
        csvRows.push(headers.map(h => `${row[h] || ''}`).join(sep));
      });
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      this._downloadFile(blob, 'data.csv');
    }

    /** Export to JSON */
    exportJSON() {
      const blob = new Blob([JSON.stringify(this.data, null, 2)], { type: 'application/json' });
      this._downloadFile(blob, 'data.json');
    }

    /** Helper to download file */
    _downloadFile(blob, filename) {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
    }

    /**
     * given file object, import data
     * Handles both JSON and CSV formats
     * @param {file} file - File object from input
     * @returns 
     */
    handleImport(file) {
      if(!file) return

      if(file.name.endsWith('.json')) {
        
        try { this.importJSON(file); }
        catch (err) { alert('Failed to parse JSON.'); }

      } else if(file.name.endsWith('.csv')) {
        
        try { this.importCSV(file); }
        catch (err) { alert('Failed to parse JSON.'); }
        
      } else {
        alert('Unsupported file type');
      }
    }

    /** Import CSV file */
    importCSV(file) {
      const reader = new FileReader();
      reader.onload = () => {
        const importedData = this._parseCSV(reader.result);
        this.data = [...importedData, ...this.data];
        this.saveData();
        this.renderTable();
      };
      reader.readAsText(file);
    }

    /** Import JSON file */
    importJSON(file) {
      const reader = new FileReader();
      reader.onload = () => {
        const importedData = this._parseJSON(reader.result);
        this.data = [...importedData, ...this.data];
        this.saveData();
        this.renderTable();
      };
      reader.readAsText(file);
    }

    /** Add all event listeners */
    addListeners() {
      // Search
      if(this.searchInput) {
        this.searchInput.addEventListener('input', (e) => {
          this.liveSearch(e.target.value);
        });
      }

      // Remove row
      this.table.addEventListener('click', (e) => {
        if(e.target.classList.contains('remove-btn')) {
          const index = e.target.dataset.index;
          this.removeRow(index);
        }
      });

      /**
       * Handle inline editing
       * When a cell loses focus, update the data array
       * This allows users to edit directly in the table
       * and save changes automatically
       */
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

  const table = new Table('#tableBody', '#searchInput', 'pwdManagerData');
  table.renderTable();

  document.querySelector('#searchInput').addEventListener('input', (e) => {
    table.search(e.target.value);
  });

  document.querySelector('#addRowBtn').addEventListener('click', () => {
    table.addRow({
      name: '',
      weblink: '',
      username: '',
      password: '',
      category: '',
      notes: ''
    });
  });

  document.querySelector('#exportJsonBtn').addEventListener('click', () => {
    const jsonData = table.exportJSON();
    console.log(jsonData);
  });

  document.querySelector('#exportCsvBtn').addEventListener('click', () => {
    const csvData = table.exportCSV();
    console.log(csvData);
  });

  document.querySelector('#importFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    try {
      table.handleImport(file);
    } catch(e) {
      console.error('Error importing file:', e);
    }
  });

})();
