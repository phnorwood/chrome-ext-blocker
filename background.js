// Track which tabs are currently on blocked sites to avoid blocking internal navigation
const tabsOnBlockedSites = new Set();
// Track tabs that are currently on the blocking page
const tabsOnBlockingPage = new Set();

// Listen for navigation events
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  // Only handle main frame navigation (not iframes)
  if (details.frameId !== 0) return;

  // Ignore navigation to our own extension pages
  if (details.url.startsWith(chrome.runtime.getURL(''))) {
    return;
  }

  try {
    const url = new URL(details.url);
    const domain = url.hostname;

    // Get blocked domains from storage
    const data = await chrome.storage.local.get(['blockedDomains', 'counters']);
    const blockedDomains = data.blockedDomains || [];

    // Check if this domain is blocked
    const isBlocked = blockedDomains.some(blocked =>
      domain === blocked || domain.endsWith('.' + blocked)
    );

    if (!isBlocked) {
      // Remove from tracking if navigating away from blocked site
      tabsOnBlockedSites.delete(details.tabId);
      tabsOnBlockingPage.delete(details.tabId);
      return;
    }

    // Check if this is internal navigation (already on blocked site)
    if (tabsOnBlockedSites.has(details.tabId)) {
      // Allow internal navigation without prompting
      return;
    }

    // Check if we're already on the blocking page for this tab
    if (tabsOnBlockingPage.has(details.tabId)) {
      return;
    }

    // This is an initial navigation to a blocked site - redirect to blocking page
    console.log('Blocking navigation to:', domain);

    // Mark this tab as being on the blocking page
    tabsOnBlockingPage.add(details.tabId);

    // Increment visit counter BEFORE redirecting
    await incrementCounter(domain);

    // Get current visit count for display
    const counters = await getCounters();
    const visitCount = counters[domain]?.count || 0;

    // Redirect to our blocking page with the original URL and domain
    const blockPageUrl = chrome.runtime.getURL('block.html') +
      `?url=${encodeURIComponent(details.url)}&domain=${encodeURIComponent(domain)}&count=${visitCount}`;

    chrome.tabs.update(details.tabId, { url: blockPageUrl });

    // Update badge
    await updateBadge();
  } catch (error) {
    console.error('Error in navigation handler:', error);
  }
});

// Increment visit counter for a domain
async function incrementCounter(domain) {
  const data = await chrome.storage.local.get('counters');
  const counters = data.counters || {};
  const today = new Date().toISOString().split('T')[0];

  // Reset counters if it's a new day
  if (counters[domain]?.date !== today) {
    counters[domain] = { count: 0, date: today };
  }

  counters[domain].count++;
  await chrome.storage.local.set({ counters });
}

// Get today's counters (reset if new day)
async function getCounters() {
  const data = await chrome.storage.local.get('counters');
  const counters = data.counters || {};
  const today = new Date().toISOString().split('T')[0];

  // Check if we need to reset (new day)
  const needsReset = Object.values(counters).some(c => c.date !== today);

  if (needsReset) {
    // Reset all counters
    const resetCounters = {};
    Object.keys(counters).forEach(domain => {
      resetCounters[domain] = { count: 0, date: today };
    });
    await chrome.storage.local.set({ counters: resetCounters });
    return resetCounters;
  }

  return counters;
}

// Update badge with total visits today
async function updateBadge() {
  const counters = await getCounters();
  const total = Object.values(counters).reduce((sum, c) => sum + c.count, 0);

  if (total > 0) {
    chrome.action.setBadgeText({ text: total.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#FF6B6B' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

// Listen for messages from blocking page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'BLOCK_DECISION') {
    handleBlockDecision(sender.tab.id, message.allowed, message.originalUrl);
  } else if (message.type === 'UPDATE_BADGE') {
    updateBadge();
  } else if (message.type === 'LEAVING_BLOCK_PAGE') {
    // Tab is leaving the blocking page
    tabsOnBlockingPage.delete(sender.tab.id);
  }
  return true;
});

// Handle user's decision (Yes/No)
async function handleBlockDecision(tabId, allowed, originalUrl) {
  // Remove from blocking page tracking
  tabsOnBlockingPage.delete(tabId);

  if (allowed) {
    // User clicked "Yes, continue" - mark tab as allowed and navigate to original URL
    tabsOnBlockedSites.add(tabId);
    chrome.tabs.update(tabId, { url: originalUrl });
  } else {
    // User clicked "No, stay focused" - redirect to focus page
    const focusPageUrl = chrome.runtime.getURL('focus.html');
    chrome.tabs.update(tabId, { url: focusPageUrl });
  }
}

// Clean up tab tracking when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  tabsOnBlockedSites.delete(tabId);
  tabsOnBlockingPage.delete(tabId);
});

// Initialize badge on startup
chrome.runtime.onStartup.addListener(() => {
  updateBadge();
});

// Initialize badge when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  // Set default blocked domains
  chrome.storage.local.get(['blockedDomains', 'blockPrompts'], (data) => {
    const updates = {};

    if (!data.blockedDomains) {
      updates.blockedDomains = ['tiktok.com', 'twitter.com', 'reddit.com'];
    }

    if (!data.blockPrompts) {
      updates.blockPrompts = ['Hold on...', 'Bruh...', 'Girl...', 'Come on...', 'Hoss...'];
    }

    if (Object.keys(updates).length > 0) {
      chrome.storage.local.set(updates);
    }
  });

  updateBadge();
});
