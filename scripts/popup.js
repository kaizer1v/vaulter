import { extractUrlInfo } from './util.js'
import FormRenderer from './forms.js';

// trigger when extension popup is opened
window.onload = () => {
  // 1. TODO - retrieve the key from options page first

  // given the key, retrieve data from local storage
  const data = localStorage.getItem('tableDataKey')
  const parsed_data = JSON.parse(data)['tableData']

  // extract the url information from the current tab
  extractUrlInfo()
    .then(({ website, extension }) => {
      return `${website.toLowerCase()}.${extension.toLowerCase()}`;
    })
    .then((link) => {
      // extract the domain, subdomain, and query parameters from the url

      // run a match against the data from local storage
      const matched = parsed_data.filter(row => {
        return row[0].toLowerCase === link.toLowerCase()
      })
      
      // and then return the matched data
      console.log('current weblink =', link)
      console.log('matched data =', matched)
    })
    .then((matched) => {
      // Example fetched data
      const sheetData = [
        { weblink: 'https://example.com', username: 'user1', password: 'pass1', category: 'Work', notes: 'Some notes here' },
        { weblink: 'https://another.com', username: 'user2', password: 'pass2' }
      ]

      // Initialize and render
      const renderer = new FormRenderer('.form-container')
      renderer.render(sheetData)

    })
}
