// Saves options to chrome.storage
const saveOptions = () => {
  const gsheet_id = document.getElementById('gsheet').value;
  const sheet_range = document.getElementById('range').value;
  // const likesColor = document.getElementById('like').checked;

  chrome.storage.sync.set(
    { 'gsheet_id': gsheet_id, 'sheet_range': sheet_range },
    () => {
      // Update status to let user know options were saved.
      const status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(() => {
        status.textContent = '...';
      }, 750);
    }
  );
};

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = () => {
  chrome.storage.sync.get(
    { 
      'gsheet_id': document.getElementById('gsheet').value,
      'sheet_range': document.getElementById('range').value
    },
    (items) => {
      document.getElementById('gsheet').value = items.gsheet_id;
      document.getElementById('range').value = items.sheet_range;
    }
  );
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);