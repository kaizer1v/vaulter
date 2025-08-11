// FormRenderer.js
export default class FormRenderer {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector)
  }

  /**
   * Render multiple forms from sheet data.
   * @param {Array<Object>} data
   */
  render(data) {
    this.container.innerHTML = '' // Clear old forms

    if(!data || data.length === 0) {
      this.container.appendChild(this.createEmptyForm())
      return
    }

    data.forEach(row => {
      this.container.appendChild(this.createForm(row))
    })
  }

  /**
    * Create a form group with a label and field.
    * @param {string} label - Field label
    * @param {HTMLElement} field - The input or textarea element
    * @param {boolean} clipboard - Whether to add clipboard icon
   */
  createFormGroup(label, field, clipboard = false) {
    const group = document.createElement('div')
    group.classList.add('form-group')

    const lbl = document.createElement('label')
    lbl.innerText = label
    group.appendChild(lbl)

    const fieldWrapper = document.createElement('div')
    fieldWrapper.classList.add('field-wrapper')
    fieldWrapper.appendChild(field)

    if(clipboard) {
      const copyIcon = document.createElement('span')
      copyIcon.classList.add('copy-icon')
      copyIcon.innerHTML = 'copy'
      copyIcon.title = 'Copy to clipboard'
      copyIcon.addEventListener('click', () => {
        navigator.clipboard.writeText(field.value).then(() => {
          copyIcon.innerHTML = 'copied'
          setTimeout(() => (copyIcon.innerHTML = 'copy'), 1000)
        })
      })
      fieldWrapper.appendChild(copyIcon)
    }

    group.appendChild(fieldWrapper)
    return group
  }

  /**
   * Create an empty form with 'no data' message
   */
  createEmptyForm() {
    const form = document.createElement('form')
    form.classList.add('form')

    const fg = document.createElement('div')
    fg.classList.add('form-group')

    const para = document.createElement('p')
    para.innerText = 'No data found in the specified range. You might want to add details over to '

    const link = document.createElement('a')
    link.href = 'https://docs.google.com/spreadsheets/d/1fTbsIS0UaEFF2zvw3fNrCzEQsGVMwRy9BRJDtH7X60s/edit?gid=0#gid=0'
    link.textContent = 'google sheet'
    link.target = '_blank'

    para.appendChild(link)
    fg.appendChild(para)
    form.appendChild(fg)

    return form
  }

  /**
   * Create a populated form for a row
   */
  createForm(row) {
    const form = document.createElement('form')
    form.classList.add('form')

    if(row.length === 0) {
      const fg_message = document.createElement('div')
      fg_message.classList.add('form-group')

      const para = document.createElement('p')
      para.innerText =
        'No data found in the specified range. You might want to add details over to '

      const link = document.createElement('a')
      link.textContent = 'google sheet'
      link.href =
        'https://docs.google.com/spreadsheets/d/1fTbsIS0UaEFF2zvw3fNrCzEQsGVMwRy9BRJDtH7X60s/edit?gid=0#gid=0'
      link.target = '_blank'

      para.appendChild(link)
      fg_message.appendChild(para)
      form.appendChild(fg_message)
      return form
    }

    // Website
    const website = document.createElement('input')
    website.type = 'text'
    website.id = 'website'
    website.disabled = true
    website.value = row['weblink']
    form.appendChild(this.createFormGroup('Website', website))

    // Username with clipboard
    const username = document.createElement('input')
    username.type = 'text'
    username.id = 'username'
    username.disabled = true
    username.value = row['username']
    form.appendChild(this.createFormGroup('Username', username, true))

    // Password with clipboard
    const password = document.createElement('input')
    password.type = 'text'
    password.id = 'password'
    password.disabled = true
    password.value = row['password']
    form.appendChild(this.createFormGroup('Password', password, true))

    // Optional: Category
    if(row['category']) {
      const category = document.createElement('input')
      category.type = 'text'
      category.id = 'category'
      category.disabled = true
      category.value = row['category']
      form.appendChild(this.createFormGroup('Category', category))
    }

    // Optional: Notes
    if(row['notes']) {
      const notes = document.createElement('textarea')
      notes.id = 'notes'
      notes.disabled = true
      notes.value = row['notes']
      form.appendChild(this.createFormGroup('Notes', notes))
    }

    return form
  }
}
