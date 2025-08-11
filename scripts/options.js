import LocalDB from './database.js'
import Table from './table.js'

// import Table from 'table.js'

const db = new LocalDB('pwdManagerData')
const table = new Table('#tableBody', db)

table.addListeners()
table.loadData()

// Optional: Add new row on button click
// document.getElementById('addRowBtn').addEventListener('click', () => {
//   table.addRow()
// })

document.querySelector("#addRowBtn").addEventListener("click", () => table.addRow());
document.querySelector("#exportJsonBtn").addEventListener("click", () => table.exportJSON());
document.querySelector("#exportCsvBtn").addEventListener("click", () => table.exportCSV());

// 5️⃣ Handle file import
document.querySelector("#importFile").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    table.handleImport(file);
  }
});