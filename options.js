// Load settings when page opens
document.addEventListener('DOMContentLoaded', loadSettings);

// Add domain button
document.getElementById('add-btn').addEventListener('click', addDomain);

// Allow Enter key to add domain
document.getElementById('domain-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addDomain();
  }
});

// Load blocked domains and stats
async function loadSettings() {
  const data = await chrome.storage.local.get(['blockedDomains', 'counters', 'blockPrompts']);
  const blockedDomains = data.blockedDomains || [];
  const counters = data.counters || {};
  const blockPrompts = data.blockPrompts || [];

  // Update stats
  updateStats(blockedDomains, counters);

  // Display blocked domains
  displayBlockedDomains(blockedDomains, counters);

  // Display prompts
  displayPrompts(blockPrompts);
}

// Update statistics display
function updateStats(blockedDomains, counters) {
  const totalVisits = Object.values(counters).reduce((sum, c) => sum + c.count, 0);
  document.getElementById('total-visits').textContent = totalVisits;
  document.getElementById('sites-count').textContent = blockedDomains.length;
}

// Display list of blocked domains
function displayBlockedDomains(blockedDomains, counters) {
  const list = document.getElementById('blocked-list');

  if (blockedDomains.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🌱</div>
        <p>No sites blocked yet. Add one above to get started!</p>
      </div>
    `;
    return;
  }

  list.innerHTML = '';

  blockedDomains.forEach(domain => {
    const visitCount = counters[domain]?.count || 0;
    const item = document.createElement('li');
    item.className = 'blocked-item';
    item.innerHTML = `
      <div class="domain-info">
        <img class="favicon" src="https://www.google.com/s2/favicons?domain=${domain}&sz=32" alt="${domain}">
        <span class="domain-name">${domain}</span>
        <span class="domain-stats">${visitCount} visit${visitCount === 1 ? '' : 's'} today</span>
      </div>
      <button class="btn-remove" data-domain="${domain}">Remove</button>
    `;

    // Add remove button listener
    item.querySelector('.btn-remove').addEventListener('click', () => removeDomain(domain));

    list.appendChild(item);
  });
}

// Add a new blocked domain
async function addDomain() {
  const input = document.getElementById('domain-input');
  let domain = input.value.trim().toLowerCase();

  // Validate input
  if (!domain) {
    showError('Please enter a domain');
    return;
  }

  // Clean up domain (remove protocol, www, trailing slash)
  domain = domain
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .split('/')[0]; // Take only the domain part

  // Basic validation
  if (!domain.includes('.')) {
    showError('Please enter a valid domain (e.g., example.com)');
    return;
  }

  // Get current blocked domains
  const data = await chrome.storage.local.get('blockedDomains');
  const blockedDomains = data.blockedDomains || [];

  // Check if already blocked
  if (blockedDomains.includes(domain)) {
    showError('This site is already blocked');
    return;
  }

  // Add to list
  blockedDomains.push(domain);
  await chrome.storage.local.set({ blockedDomains });

  // Clear input
  input.value = '';

  // Show success
  showSuccess(`Added ${domain} to blocked list`);

  // Reload settings
  loadSettings();

  // Update badge
  chrome.runtime.sendMessage({ type: 'UPDATE_BADGE' });
}

// Remove a blocked domain
async function removeDomain(domain) {
  if (!confirm(`Remove ${domain} from blocked list?`)) {
    return;
  }

  const data = await chrome.storage.local.get('blockedDomains');
  const blockedDomains = data.blockedDomains || [];

  // Remove from list
  const index = blockedDomains.indexOf(domain);
  if (index > -1) {
    blockedDomains.splice(index, 1);
  }

  await chrome.storage.local.set({ blockedDomains });

  // Show success
  showSuccess(`Removed ${domain} from blocked list`);

  // Reload settings
  loadSettings();

  // Update badge
  chrome.runtime.sendMessage({ type: 'UPDATE_BADGE' });
}

// Show success message
function showSuccess(message) {
  const el = document.getElementById('success-message');
  el.textContent = message;
  el.style.display = 'block';

  setTimeout(() => {
    el.style.display = 'none';
  }, 3000);
}

// Show error message
function showError(message) {
  const el = document.getElementById('error-message');
  el.textContent = message;
  el.style.display = 'block';

  setTimeout(() => {
    el.style.display = 'none';
  }, 3000);
}

// ===== PROMPTS MANAGEMENT =====

// Add prompt button
document.getElementById('add-prompt-btn').addEventListener('click', addPrompt);

// Allow Enter key to add prompt
document.getElementById('prompt-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addPrompt();
  }
});

// Display list of prompts
function displayPrompts(prompts) {
  const list = document.getElementById('prompts-list');

  if (prompts.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">💬</div>
        <p>No prompts yet. Add one above to get started!</p>
      </div>
    `;
    return;
  }

  list.innerHTML = '';

  prompts.forEach(prompt => {
    const item = document.createElement('li');
    item.className = 'blocked-item';
    item.innerHTML = `
      <div class="domain-info">
        <span class="domain-name">"${prompt}"</span>
      </div>
      <button class="btn-remove" data-prompt="${prompt}">Remove</button>
    `;

    // Add remove button listener
    item.querySelector('.btn-remove').addEventListener('click', () => removePrompt(prompt));

    list.appendChild(item);
  });
}

// Add a new prompt
async function addPrompt() {
  const input = document.getElementById('prompt-input');
  let prompt = input.value.trim();

  // Validate input
  if (!prompt) {
    showError('Please enter a prompt message');
    return;
  }

  // Ensure it ends with "..." if it doesn't already
  if (!prompt.endsWith('...') && !prompt.endsWith('!') && !prompt.endsWith('?')) {
    prompt += '...';
  }

  // Get current prompts
  const data = await chrome.storage.local.get('blockPrompts');
  const blockPrompts = data.blockPrompts || [];

  // Check if already exists
  if (blockPrompts.includes(prompt)) {
    showError('This prompt already exists');
    return;
  }

  // Add to list
  blockPrompts.push(prompt);
  await chrome.storage.local.set({ blockPrompts });

  // Clear input
  input.value = '';

  // Show success
  showSuccess(`Added prompt: "${prompt}"`);

  // Reload settings
  loadSettings();
}

// Remove a prompt
async function removePrompt(prompt) {
  const data = await chrome.storage.local.get('blockPrompts');
  const blockPrompts = data.blockPrompts || [];

  // Don't allow removing the last prompt
  if (blockPrompts.length === 1) {
    showError('You must have at least one prompt');
    return;
  }

  if (!confirm(`Remove prompt: "${prompt}"?`)) {
    return;
  }

  // Remove from list
  const index = blockPrompts.indexOf(prompt);
  if (index > -1) {
    blockPrompts.splice(index, 1);
  }

  await chrome.storage.local.set({ blockPrompts });

  // Show success
  showSuccess(`Removed prompt: "${prompt}"`);

  // Reload settings
  loadSettings();
}
