// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const originalUrl = urlParams.get('url');
const domain = urlParams.get('domain');
const visitCount = parseInt(urlParams.get('count')) || 0;

// Populate the page with site info
document.getElementById('domain').textContent = domain || 'Unknown site';
document.getElementById('visit-count').textContent = visitCount;
document.getElementById('plural').textContent = visitCount === 1 ? '' : 's';

// Load and set a random prompt from storage
async function setRandomPrompt() {
  const data = await chrome.storage.local.get('blockPrompts');
  const prompts = data.blockPrompts || ['Hold on...'];
  const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
  document.querySelector('h1').textContent = randomPrompt;
}

setRandomPrompt();

// Set favicon
const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
document.getElementById('favicon').src = faviconUrl;
document.getElementById('favicon').onerror = function() {
  // Fallback to emoji if favicon fails
  this.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚫</text></svg>';
};

// Handle button clicks
document.getElementById('btn-yes').addEventListener('click', () => {
  // User wants to continue - send message to background script
  chrome.runtime.sendMessage({
    type: 'BLOCK_DECISION',
    allowed: true,
    originalUrl: originalUrl
  });
});

document.getElementById('btn-no').addEventListener('click', () => {
  // User wants to stay focused - send message to background script
  chrome.runtime.sendMessage({
    type: 'BLOCK_DECISION',
    allowed: false,
    originalUrl: originalUrl
  });
});

// Prevent easy escapes
document.addEventListener('keydown', (e) => {
  // Block Escape key (but allow Tab for accessibility)
  if (e.key === 'Escape') {
    e.preventDefault();
  }
});

// Focus the "No" button by default (the safe choice)
document.getElementById('btn-no').focus();

// Notify background that we're on the blocking page
window.addEventListener('beforeunload', () => {
  chrome.runtime.sendMessage({ type: 'LEAVING_BLOCK_PAGE' });
});
