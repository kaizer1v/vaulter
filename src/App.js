import { useEffect } from 'react'
import Table from './components/Table.jsx'
import TableHeader from './components/TableHeader.jsx'
import './styles/options.css'

export default function App() {

  return (
    <div class="container">
      <div class="section">
        <h2><span></span>Settings</h2>
        <p>Vaulter under the hood settings. Here you can control, view and modify all your web passwords</p>
        <p>Note, the columns marked with (*) below are mandatory to have data for in order for Vaulter to run. The rest of the columns are for your reference and additional details.</p>
        <p>Vaulter does not have access to any of your passwords. This is stored in your browser's local storage. Only you have access to this data.</p>
        <p><b>Important Note</b>Be sure to export and save the data before you clear your browser cache.</p>
      </div>

      <div class="section data-table-container">
        <h2>Your Data</h2>
        <p>Your passwords data</p>

        <div id="info">This is where you'll get info</div>
       
        <TableHeader />
        <Table />


        <div class="section">
          <h2><span></span>Footnotes</h2>
          <p>Built with 🔒 and 🔑 by ©kaizer1v. The repository for this chrome extension is completely open on <a target='_blank' href='https://github.com/kaizer1v/vaulter?ref=extension-settings'>github</a></p>
        </div>
      </div>
    </div>
  )
}