const SPREADSHEET_ID = "1fTbsIS0UaEFF2zvw3fNrCzEQsGVMwRy9BRJDtH7X60s";
const RANGE = "'Accounts'!A1:D135";
const SHEETS_API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}`;

/**
 * Function to authenticate using the Chrome Identity API and fetch data from Google Sheets.
 */
function authenticateAndFetchData() {
  // Use the Chrome Identity API to get the OAuth 2.0 token
  chrome.identity.getAuthToken({ interactive: true }, function (token) {

    if (chrome.runtime.lastError) {
      console.error("Authentication error:", chrome.runtime.lastError.message);
      alert("Authentication failed: " + chrome.runtime.lastError.message);
      return;
    }

    console.log("Authentication successful! Token:", token);

    // Fetch data from the Google Sheets API using the token
    fetch(SHEETS_API_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`API request failed with status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        // Get current tab's url and extract details
        extractUrlInfo()
          .then(({ website }) => {
            const rows = data.values || [];            
            // Filter & return rows that match the extracted website name
            return rows.filter(row => row[0] && row[0].toLowerCase() === website.toLowerCase());
          })
          .then((matchingRows) => {
            // display the set of matching results
            displaySheetData(matchingRows);
          })
          .catch((error) => {
            console.error("No matching results found", error.message);
          })
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

        if (!match) {
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
  const username = document.getElementById("username");
  const password = document.getElementById("pwd");
  const notes = document.getElementById("notes");
  const category = document.getElementById("category");

  if(data && data.length > 0) {
    data.forEach((row) => {
      // create a set of input fields to display details
      username.value = row[1];
      category.value = row[2];
      password.value = row[3];
      notes.value = row[4];
    });
  } else {
    container.innerHTML = "<p>No data found in the specified range. You might want to add details over here...</p>";
  }
}

function getQueryParams(queryString) {
  if (!queryString) return null;
  return queryString
    .slice(1) // Remove the "?"
    .split('&')
    .reduce((params, param) => {
      const [key, value] = param.split('=');
      params[key] = decodeURIComponent(value);
      return params;
    }, {});
}


// Add a click event listener to the "Fetch Data" button
// document.getElementById("fetch-data-btn").addEventListener("click", authenticateAndFetchData);

// doing this on load event
window.onload = () => {
  authenticateAndFetchData()
}
