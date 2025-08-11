(function () {
  'use strict';

  /**
   * Function to authenticate using the Chrome Identity API and fetch data from Google Sheets.
   * @param {str} gsheet_id: the url id from google sheets to retrieve login details from
   * @param {str} gsheet_range: the cell range to retrieve details from
   */

  /**
   * Function to extract domain, subdomain, and query parameters from the current tab's URL
   * @param {} - 
   */
  function extractUrlInfo() {
    return new Promise((resolve, reject) => {
      // Use chrome.tabs.query to get the current active tab's URL
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const currentUrl = tabs[0].url;  // Get the current URL of the active tab

        try {
          // Parse the current URL using the URL object
          const url = new URL(currentUrl);
          const urlPattern = /^(https?:\/\/)?(([^.]+)\.)?([a-zA-Z0-9.-]+)\.([a-zA-Z]{2,})(\/[^\?#]*)?(\?[^#]*)?(#.*)?$/;
          const match = currentUrl.match(urlPattern);

          if(!match) {
            console.error('Invalid URL');
            return null;
          }
        
          resolve({
            url: currentUrl,
            protocol: match[1] || null, // Protocol (http:// or https://)
            subdomain: match[3] || null, // Subdomain (e.g., "www", "blog")
            website: match[4], // Website (e.g., "example")
            extension: match[5], // Extension (e.g., "com", "in", "io")
            path: match[6] || null, // Path (e.g., "/path/to/resource")
            params: getQueryParams(match[7]) || null, // Query string (e.g., "?param1=value1&param2=value2")
            hash: match[8] || null // Hash (e.g., "#section")
          });
        } catch (error) {
          reject('Failed to extract URL info');
        }
      });
    });
  }

  /**
   * Utility function to breakdown url parameters into an object
   * @param {string} queryString 
   * @returns key value pair object of parameters
   */
  function getQueryParams(queryString) {
    if(!queryString) return null;
    return queryString
      .slice(1) // Remove the "?"
      .split('&')
      .reduce((params, param) => {
        const [key, value] = param.split('=');
        params[key] = decodeURIComponent(value);
        return params;
      }, {});
  }

  // trigger when extension popup is opened
  window.onload = () => {
    // 1. TODO - retrieve the key from options page first

    // given the key, retrieve data from local storage
    const data = localStorage.getItem('tableDataKey');
    console.log(JSON.parse(data)['tableData']);

    // extract the url information from the current tab
    extractUrlInfo()
      .then(({ website, extension }) => {
        return `${website.toLowerCase()}.${extension.toLowerCase()}`;
      }).then((link) => {
        // extract the domain, subdomain, and query parameters from the url

        // run a match against the data from local storage
        console.log(link);
        
        // and then return the matched data
      });
  };

})();
