/**
 * Function to authenticate using the Chrome Identity API and fetch data from Google Sheets.
 * @param {str} gsheet_id: the url id from google sheets to retrieve login details from
 * @param {str} gsheet_range: the cell range to retrieve details from
 */
function authenticateAndFetchData({gsheet_id, sheet_range, curr_url, col_username, col_password, col_weblink}) {
  const SPREADSHEET_ID = gsheet_id;
  const RANGE = sheet_range;
  const SHEETS_API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}`;
  
  // Use the Chrome Identity API to get the OAuth 2.0 token
  chrome.identity.getAuthToken({ interactive: true }, function (token) {

    if(chrome.runtime.lastError) {
      console.error("Authentication error:", chrome.runtime.lastError.message);
      alert("Authentication failed: " + chrome.runtime.lastError.message);
      return;
    }

    // Fetch data from the Google Sheets API using the token
    fetch(SHEETS_API_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      if(!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      // TODO: map the row array to the column names from the config
      const rows = data.values || [];
      const filtered_rows = rows.filter(row => row[parseInt(col_weblink)] && row[parseInt(col_weblink)].toLowerCase() === curr_url)
      const filtered_objs = []
      filtered_rows.map(row => {
        filtered_objs.push({
          'weblink': row[parseInt(col_weblink)],
          'username': row[parseInt(col_username)],
          'password': row[parseInt(col_password)]
        })
      })
      // console.log(filtered_objs)
      return filtered_objs
    })
    .then(displaySheetData)
    .catch((error) => {
      console.error("No matching results found", error.message);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      alert("Failed to fetch data from Google Sheets: " + error.message);
    });
  });
}

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
      const [key, value] = param.split('=')
      params[key] = decodeURIComponent(value)
      return params
    }, {})
}

function getLocalStorageData(key) {
  return new Promise((resolve, reject) => {
    const data = localStorage.getItem(key)
    if(data) {
      resolve(JSON.parse(data))
    } else {
      reject(new Error("No data found in local storage for the provided key"))
    }
  })
}

// function to retrieve data from Google Sheets and display it in the popup
function getFromGSheets() {
  chrome.storage.sync.get(['gsheet_id', 'sheet_range', 'col_weblink', 'col_username', 'col_password'])
  .then((config) => {
    // As the page loads, extract the current tab's domain & extension from the URL
    extractUrlInfo()
      .then(({ website, extension }) => {
        return `${website.toLowerCase()}.${extension.toLowerCase()}`;
      }).then((link) => {
        config['curr_url'] = link
        authenticateAndFetchData(config)
      })
  })
  .catch((error) => {
    console.error("Unable to retrieve configurations, please check options", error.message);
  })
}


export { extractUrlInfo, getLocalStorageData, getQueryParams };