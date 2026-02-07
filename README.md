# Focus Guard 🎯

A Chrome extension that interrupts navigation to distracting websites with an intentional prompt, helping you stay focused on what matters.

## Features

- 🚫 **Intentional Blocking**: Shows a prompt before visiting blocked sites
- 📊 **Usage Tracking**: Counts daily visits to blocked sites
- 🎯 **Custom Focus Page**: Motivational landing page when you choose to stay focused
- ⚙️ **Easy Management**: Simple options page to add/remove blocked domains
- 🔢 **Badge Counter**: Shows total blocks today on the extension icon
- 🌙 **Daily Reset**: Counters automatically reset at midnight
- 🔄 **Smart Navigation**: Only blocks initial entry, not internal navigation

## Installation

### Method 1: Load Unpacked (Development)

1. **Clone or download this repository**

2. **Create extension icons** (required before loading):
   - Create an `icons` folder in the extension directory
   - Add three PNG files: `icon16.png`, `icon48.png`, and `icon128.png`
   - You can use any icon generator or create simple icons
   - Quick option: Use an online tool like [Icon Generator](https://www.favicon-generator.org/)

3. **Open Chrome Extensions page**:
   - Navigate to `chrome://extensions/`
   - Or: Menu → More Tools → Extensions

4. **Enable Developer Mode**:
   - Toggle the "Developer mode" switch in the top-right corner

5. **Load the extension**:
   - Click "Load unpacked"
   - Select the `chrome-ext-blocker` folder
   - The extension should now appear in your extensions list

6. **Pin the extension** (optional):
   - Click the puzzle piece icon in Chrome toolbar
   - Find "Focus Guard" and click the pin icon

### Method 2: Pack and Install (Production-like)

1. After loading unpacked, click "Pack extension"
2. Select the extension directory
3. This creates a `.crx` file you can share
4. Drag the `.crx` file onto `chrome://extensions/` to install

## Usage

### Initial Setup

1. Click the extension icon or go to `chrome://extensions/` and click "Details" → "Extension options"
2. Add domains you want to block (e.g., `tiktok.com`, `reddit.com`, `twitter.com`)
3. That's it! The extension is now active

### When You Visit a Blocked Site

1. You'll see a blocking modal overlay immediately
2. The modal shows:
   - Site name and favicon
   - How many times you've visited today
   - Two choices: "Yes, continue" or "No, stay focused"
3. Click **"Yes, continue"** to proceed to the site (you can browse freely once allowed)
4. Click **"No, stay focused"** to be redirected to a motivational focus page

### Managing Blocked Sites

- Click the extension icon → "Manage Blocked Sites"
- Or right-click the extension icon → "Options"
- Add new domains or remove existing ones
- View daily statistics

### Viewing Stats

- The extension badge shows total blocks today
- Options page shows detailed per-site statistics
- All counters reset at midnight automatically

## File Structure

```
chrome-ext-blocker/
├── manifest.json          # Extension configuration
├── background.js          # Service worker (navigation listener, storage)
├── block.html             # Blocking prompt page
├── block.js               # Blocking page logic
├── focus.html             # Custom focus page
├── focus.js               # Focus page logic
├── options.html           # Settings page UI
├── options.js             # Settings page logic
├── icons/                 # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md              # This file
```

## Technical Details

### Manifest V3 Compatibility
- Uses service workers instead of background pages
- Declarative permissions model
- Modern Chrome API usage

### Permissions Explained
- `storage`: Save blocked domains and visit counters
- `webNavigation`: Detect when user navigates to blocked sites
- `tabs`: Redirect to blocking/focus pages when needed

### Storage Schema

```javascript
{
  blockedDomains: ["tiktok.com", "reddit.com"],
  counters: {
    "tiktok.com": { count: 5, date: "2026-02-06" },
    "reddit.com": { count: 3, date: "2026-02-06" }
  }
}
```

### How It Works

1. **Navigation Detection**: `webNavigation.onBeforeNavigate` listener fires when user navigates
2. **Domain Check**: Background script checks if destination is in blocked list
3. **Internal Nav Check**: Tracks tabs to allow internal navigation without prompting
4. **Redirect to Block Page**: Navigates to `block.html` with original URL in parameters
5. **Block Page Display**: Shows prompt with site info, favicon, and visit count
6. **Decision Handling**: User clicks button, message sent to background script
7. **Action**: Either navigate to original URL (allow) or redirect to focus page
8. **Counter Update**: Visit count incremented and badge updated

## Customization

### Changing the Focus Page

Edit `focus.html` and `focus.js` to customize:
- Background gradient colors
- Motivational quotes
- Call-to-action buttons
- Add your own task list or links

### Styling the Block Modal

Edit the styles in `content.js` (look for the `<style>` tag):
- Colors and fonts
- Animation timing
- Button styles
- Layout

### Default Blocked Sites

Edit `background.js` line 102 to change default sites:
```javascript
blockedDomains: ['tiktok.com', 'twitter.com', 'reddit.com']
```

## Troubleshooting

### Extension not working
- Make sure Developer Mode is enabled
- Check that all files are in the correct directory
- Look for errors in `chrome://extensions/` (click "Errors" button)

### Modal not appearing
- Check browser console (F12) for errors
- Ensure the site is in your blocked list
- Try disabling other extensions that might conflict

### Badge not updating
- The badge shows today's total visits to blocked sites
- Counters reset at midnight
- Click the extension icon to manually refresh

### Icons not showing
- Make sure the `icons` folder exists
- Verify all three PNG files are present (16px, 48px, 128px)
- Reload the extension after adding icons

## Privacy

- All data is stored locally in Chrome's storage
- No data is sent to external servers
- No analytics or tracking
- Open source - inspect the code yourself

## Contributing

Feel free to submit issues or pull requests to improve Focus Guard!

## License

MIT License - feel free to modify and distribute

---

**Made with ❤️ to help you stay focused in a distracting world**
