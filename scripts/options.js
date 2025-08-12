
import Table from './table.js'

const table = new Table('#dataTable', '#searchInput', 'pwdManagerData')
table.renderTable()

document.querySelector("#searchInput").addEventListener("input", (e) => {
  table.search(e.target.value)
})

document.querySelector("#addRowBtn").addEventListener("click", () => {
  table.addRow({
    weblink: "",
    username: "",
    password: "",
    category: "",
    notes: ""
  })
})

document.querySelector("#exportJsonBtn").addEventListener("click", () => {
  const jsonData = table.exportJSON()
  console.log(jsonData)
})

document.querySelector("#exportCsvBtn").addEventListener("click", () => {
  const csvData = table.exportCSV()
  console.log(csvData)
})

document.querySelector("#importFile").addEventListener("change", (e) => {
  const file = e.target.files[0]
  try {
    table.handleImport(file)
  } catch(e) {
    console.error("Error importing file:", e)
  }
})