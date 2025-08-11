export default class LocalDB {
  constructor(storageKey = 'sheetData') {
    this.storageKey = storageKey;
  }

  // Load data from localStorage
  load() {
    const savedData = localStorage.getItem(this.storageKey);
    return savedData ? JSON.parse(savedData) : [];
  }

  // Save data to localStorage
  save(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  // Add new row
  add(row) {
    const data = this.load();
    const newRow = {
      weblink: row.weblink || '',
      username: row.username || '',
      password: row.password || '',
      category: row.category || '',
      notes: row.notes || '',
    };
    data.push(newRow);
    this.save(data);
    return data;
  }

  // Update specific row
  update(index, updatedRow) {
    const data = this.load();
    if (data[index]) {
      data[index] = { ...data[index], ...updatedRow };
      this.save(data);
    }
    return data;
  }

  // Delete row
  delete(index) {
    const data = this.load();
    data.splice(index, 1);
    this.save(data);
    return data;
  }
}
