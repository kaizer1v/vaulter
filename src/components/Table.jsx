import { useState } from 'react'
import '../styles/table.css'

export default function Table() {

  const [currData, setData] = useState([])

  return (
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
        {currData.map(data => (
          <tr data-index={data.index}>
            <td contenteditable='true' data-field='name'>${data.name || ''}</td>
            <td contenteditable='true' data-field='weblink'>${data.weblink || ''}</td>
            <td contenteditable='true' data-field='username'>${data.username || ''}</td>
            <td contenteditable='true' data-field='password'>${data.password || ''}</td>
            <td contenteditable='true' data-field='category'>${data.category || ''}</td>
            <td contenteditable='true' data-field='notes'>${data.notes || ''}</td>
            <td><button data-index={data.index} class='remove-btn'>Remove</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}