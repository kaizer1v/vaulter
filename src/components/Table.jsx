import { useState, useEffect } from 'react'
import './table.css'

export default function Table() {

  const [loginData, setLoginData] = useState(() => {
    return localStorage.getItem('loginData') ? JSON.parse(localStorage.getItem('loginData')) : [{
      index: crypto.randomUUID(),
      name: '',
      weblink: '',
      username: '',
      password: '',
      category: '',
      notes: ''
    }]
  })

  function handleDeleteRow(index) {
    setLoginData(currData => {
      return currData.filter(d => d.index !== index)
    })
  }

  function handleAddRow() {
    // add empty object with new index
    setLoginData(currData => {
      return [{
        index: crypto.randomUUID(),
        name: '',
        weblink: '',
        username: '',
        password: '',
        category: '',
        notes: ''
      }, ...currData]
    })

    // bring the focus to the first cell of the new row
    const firstCell = document.querySelector('#dataTable tbody tr:first-child td:first-child')
    if(firstCell) {
      firstCell.focus()
    }
  }

  function handleDataUpdate(index, field, value) {
    setLoginData(currData => {
     return currData.map(d => {
        if(d.index === index)
          return { ...d, [field]: value } // return a new object instead of mutating the existing one
        return d
      })
    })
  }

  function handleSearch(query) {
    const rows = document.querySelectorAll('#dataTable tbody tr')
    rows.forEach(row => {
      const cells = row.querySelectorAll('td')
      const match = Array.from(cells).some(cell => cell.innerText.toLowerCase().includes(query))
      if(match) {
        row.style.display = ''
      } else {
        row.style.display = 'none'
      }
    })
  }

  function handleExport(format) {
    if(format === 'csv') {
      exportCSV(loginData)
    } else if(format === 'json') {
      exportJSON(loginData)
    }
    
    /** Export to CSV */
    function exportCSV(data, sep=',') {
      if(data.length === 0) return
      const headers = Object.keys(data[0])
      const csvRows = [headers.join(sep)]
      data.forEach(row => {
        csvRows.push(headers.map(h => `${row[h] || ''}`).join(sep))
      })
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
      _downloadFile(blob, 'vaulter_login_data.csv')
    }

    /** Export to JSON */
    function exportJSON(data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      _downloadFile(blob, 'vaulter_login_data.json')
    }

    /** Helper to download file */
    function _downloadFile(blob, filename) {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = filename
      a.click()
    }
  }

  function handleImport(file) {
    if(!file) return
    if(file.name.endsWith('.json') || file.name.endsWith('.csv')) {
      try {
        let importedData = []
        const reader = new FileReader()
        reader.onload = () => {
          if(file.name.endsWith('.json')) importedData = _parseJSON(reader.result)
          else if(file.name.endsWith('.csv')) {
            const columnMapping = {
              'name': 'Name',
              'weblink': 'Weblink',
              'username': 'Username',
              'password': 'Password',
              'category': 'Category',
              'description': 'Description'
            }
            importedData = _parseCSV(reader.result)
            importedData.forEach(row => {
              for(const key in columnMapping) {
                if(row[columnMapping[key]] !== undefined) {
                  row[key] = row[columnMapping[key]]
                  delete row[columnMapping[key]]
                }
              }
            })
          }
          
          setLoginData(currData => {
            return [..._indexData(importedData), ...currData]
          })
        }
        reader.readAsText(file)
      } catch(err) { alert('Failed to parse CSV or JSON.') }
    } else {
      alert('Unsupported file type')
    }

    /** Parse CSV string into objects */
    function _parseCSV(csvText) {
      const lines = csvText.trim().replaceAll('"', '').split('\n')
      const headers = lines.shift().split(',')
      return lines.map(line => {
        const values = line.split(',')
        const obj = {}
        headers.forEach((h, i) => obj[h.trim()] = values[i]?.trim() || '')
        return obj
      })
    }

    /** Parse JSON string into objects */
    function _parseJSON(jsonText) {
      try {
        const parsed = JSON.parse(jsonText)
        return Array.isArray(parsed) ? parsed : []
      } catch (e) {
        alert('Invalid JSON')
        return []
      }
    }

    const _indexData = (data) => data.map((row, i) => ({ ...row, index: crypto.randomUUID() }) )
  }

  function handleClear() {
    if(window.confirm('Are you sure you want to clear the entire table? This action cannot be undone.')) {
      setLoginData([])
    }
  }

  useEffect(() => {
    // sync the loginData with localStorage
    localStorage.setItem('loginData', JSON.stringify(loginData))
  }, [loginData])


  return (
    <>
      <div class="controls">
        <div class="controls-left">
          <button onClick={handleAddRow} id="addRowBtn">Add Row</button>
          <input onInput={ e => handleSearch(e.target.value.toLowerCase()) } type="text" id="searchInput" placeholder="Search table..." />
          <div style={{marginBottom: '1rem'}}>
            <p>Import from existing file</p>
            <input onChange={(e) => handleImport(e.target.files[0])} type="file" id="importFile" accept=".json,.csv" />
          </div>
        </div>

        <div class="controls-right">
          <div style={{marginBottom: '1rem', display: 'block', float: 'right'}}>
            <button onClick={() => handleExport('json')} id="exportJsonBtn">Export JSON</button>
            <button onClick={() => handleExport('csv')} id="exportCsvBtn">Export CSV</button>
            <button onClick={handleClear} id="clearBtn">Clear Table</button>
          </div>
        </div>
      </div>
      
      <table id="dataTable">
        <thead id="tableHead">
          <tr>
            <th>Name</th>
            <th>Weblink (*)</th>
            <th>Username / Email (*)</th>
            <th>Password (*)</th>
            <th>Category</th>
            <th>Notes</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody id="tableBody">
          {loginData.map(data => (
            <tr key={data.index} data-index={data.index} > 
              <td contentEditable='true' data-field='name' onBlur={ e => handleDataUpdate(e.target.parentElement.dataset.index, e.target.dataset.field, e.target.innerText)}>{data.name || ''}</td>
              <td contentEditable='true' data-field='weblink' onBlur={ e => handleDataUpdate(e.target.parentElement.dataset.index, e.target.dataset.field, e.target.innerText)}>{data.weblink || ''}</td>
              <td contentEditable='true' data-field='username' onBlur={ e => handleDataUpdate(e.target.parentElement.dataset.index, e.target.dataset.field, e.target.innerText)}>{data.username || ''}</td>
              <td contentEditable='true' data-field='password' onBlur={ e => handleDataUpdate(e.target.parentElement.dataset.index, e.target.dataset.field, e.target.innerText)}>{data.password || ''}</td>
              <td contentEditable='true' data-field='category' onBlur={ e => handleDataUpdate(e.target.parentElement.dataset.index, e.target.dataset.field, e.target.innerText)}>{data.category || ''}</td>
              <td contentEditable='true' data-field='notes' onBlur={ e => handleDataUpdate(e.target.parentElement.dataset.index, e.target.dataset.field, e.target.innerText)}>{data.notes || ''}</td>
              <td><button data-index={data.index} class='remove-btn' onClick={ e => handleDeleteRow(e.target.dataset.index) }>Remove</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}