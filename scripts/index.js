import { extractUrlInfo, getLocalStorageData } from './util.js';

// trigger when extension popup is opened
window.onload = () => {
  // 1. TODO - retrieve the key from options page first

  // given the key, retrieve data from local storage
  const data = localStorage.getItem('tableDataKey')
  console.log(JSON.parse(data)['tableData'])

  // extract the url information from the current tab
  extractUrlInfo()
    .then(({ website, extension }) => {
      return `${website.toLowerCase()}.${extension.toLowerCase()}`;
    }).then((link) => {
      // extract the domain, subdomain, and query parameters from the url

      // run a match against the data from local storage
      console.log(link)
      
      // and then return the matched data
    })
}
