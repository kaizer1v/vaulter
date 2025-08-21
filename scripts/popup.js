import { extractUrlInfo } from './util.js'
import FormRenderer from './forms.js'

// trigger when extension popup is opened
window.onload = () => {
  // 1. TODO - retrieve the key from options page first

  // given the key, retrieve data from local storage
  const data = localStorage.getItem('pwdManagerData')
  const parsed_data = JSON.parse(data)

  // extract the url information from the current tab
  extractUrlInfo()
    .then(({ website, extension }) => {
      return `${website.toLowerCase()}.${extension.toLowerCase()}`
    })
    .then((link) => {
      // extract the domain, subdomain, and query parameters from the url

      // run a match against the data from local storage
      const matched = parsed_data.filter(row => {
        return row['weblink'].toLowerCase().includes(link.toLowerCase())
      })

      console.log('matched data =', matched, 'current weblink =', link)

      return matched
    })
    .then((matched) => {
      // Initialize and render
      const formRenderer = new FormRenderer('.form-container')
      formRenderer.render(matched)
    })
}
