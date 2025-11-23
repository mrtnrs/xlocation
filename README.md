# X Globe Location Extension

Browser extension that shows a small world map and location pin for X profiles and tweets, based on the accounts `account_based_in` / `account_country_code`.

## Install in Chrome (load unpacked)

1. Open the Chrome Extensions page:
   - Go to `chrome://extensions/` in the address bar.

2. Enable **Developer mode**:
   - Toggle the **Developer mode** switch in the top-right corner.

3. Load the extension folder:
   - Click **Load unpacked**.
   - In the folder picker, select:
     - `xlocation/x-globe-location` (the folder that contains `manifest.json`).
   - Click **Open**.

4. Verify its installed:
   - You should see **X Globe Location** in the list of extensions.
   - Make sure the toggle next to it is **On**.

5. Use it on X:
   - Open `https://x.com`.
   - Scroll your timeline or open a profile.
   - A small globe appears next to avatars/usernames.
   - Hover the globe to see the resolved location tooltip.

## Updating the extension after code changes

Whenever you change the code locally:

1. Go back to `chrome://extensions/`.
2. Find **X Globe Location**.
3. Click the **Reload** button (circular arrow) on the extension card.
4. Refresh any open X tabs.