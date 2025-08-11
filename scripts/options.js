
import Table from './table.js'

// import Table from 'table.js'

// const db = new LocalDB('pwdManagerData')
const table = new Table('#dataTable', '#searchInput', 'pwdManagerData');

table.renderTable()

document.querySelector("#searchInput").addEventListener("input", (e) => {
  table.search(e.target.value);
});

document.querySelector("#addRowBtn").addEventListener("click", () => {
  table.addRow({
    weblink: "",
    username: "",
    password: "",
    category: "",
    notes: ""
  });
});

document.querySelector("#exportJsonBtn").addEventListener("click", () => {
  const jsonData = table.exportJSON();
  console.log(jsonData);
});

// 7. Export CSV
document.querySelector("#exportCsvBtn").addEventListener("click", () => {
  const csvData = table.exportCSV();
  console.log(csvData);
});

// 8. Import JSON
document.querySelector("#importFile").addEventListener("change", (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (event) => {
    // table.handleImport(event.target.result);
    table.handleImport(event);
  };
  reader.readAsText(file);
});