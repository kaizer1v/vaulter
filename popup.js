// Replace with your Google Sheets spreadsheet ID and desired range
const SPREADSHEET_ID = "1fTbsIS0UaEFF2zvw3fNrCzEQsGVMwRy9BRJDtH7X60s"; // Replace with the actual spreadsheet ID
const RANGE = "'Accounts'!A1:D135"; // Replace with the range you want to fetch

// Google Sheets API URL
const SHEETS_API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}`;
// https://sheets.googleapis.com/v4/spreadsheets/1fTbsIS0UaEFF2zvw3fNrCzEQsGVMwRy9BRJDtH7X60s/values/Sheet1!A1:D10

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
        console.log("Google Sheets Data:", data);

        // Get current tab's url
        extractUrlInfo()
          .then(({ url, website, extension, subdomain, params }) => {
            // get url deetails
            console.log('url info -->', url, website, extension, subdomain, params);
            console.log(data)

            const rows = data.values || [];
            // Filter rows to only those that match the extracted domain
            const matchingRows = rows.filter(row => row[0] && row[0].toLowerCase() === website.toLowerCase());

            console.log('matching details from sheet ==>', matchingRows)

            displaySheetData(matchingRows);
            
            return matchingRows;
          })
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        alert("Failed to fetch data from Google Sheets: " + error.message);
      });
  });
}

// Function to extract domain, subdomain, and query parameters from the current tab's URL
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
  const container = document.getElementById("data-container");
  container.innerHTML = ""; // Clear any previous data

  if(data && data.length > 0) {
    data.forEach((row) => {
      const rowDiv = document.createElement("div");
      rowDiv.textContent = row.join(", "); // Combine row data into a comma-separated string
      container.appendChild(rowDiv);
    });
  } else {
    container.textContent = "No data found in the specified range.";
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
document.getElementById("fetch-data-btn").addEventListener("click", authenticateAndFetchData);