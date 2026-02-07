// Load and display total blocks for today
async function loadStats() {
  const data = await chrome.storage.local.get('counters');
  const counters = data.counters || {};
  const total = Object.values(counters).reduce((sum, c) => sum + c.count, 0);

  document.getElementById('total-blocks').textContent = total;
}

loadStats();

// Button event listeners
document.getElementById('search-btn').addEventListener('click', () => {
  window.location.href = 'https://www.google.com';
});

document.getElementById('settings-btn').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});
