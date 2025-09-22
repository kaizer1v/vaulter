import { useState, useEffect } from 'react'
import Table from './components/Table.jsx'
import './styles/options.css'

export default function App() {

  const sampleData = [
    {
      index: 1,
      name: 'Google',
      weblink: 'https://google.com',
      username: 'kaizer1v',
      password: 'password123',
      category: 'Search Engine',
      notes: 'My primary search engine'
    }, {
      index: 2,
      name: 'Facebook',
      weblink: 'https://facebook.com',
      username: 'kaizer1v.fb',
      password: 'fbpassword',
      category: 'Social Media',
      notes: 'Social media account'
    }, {
      index: 3,
      name: 'Twitter',
      weblink: 'https://twitter.com',
      username: 'kaizer1v_tw',
      password: 'twpassword',
      category: 'Social Media',
      notes: 'Another social media account'
    }
  ]

  /**
   * when clicking add row, add an empty row to the table
   *    on edit/change of the contenteditable cells, update the state of the data
   *    on clicking remove button, remove the row from the table and update the state of the
   */
  

  const [currData, setData] = useState(sampleData)
  const [cacheItems, setCacheItems] = useState({})    // for any rows just added to the UI but not yet saved to local storage

  useEffect(() => {
    console.log('cacheItems changed: ', cacheItems)
    // add the new cacheItems to the currData state
    if(Object.keys(cacheItems).length !== 0) {
      setData({...currData, ...cacheItems})
    }
  }, [cacheItems])
  
  return (
    <div className="container">
      <div className="section">
        <h2><span></span>Settings</h2>
        <p>Vaulter under the hood settings. Here you can control, view and modify all your web passwords</p>
        <p>Note, the columns marked with (*) below are mandatory to have data for in order for Vaulter to run. The rest of the columns are for your reference and additional details.</p>
        <p>Vaulter does not have access to any of your passwords. This is stored in your browser's local storage. Only you have access to this data.</p>
        <p><b>Important Note</b>Be sure to export and save the data before you clear your browser cache.</p>
      </div>

      <div className="section data-table-container">
        <h2>Your Data</h2>
        <p>Your passwords data</p>

        <div id="info">This is where you'll get info</div>
       
        <div className="controls">
          <div className="controls-left">
            <button id="addRowBtn" onClick={ () => setCacheItems({
              index: '',
              name: '',
              weblink: '',
              username: '',
              password: '',
              category: '',
              notes: ''
              }) }>Add Row
            </button>
            <input type="text" id="searchInput" placeholder="Search table..." />
            <div style={{marginBottom: '1rem'}}>
              <p>Import from existing file</p>
              <input type="file" id="importFile" accept=".json,.csv" />
            </div>
          </div>

          <div className="controls-right">
            <div style={{marginBottom: '1rem', display: 'block', float: 'right'}}>
              <button id="exportJsonBtn">Export JSON</button>
              <button id="exportCsvBtn">Export CSV</button>
              <button id="clearBtn">Clear Table</button>
            </div>
          </div>
        </div>

        <Table data={currData} />

        <div className="section">
          <h2><span></span>Footnotes</h2>
          <p>Built with 🔒 and 🔑 by ©kaizer1v. The repository for this chrome extension is completely open on <a target='_blank' href='https://github.com/kaizer1v/vaulter?ref=extension-settings'>github</a></p>
        </div>
      </div>
    </div>
  )
}