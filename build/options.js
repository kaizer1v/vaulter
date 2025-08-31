(function () {
  'use strict';

  class Table {
    constructor(tableSelector, searchSelector, storageKey='pwdManagerData') {
      this.table = document.querySelector(tableSelector);
      this.info = document.querySelector('#info');
      this.searchInput = document.querySelector(searchSelector);
      this.storageKey = storageKey;
      this.data = this.loadData();
      this.renderTable();
      this._addListeners();
      
      // TODO: Make this configurable via UI
      this.columnMapping = {
        'name': 'Name',
        'weblink': 'Weblink',
        'username': 'Username',
        'password': 'Password',
        'category': 'Category',
        'description': 'Description'
      };
    }

    /** Load data from localStorage */
    loadData() {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : []
    }

    /** given a set of data, save it in localstorage */
    saveData() {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } 

    /** Render the table UI */
    renderTable(filteredData = null) {
      const dataToRender = filteredData || this.data;
      if(dataToRender.length === 0) {
        this.table.innerHTML = `<p style="text-align: center; col: 100%">No data available. Add a new row.</p>`;
        return  
      }
      this.info.innerHTML = `There are ${this.data.length} entries`;
      this.table.innerHTML = `
      <tbody>
        ${dataToRender.map((row) => `
          <tr data-index='${row.index}'>
            <td contenteditable='true' data-field='name'>${row.name || ''}</td>
            <td contenteditable='true' data-field='weblink'>${row.weblink || ''}</td>
            <td contenteditable='true' data-field='username'>${row.username || ''}</td>
            <td contenteditable='true' data-field='password'>${row.password || ''}</td>
            <td contenteditable='true' data-field='category'>${row.category || ''}</td>
            <td contenteditable='true' data-field='notes'>${row.notes || ''}</td>
            <td><button data-index='${row.index}' class='remove-btn'>Remove</button></td>
            </tr>
        `).join('')}
      </tbody>
    `;
    }

    /** Add a new row */
    addRow(row = { index: this.data.length + 1, name: '', weblink: '', username: '', password: '', category: '', notes: '' }) {
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
        Object.values(row).map(r => String(r)).some(val => {
          console.log('Checking value:', val, 'against query:', query);
          return val && val.toLowerCase().includes(query.toLowerCase())
        })
      );
      console.log('Filtered data:', filtered);
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
        return obj
      })
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
        
        const mapping = this.columnMapping;

        importedData.forEach(row => {
          for(const key in mapping) {
            if(row[mapping[key]] !== undefined) {
              row[key] = row[mapping[key]];
              delete row[mapping[key]];
            }
          }
        });

        this.data = [...this._indexData(importedData), ...this.data];
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
        this.data = [...this._indexData(importedData), ...this.data];
        this.saveData();
        this.renderTable();
      };
      reader.readAsText(file);
    }

    /**
     * given array of data, add index property to each object
     * @param {Array} data 
     * @returns 
     */
    _indexData(data) {
      return data.map((row, i) => ({ ...row, index: i }))
    }

    clear() {
      this.data = [];
      this.saveData();
      this.renderTable();
    }

    /** Add all event listeners */
    _addListeners() {

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
        if(e.target.matches('[contenteditable]')) {
          const rowIndex = parseInt(e.target.closest('tr').dataset.index);
          const field = e.target.dataset.field;
          const rowObj = this.data.find(r => r.index == rowIndex);
          if(rowObj && field) {
            rowObj[field] = e.target.textContent.trim();
            this.saveData();
          }
        }
      }, true);
    }
  }

  const table = new Table('#tableBody', '#searchInput', 'pwdManagerData');
  table.renderTable();

  document.querySelector('#searchInput').addEventListener('input', (e) => {
    table.liveSearch(e.target.value);
  });

  document.querySelector('#addRowBtn').addEventListener('click', () => {
    table.addRow({
      index: table.data.length,
      name: '',
      weblink: '',
      username: '',
      password: '',
      category: '',
      notes: ''
    });
  });

  document.querySelector('#clearBtn').addEventListener('click', () => {
    table.clear();
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
