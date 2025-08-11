export default class Table {
  constructor(config = {}) {
    this.STORAGE_KEY = config.storageKey || 'tableDataKey'
    this.columnCount = 5
    this.tableData = []

    // DOM references
    this.colSelect = document.getElementById('colCount')
    this.tableHead = document.getElementById('tableHead')
    this.tableBody = document.getElementById('tableBody')
    this.searchInput = document.getElementById('searchInput')
    this.importFileInput = document.getElementById('importFile')
    this.exportJsonBtn = document.getElementById('exportJsonBtn')
    this.exportCsvBtn = document.getElementById('exportCsvBtn')

    // Setup
    this._loadData()
    this._renderTable()
    this._attachListeners()
  }

  _attachListeners() {
    this.searchInput.addEventListener('input', () => this._renderTable())

    this.colSelect.addEventListener('change', () => {
      this.columnCount = parseInt(this.colSelect.value);
      this.tableData = this.tableData.map(row =>
        row.slice(0, this.columnCount)
          .concat(Array(this.columnCount).fill(''))
          .slice(0, this.columnCount)
      );
      this._saveData()
      this._renderTable()
    })

    this.importFileInput.addEventListener('change', (e) => this._handleImport(e))
    this.exportJsonBtn.addEventListener('click', () => this._exportJSON())
    this.exportCsvBtn.addEventListener('click', () => this._exportCSV())
  }

  _saveData() {
    // console.log('saved data =', this.tableData, JSON.stringify({
    //   columnCount: this.columnCount,
    //   tableData: this.tableData
    // }))
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
      columnCount: this.columnCount,
      tableData: this.tableData
    }))
  }

  _loadData() {
    const saved = localStorage.getItem(this.STORAGE_KEY)
    if(saved) {
      const parsed = JSON.parse(saved)
      this.columnCount = parsed.columnCount || 5
      this.tableData = parsed.tableData || []
      this.colSelect.value = this.columnCount
    }
  }

  addRow() {
    const newRow = Array(this.columnCount).fill('')
    this.tableData.unshift(newRow)
    this._saveData()
    this._renderTable()
  }

  _removeRow(index) {
    this.tableData.splice(index, 1)
    this._saveData()
    this._renderTable()
  }

  _renderTable() {
    // this._renderHeaders();

    const searchQuery = this.searchInput.value.toLowerCase()
    const filteredData = this.tableData.filter(row =>
      row.some(cell => cell.toLowerCase().includes(searchQuery))
    )

    this.tableBody.innerHTML = ''
    filteredData.forEach((row, rowIndex) => {
      const tr = document.createElement('tr')
      row.forEach((cell, cellIndex) => {
        const td = document.createElement('td')
        const input = document.createElement('input')
        input.type = 'text'
        input.value = cell
        input.style.width = '90%'
        input.oninput = (e) => {
          const globalIndex = this.tableData.indexOf(row)
          this.tableData[globalIndex][cellIndex] = e.target.value
          this._saveData()
        }
        td.appendChild(input)
        tr.appendChild(td)
      })

      const tdRemove = document.createElement('td')
      const btn = document.createElement('button')
      btn.textContent = '❌'
      btn.classList.add('danger')
      btn.onclick = () => {
        const globalIndex = this.tableData.indexOf(row)
        this._removeRow(globalIndex)
      }
      tdRemove.appendChild(btn)
      tr.appendChild(tdRemove)

      this.tableBody.appendChild(tr)
    })
  }

  _renderHeaders() {
    this.tableHead.innerHTML = ''
    const headRow = document.createElement('tr')

    for(let i = 0; i < this.columnCount; i++) {
      const th = document.createElement('th')
      th.textContent = `Column ${i + 1}`
      headRow.appendChild(th)
    }

    const thRemove = document.createElement('th')
    thRemove.textContent = 'Remove'
    headRow.appendChild(thRemove)

    this.tableHead.appendChild(headRow)
  }

  _handleImport(event) {
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
            this._renderTable()
            this._saveData()
          } else {
            alert('Invalid JSON format. Should be an array of rows.')
          }
        } catch (err) {
          alert('Failed to parse JSON.')
        }
      } else if (file.name.endsWith('.csv')) {
        this.tableData = this._parseCSV(content)
        this._renderTable()
        this._saveData()
      } else {
        alert('Unsupported file type')
      }
    }
    reader.readAsText(file)
  }

  _parseCSV(csvText) {
    const lines = csvText.trim().split('\n')
    return lines.map(line => line.split(','))
  }

  _exportJSON() {
    const jsonData = JSON.stringify(this.tableData, null, 2);
    this._downloadFile('table-data.json', 'application/json', jsonData);
  }

  _exportCSV() {
    const csvData = this.tableData.map(row =>
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
    this._downloadFile('table-data.csv', 'text/csv', csvData);
  }

  _downloadFile(filename, mimeType, content) {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }
}

