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
        return params
      }, {})
  }

  // FormRenderer.js
  class FormRenderer {
    constructor(containerSelector) {
      this.container = document.querySelector(containerSelector);
    }

    /**
     * Render multiple forms from sheet data.
     * @param {Array<Object>} data
     */
    render(data) {
      this.container.innerHTML = ''; // Clear old forms

      if(!data || data.length === 0) {
        this.container.appendChild(this.createEmptyForm());
        return
      }

      data.forEach(row => {
        this.container.appendChild(this.createForm(row));
      });
    }

    /**
      * Create a form group with a label and field.
      * @param {string} label - Field label
      * @param {HTMLElement} field - The input or textarea element
      * @param {boolean} clipboard - Whether to add clipboard icon
     */
    createFormGroup(label, field, clipboard = false) {
      const group = document.createElement('div');
      group.classList.add('form-group');

      const lbl = document.createElement('label');
      lbl.innerText = label;
      group.appendChild(lbl);

      const fieldWrapper = document.createElement('div');
      fieldWrapper.classList.add('field-wrapper');
      fieldWrapper.appendChild(field);

      if(clipboard) {
        const copyIcon = document.createElement('span');
        // const copyIcon = document.createElement('svg')
        // const use = document.createElement('use')
        // use.setAttribute('href', '../assets/clipboard.svg')
        // copyIcon.appendChild(use)
        copyIcon.classList.add('copy', 'icon');
        copyIcon.innerHTML = ' copy';
        copyIcon.title = 'Copy to clipboard';
        copyIcon.addEventListener('click', () => {
          navigator.clipboard.writeText(field.value).then(() => {
            copyIcon.innerHTML = ' copied';
            setTimeout(() => (copyIcon.innerHTML = ' copy'), 1000);
          });
        });
        fieldWrapper.appendChild(copyIcon);
      }

      group.appendChild(fieldWrapper);
      return group
    }

    /**
     * Create an empty form with 'no data' message
     * TODO: trigger to open the options page to add data
     * @returns {HTMLElement} - The empty form element
     */
    createEmptyForm() {
      const form = document.createElement('form');
      form.classList.add('form');

      const fg = document.createElement('div');
      fg.classList.add('form-group');

      const para = document.createElement('p');
      para.innerText = 'No data found in the specified range. You might want to add details over to ';

      const link = document.createElement('a');
      link.href = 'options.html';
      link.textContent = 'options page';
      link.target = '_blank';

      para.appendChild(link);
      fg.appendChild(para);
      form.appendChild(fg);

      return form
    }

    /**
     * Create a populated form for a row
     */
    createForm(row) {
      const form = document.createElement('form');
      form.classList.add('form');

      if(row.length === 0) {
        return this.createEmptyForm()
      }

      // Website
      const website = document.createElement('input');
      website.type = 'text';
      website.id = 'website';
      website.disabled = true;
      website.value = row['weblink'];
      form.appendChild(this.createFormGroup('Website', website));

      // Username with clipboard
      const username = document.createElement('input');
      username.type = 'text';
      username.id = 'username';
      username.disabled = true;
      username.value = row['username'];
      form.appendChild(this.createFormGroup('Username', username, true));

      // Password with clipboard
      const password = document.createElement('input');
      password.type = 'password';
      password.id = 'password';
      password.disabled = true;
      password.value = row['password'];
      form.appendChild(this.createFormGroup('Password', password, true));

      // Optional: Category
      if(row['category']) {
        const category = document.createElement('input');
        category.type = 'text';
        category.id = 'category';
        category.disabled = true;
        category.value = row['category'];
        form.appendChild(this.createFormGroup('Category', category));
      }

      // Optional: Notes
      if(row['notes']) {
        const notes = document.createElement('textarea');
        notes.id = 'notes';
        notes.disabled = true;
        notes.value = row['notes'];
        form.appendChild(this.createFormGroup('Notes', notes));
      }

      return form
    }
  }

  // trigger when extension popup is opened
  window.onload = () => {
    // 1. TODO - retrieve the key from options page first

    // given the key, retrieve data from local storage
    const data = localStorage.getItem('pwdManagerData');
    const parsed_data = JSON.parse(data);

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
        });

        console.log('matched data =', matched, 'current weblink =', link);

        return matched
      })
      .then((matched) => {
        // Initialize and render
        const formRenderer = new FormRenderer('.form-container');
        formRenderer.render(matched);
      });
  };

})();
