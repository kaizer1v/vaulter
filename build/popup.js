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
   * Utility function to create a form group and add details to the form
   * @param {array} row
   * @returns {html} node
   */
  // function createForm(row) {
  //   const form = document.createElement('form')
  //   form.classList.add('form')

  //   // if no data, return a message to print
  //   if(row.length == 0) {
  //     const fg_message = document.createElement('div')
  //     fg_message.classList.add('form-group')

  //     const para = document.createElement('p')
  //     para.innerText = 'No data found in the specified range. You might want to add details over to'

  //     const link = document.createElement('a')
  //     const href = 'https://docs.google.com/spreadsheets/d/1fTbsIS0UaEFF2zvw3fNrCzEQsGVMwRy9BRJDtH7X60s/edit?gid=0#gid=0';
  //     link.textContent = 'google sheet'
  //     link.href = href
  //     link.target = '_blank';
      
  //     fg_message.appendChild(para)
  //     fg_message.appendChild(link)
  //     form.appendChild(fg_message)

  //     return form
  //   }

  //   const fg_website = document.createElement('div')
  //   fg_website.classList.add('form-group')
  //   const website = document.createElement('input')
  //   const lbl_website = document.createElement('label')
  //   lbl_website.innerText = 'Website'
  //   website.setAttribute('type', 'text')
  //   website.setAttribute('id', 'website')
  //   website.disabled = true
  //   website.value = row['weblink']
  //   fg_website.appendChild(lbl_website)
  //   fg_website.appendChild(website)

  //   const fg_username = document.createElement('div')
  //   fg_username.classList.add('form-group')
  //   const username = document.createElement('input')
  //   const lbl_username = document.createElement('label')
  //   lbl_username.innerText = 'Username'
  //   username.setAttribute('type', 'text')
  //   username.setAttribute('id', 'username')
  //   username.disabled = true
  //   username.value = row['username']
  //   fg_username.appendChild(lbl_username)
  //   fg_username.appendChild(username)
    
  //   const fg_password = document.createElement('div')
  //   fg_password.classList.add('form-group')
  //   const password = document.createElement('input')
  //   const lbl_password = document.createElement('label')
  //   lbl_password.innerText = 'Password'
  //   password.setAttribute('type', 'text')
  //   password.setAttribute('id', 'password')
  //   password.disabled = true
  //   password.value = row['password']
  //   fg_password.appendChild(lbl_password)
  //   fg_password.appendChild(password)

  //   if(row['category']) {
  //     const fg_category = document.createElement('div')
  //     fg_category.classList.add('form-group')
  //     const category = document.createElement('input')
  //     const lbl_category = document.createElement('label')
  //     lbl_category.innerText = 'Category'
  //     category.setAttribute('type', 'text')
  //     category.setAttribute('id', 'category')
  //     category.disabled = true
  //     category.value = row['category']
  //     fg_category.appendChild(lbl_category)
  //     fg_category.appendChild(category)

  //     form.appendChild(fg_category)
  //   }

  //   if(row['notes']) {
  //     const fg_notes = document.createElement('div')
  //     fg_notes.classList.add('form-group')
  //     const notes = document.createElement('textarea')
  //     const lbl_notes = document.createElement('label')
  //     lbl_notes.innerText = 'Notes'
  //     notes.setAttribute('id', 'notes')
  //     notes.disabled = true
  //     notes.value = row['notes']
  //     fg_notes.appendChild(lbl_notes)
  //     fg_notes.appendChild(notes)

  //     form.appendChild(fg_notes)
  //   }

  //   form.appendChild(fg_website)
  //   form.appendChild(fg_username)
  //   form.appendChild(fg_password)
    

  //   return form
  // }

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
     * Create a generic input/textarea form group
     */
    createField(labelText, value, type = 'input') {
      const fg = document.createElement('div');
      fg.classList.add('form-group');

      const label = document.createElement('label');
      label.innerText = labelText;

      let field;
      if (type === 'textarea') {
        field = document.createElement('textarea');
      } else {
        field = document.createElement('input');
        field.type = type;
      }

      field.disabled = true;
      field.value = value || '';

      fg.appendChild(label);
      fg.appendChild(field);
      return fg
    }

    /**
     * Create an empty form with "no data" message
     */
    createEmptyForm() {
      const form = document.createElement('form');
      form.classList.add('form');

      const fg = document.createElement('div');
      fg.classList.add('form-group');

      const para = document.createElement('p');
      para.innerText = 'No data found in the specified range. You might want to add details over to ';

      const link = document.createElement('a');
      link.href = 'https://docs.google.com/spreadsheets/d/1fTbsIS0UaEFF2zvw3fNrCzEQsGVMwRy9BRJDtH7X60s/edit?gid=0#gid=0';
      link.textContent = 'google sheet';
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

      // Core fields
      form.appendChild(this.createField('Website', row.weblink, 'text'));
      form.appendChild(this.createField('Username', row.username, 'text'));
      form.appendChild(this.createField('Password', row.password, 'text'));

      // Optional fields
      if (row.category) {
        form.appendChild(this.createField('Category', row.category, 'text'));
      }
      if (row.notes) {
        form.appendChild(this.createField('Notes', row.notes, 'textarea'));
      }

      return form
    }
  }

  // trigger when extension popup is opened
  window.onload = () => {
    // 1. TODO - retrieve the key from options page first

    // given the key, retrieve data from local storage
    const data = localStorage.getItem('tableDataKey');
    const parsed_data = JSON.parse(data)['tableData'];

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
        });
        
        // and then return the matched data
        console.log('current weblink =', link);
        console.log('matched data =', matched);
      })
      .then((matched) => {
        // Example fetched data
        const sheetData = [
          { weblink: 'https://example.com', username: 'user1', password: 'pass1', category: 'Work', notes: 'Some notes here' },
          { weblink: 'https://another.com', username: 'user2', password: 'pass2' }
        ];

        // Initialize and render
        const renderer = new FormRenderer('.form-container');
        renderer.render(sheetData);

      });
  };

})();
