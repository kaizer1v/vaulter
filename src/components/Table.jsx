/**
 * render the table whenever the loginData updates.
 * on what action should `setLoginData` be called?
 *  - when user edits any cell
 * 
 * whenever the loginData updates, synch it with the localStorage
 */

import { useState, useEffect } from 'react'
import '../styles/table.css'
import '../styles/table-header.css'

export default function Table() {
  const [loginData, setLoginData] = useState(() => {
    return localStorage.getItem('loginData') ? JSON.parse(localStorage.getItem('loginData')) : [{
      index: 0,
      name: '',
      weblink: '',
      username: '',
      password: '',
      category: '',
      notes: ''
    }]
  })

  function handleDelete(index) {
    setLoginData(currData => {
      return currData.filter(d => d.index !== parseInt(index))
    })
  }

  function handleAdd() {
    // add empty object with new index
    setLoginData(currData => {
      const newIndex = currData.length > 0 ? currData[currData.length - 1].index + 1 : 0
      return [{
        index: newIndex,
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
    console.log('updateing data')
    setLoginData(currData => {
     return currData.map(d => {
        if(d.index === parseInt(index))
          return { ...d, [field]: value } // return a new object instead of mutating the existing one
        return d
      })
    })
  }

  function handleSearch(event) {
    const query = event.target.value.toLowerCase()
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

  useEffect(() => {
    // sync the loginData with localStorage
    console.log('syncing with localStorage')
    localStorage.setItem('loginData', JSON.stringify(loginData))
  }, [loginData])


  return (
    <>
      <div class="controls">
        <div class="controls-left">
          <button onClick={handleAdd} id="addRowBtn">Add Row</button>
          <input onInput={handleSearch} type="text" id="searchInput" placeholder="Search table..." />
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
              <td><button data-index={data.index} class='remove-btn' onClick={ e => handleDelete(e.target.dataset.index) }>Remove</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}