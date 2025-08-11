import { extractUrlInfo } from './util.js'
import FormRenderer from './forms.js'

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
      console.log('matched data =', matched)
      
      // and then return the matched data
      console.log('current weblink =', link)

      // return sample data
      return [
        {
          weblink: 'https://example.com',
          username: 'john_doe',
          password: 'superSecret123',
          category: 'Social',
          notes: 'Personal account',
        }
      ]
    })
    .then((matched) => {
      // Initialize and render
      const formRenderer = new FormRenderer('.form-container')
      formRenderer.render(matched)
    })
}
