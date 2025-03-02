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
      console.log(filtered_objs)
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
 * Function to display the fetched data in the popup UI.
 * @param {Object} data - The response data from the Google Sheets API.
 */
function displaySheetData(data) {
  const container = document.querySelector(".form-container");

  if(data && data.length > 0) {
    data.forEach((row) => {
      const form = createForm(row);
      container.appendChild(form);
    });
  } else {
    const form = createForm([]);
    container.appendChild(form);
  }
}

/**
 * Utility function to create a form group and add details to the form
 * @param {array} row
 * @returns {html} node
 */
function createForm(row) {
  const form = document.createElement('form')
  form.classList.add('form')

  // if no data, return a message to print
  if(row.length == 0) {
    const fg_message = document.createElement('div')
    fg_message.classList.add('form-group')

    const para = document.createElement('p')
    para.innerText = 'No data found in the specified range. You might want to add details over to'

    const link = document.createElement('a')
    const href = 'https://docs.google.com/spreadsheets/d/1fTbsIS0UaEFF2zvw3fNrCzEQsGVMwRy9BRJDtH7X60s/edit?gid=0#gid=0';
    link.textContent = 'google sheet'
    link.href = href
    link.target = '_blank';
    
    fg_message.appendChild(para)
    fg_message.appendChild(link)
    form.appendChild(fg_message)

    return form
  }

  const fg_website = document.createElement('div')
  fg_website.classList.add('form-group')
  const website = document.createElement('input')
  const lbl_website = document.createElement('label')
  lbl_website.innerText = 'Website'
  website.setAttribute('type', 'text')
  website.setAttribute('id', 'website')
  website.disabled = true
  website.value = row['weblink']
  fg_website.appendChild(lbl_website)
  fg_website.appendChild(website)

  const fg_username = document.createElement('div')
  fg_username.classList.add('form-group')
  const username = document.createElement('input')
  const lbl_username = document.createElement('label')
  lbl_username.innerText = 'Username'
  username.setAttribute('type', 'text')
  username.setAttribute('id', 'username')
  username.disabled = true
  username.value = row['username']
  fg_username.appendChild(lbl_username)
  fg_username.appendChild(username)
  
  const fg_password = document.createElement('div')
  fg_password.classList.add('form-group')
  const password = document.createElement('input')
  const lbl_password = document.createElement('label')
  lbl_password.innerText = 'Password'
  password.setAttribute('type', 'text')
  password.setAttribute('id', 'password')
  password.disabled = true
  password.value = row['password']
  fg_password.appendChild(lbl_password)
  fg_password.appendChild(password)

  if(row['category']) {
    const fg_category = document.createElement('div')
    fg_category.classList.add('form-group')
    const category = document.createElement('input')
    const lbl_category = document.createElement('label')
    lbl_category.innerText = 'Category'
    category.setAttribute('type', 'text')
    category.setAttribute('id', 'category')
    category.disabled = true
    category.value = row['category']
    fg_category.appendChild(lbl_category)
    fg_category.appendChild(category)

    form.appendChild(fg_category)
  }

  if(row['notes']) {
    const fg_notes = document.createElement('div')
    fg_notes.classList.add('form-group')
    const notes = document.createElement('textarea')
    const lbl_notes = document.createElement('label')
    lbl_notes.innerText = 'Notes'
    notes.setAttribute('id', 'notes')
    notes.disabled = true
    notes.value = row['notes']
    fg_notes.appendChild(lbl_notes)
    fg_notes.appendChild(notes)

    form.appendChild(fg_notes)
  }

  form.appendChild(fg_website)
  form.appendChild(fg_username)
  form.appendChild(fg_password)
  

  return form
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

// doing this on load event
window.onload = () => {
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
