# Testing Guide

## Fixed Issues

The extension has been rebuilt with a more reliable architecture:

### What Changed
- **Old approach**: Tried to inject content scripts into pages (failed due to CSP restrictions)
- **New approach**: Redirects to a local blocking page (`block.html`) that shows the prompt
- **Result**: Works reliably on ALL websites, no CSP issues

### Files Changed/Added
- ✅ `background.js` - Now uses redirect approach instead of script injection
- ✅ `block.html` - New blocking prompt page
- ✅ `block.js` - Logic for the blocking page
- ✅ `manifest.json` - Removed unnecessary `scripting` and `host_permissions`
- ❌ `content.js` - Removed (no longer needed)

## Testing Steps

### 1. Reload the Extension

**IMPORTANT**: You must reload the extension for changes to take effect!

1. Go to `chrome://extensions/`
2. Find "Focus Guard"
3. Click the reload button (circular arrow icon)
4. Check for any errors (click "Errors" button if shown)

### 2. Verify Blocked Sites

1. Click the extension icon → Options (or right-click → Options)
2. Verify you have blocked domains added (e.g., `reddit.com`, `twitter.com`)
3. Add a test site you can easily access (e.g., `example.com`)

### 3. Test Blocking Flow

#### Test 1: Navigate to Blocked Site
1. In the address bar, type `reddit.com` (or any blocked site) and press Enter
2. **Expected**: You should immediately see the blocking prompt page with:
   - Site favicon
   - Domain name
   - Visit count
   - Two buttons: "No, stay focused" and "Yes, continue"

#### Test 2: Click "Yes, continue"
1. Navigate to a blocked site
2. Click "✅ Yes, continue"
3. **Expected**: You should be taken to the actual site and can browse freely
4. Click links on the site - they should work without prompting again

#### Test 3: Click "No, stay focused"
1. Navigate to a blocked site
2. Click "❌ No, stay focused"
3. **Expected**: You should see the purple focus page with motivational quote

#### Test 4: Badge Counter
1. Navigate to a blocked site (triggers counter)
2. Look at the extension icon in the toolbar
3. **Expected**: You should see a red badge with a number (e.g., "1", "2", etc.)

#### Test 5: Statistics Tracking
1. Navigate to several blocked sites (can click "No" or "Yes")
2. Go to extension Options page
3. **Expected**: "Today's Focus Stats" should show accurate visit counts per site

### 4. Test Edge Cases

#### Internal Navigation (Should NOT Block)
1. Navigate to a blocked site and click "Yes, continue"
2. Now click links within that site to browse different pages
3. **Expected**: No blocking prompt appears for internal navigation

#### Multiple Tabs
1. Open multiple tabs to the same blocked site
2. **Expected**: Each tab shows the blocking prompt independently

#### Badge Count
1. Check the badge count matches total visits in Options page
2. **Expected**: Numbers should match

## Troubleshooting

### Issue: "Extension doesn't load"
- **Solution**: Make sure you generated icons first (`python generate_icons.py`)
- Check for errors in `chrome://extensions/`

### Issue: "Blocking prompt doesn't appear"
- **Solution**:
  1. Reload the extension (`chrome://extensions/` → reload button)
  2. Make sure the domain is in your blocked list
  3. Check browser console (F12) for errors
  4. Open background service worker console:
     - `chrome://extensions/` → Click "service worker" link under Focus Guard
     - Look for console.log messages like "Blocking navigation to: domain.com"

### Issue: "Can't navigate to any sites"
- **Solution**: Open Options and remove all blocked domains, or disable the extension temporarily

### Issue: "Badge not showing"
- **Solution**:
  1. Navigate to a blocked site to trigger counter
  2. Check Options page to verify counters are incrementing
  3. Reload the extension

### Issue: "Internal links still show prompt"
- **Solution**: This is fixed in the new version. Make sure you reloaded the extension.

## Debug Mode

To see detailed logging:

1. Go to `chrome://extensions/`
2. Find "Focus Guard"
3. Click "service worker" (under "Inspect views")
4. A console window opens - watch for messages like:
   - "Blocking navigation to: domain.com"
   - Any error messages

## Expected Console Messages

When navigating to a blocked site, you should see:
```
Blocking navigation to: reddit.com
```

When clicking "Yes, continue":
```
(Message sent to background script)
```

## Success Criteria

✅ Blocking prompt appears immediately when navigating to blocked site
✅ "Yes, continue" allows you to browse the site freely
✅ "No, stay focused" redirects to motivational focus page
✅ Badge counter updates correctly
✅ Internal navigation doesn't trigger prompt
✅ Statistics in Options page are accurate
✅ Multiple blocked sites all work correctly

## Still Having Issues?

If the extension still doesn't work after following these steps:

1. **Check the background service worker console** for error messages
2. **Verify manifest.json** has no errors (view raw file)
3. **Try a fresh install**:
   - Remove the extension completely
   - Close Chrome
   - Reopen and load unpacked again
4. **Test with a simple domain** like `example.com` to rule out site-specific issues

The new architecture should work on 100% of websites since we're not injecting scripts anymore!
