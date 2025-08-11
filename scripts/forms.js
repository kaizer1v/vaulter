// FormRenderer.js
export default class FormRenderer {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
  }

  /**
   * Render multiple forms from sheet data.
   * @param {Array<Object>} data
   */
  render(data) {
    this.container.innerHTML = ''; // Clear old forms

    if (!data || data.length === 0) {
      this.container.appendChild(this.createEmptyForm());
      return;
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
    return fg;
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

    return form;
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

    return form;
  }
}
