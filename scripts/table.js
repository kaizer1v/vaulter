import LocalDB from './database.js';

export default class Table {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    this.db = new LocalDB();
    this.data = this.db.load();
    this.render();
  }

  // ========== CORE ACTIONS ==========
  addRow(row = {}) {
    this.db.add(row);
    this.refreshData();
  }

  removeRow(index) {
    this.db.delete(index);
    this.refreshData();
  }

  saveData() {
    this.db.save(this.data);
  }

  loadData() {
    this.data = this.db.load();
    this.render();
  }

  refreshData() {
    this.data = this.db.load();
    this.render();
  }

  // ========== IMPORT / EXPORT ==========
  exportJSON() {
    const jsonStr = JSON.stringify(this.data, null, 2);
    this.downloadFile(jsonStr, 'data.json', 'application/json');
  }

  exportCSV() {
    const headers = ['weblink', 'username', 'password', 'category', 'notes'];
    const csvRows = [headers.join(',')];

    this.data.forEach(row => {
      const values = headers.map(h => `"${(row[h] || '').replace(/"/g, '""')}"`);
      csvRows.push(values.join(','));
    });

    const csvString = csvRows.join('\n');
    this.downloadFile(csvString, 'data.csv', 'text/csv');
  }

  importJSON(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (Array.isArray(parsed)) {
          this.db.save(parsed);
          this.refreshData();
        }
      } catch (e) {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  }

  importCSV(file) {
    const reader = new FileReader();
    reader.onload = () => {
      const parsedData = this.parseCSV(reader.result);
      this.db.save(parsedData);
      this.refreshData();
    };
    reader.readAsText(file);
  }

  parseCSV(csvString) {
    const lines = csvString.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"'));
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] || '';
      });
      return obj;
    });
  }

  downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }

  // ========== UI / EVENT BINDING ==========
  addListeners() {
    const searchInput = document.querySelector("#searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.renderTable(e.target.value);
      });
    }
    
    this.container.querySelector('#addRowBtn')?.addEventListener('click', () => {
      this.addRow({});
    });

    this.container.querySelector('#exportJSONBtn')?.addEventListener('click', () => {
      this.exportJSON();
    });

    this.container.querySelector('#exportCSVBtn')?.addEventListener('click', () => {
      this.exportCSV();
    });

    // this.container.querySelector('#importJSONInput')?.addEventListener('change', (e) => {
    this.container.querySelector('#importFile')?.addEventListener('change', (event) => {
      // if (e.target.files.length) this.importJSON(e.target.files[0]);
      const file = event.target.files[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target.result
        if (file.name.endsWith('.json')) {
          try {
            const data = JSON.parse(content)
            if (Array.isArray(data)) {
              this.tableData = data
              this.render()
              this.saveData()
            } else {
              alert('Invalid JSON format. Should be an array of rows.')
            }
          } catch (err) {
            alert('Failed to parse JSON.')
          }
        } else if (file.name.endsWith('.csv')) {
          this.tableData = this.parseCSV(content)
          this.render()
          this.saveData()
        } else {
          alert('Unsupported file type')
        }
      }
      reader.readAsText(file)
    });

    // this.container.querySelector('#importCSVInput')?.addEventListener('change', (e) => {
    //   if (e.target.files.length) this.importCSV(e.target.files[0]);
    // });
  }

  // ========== RENDER TABLE ==========
  render(filterText = "") {
    // Clear existing table
    this.container.innerHTML = "";

    // Create table element
    const table = document.createElement("table");
    table.classList.add("edit-table");

    // Table headers
    const headers = ["Weblink", "Username", "Password", "Category", "Notes", "Actions"];
    const thead = document.createElement("thead");
    const trHead = document.createElement("tr");

    headers.forEach(header => {
      const th = document.createElement("th");
      th.textContent = header;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    table.appendChild(thead);

    // Filtered data
    let filteredData = this.data.filter(row => {
      if (!filterText) return true;
      return Object.values(row).some(value =>
        String(value).toLowerCase().includes(filterText.toLowerCase())
      );
    });

    // Table body
    const tbody = document.createElement("tbody");

    filteredData.forEach((row, index) => {
      const tr = document.createElement("tr");

      Object.keys(row).forEach(key => {
        const td = document.createElement("td");
        const input = document.createElement("input");
        input.value = row[key];
        input.dataset.index = index;
        input.dataset.key = key;
        input.addEventListener("input", (e) => {
          this.data[index][key] = e.target.value;
          this.db.saveData(this.data);
        });
        td.appendChild(input);
        tr.appendChild(td);
      });

      // Action buttons (Remove)
      const tdActions = document.createElement("td");
      const btnRemove = document.createElement("button");
      btnRemove.textContent = "❌";
      btnRemove.addEventListener("click", () => this.removeRow(index));
      tdActions.appendChild(btnRemove);
      tr.appendChild(tdActions);

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    this.container.appendChild(table);
  }

}
