// Replace with your Google Sheets spreadsheet ID and desired range
const SPREADSHEET_ID = "1fTbsIS0UaEFF2zvw3fNrCzEQsGVMwRy9BRJDtH7X60s"; // Replace with the actual spreadsheet ID
const RANGE = "'Accounts'!A1:D10"; // Replace with the range you want to fetch

// Google Sheets API URL
const SHEETS_API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}`;
// https://sheets.googleapis.com/v4/spreadsheets/1fTbsIS0UaEFF2zvw3fNrCzEQsGVMwRy9BRJDtH7X60s/values/Accounts!A1:D10

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
    console.log("SHEETS URL:", token);

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

        // Display the fetched data in the popup
        displaySheetData(data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        alert("Failed to fetch data from Google Sheets: " + error.message);
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

  if (data && data.values && data.values.length > 0) {
    data.values.forEach((row) => {
      const rowDiv = document.createElement("div");
      rowDiv.textContent = row.join(", "); // Combine row data into a comma-separated string
      container.appendChild(rowDiv);
    });
  } else {
    container.textContent = "No data found in the specified range.";
  }
}

// Add a click event listener to the "Fetch Data" button
document.getElementById("fetch-data-btn").addEventListener("click", authenticateAndFetchData);
