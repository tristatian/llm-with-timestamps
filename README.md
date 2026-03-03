# Claude.ai Message Timestamps (Chrome Extension)

This Chrome extension automatically adds **local timestamps** to both **user** and **assistant** messages on `claude.ai`.  
Each message bubble displays a subtle "Sent at HH:MM" line beneath the message content.

---

## Features

- **Automatic timestamps** for user and assistant messages on `claude.ai`
- Uses **Manifest V3**
- Runs only on `https://claude.ai/*` (and subdomains)
- Timestamps are based on your **local browser time**
- Styles are subtle and non-intrusive

---

## File Overview

- `manifest.json` – Chrome extension manifest (Manifest V3)
- `contentScript.js` – Injected into `claude.ai` pages to observe and decorate messages with timestamps
- `icons/` – Placeholder for extension icons (you can replace with your own)

> Note: The content script attempts to use any `<time datetime="...">` element inside a message if Claude exposes one.  
> If none is available, it uses the time when the message bubble is first observed in the DOM as the sent time.

---

## How It Works

1. The content script runs on `claude.ai` pages.
2. It injects a small CSS block to style timestamps.
3. It scans for known message bubble elements and adds a timestamp line to each.
4. A `MutationObserver` watches for newly added messages and decorates them as they appear.

---

## Install Locally in Chrome (Development Mode)

1. **Clone or download** this folder onto your machine (e.g. `llm_with_timestamps`).
2. Ensure the folder contains at least:
   - `manifest.json`
   - `contentScript.js`
   - `icons/icon16.png`, `icons/icon48.png`, `icons/icon128.png` (you can create simple placeholder PNGs if needed).
3. Open Chrome and go to `chrome://extensions/`.
4. In the top-right corner, toggle **Developer mode** to **ON**.
5. Click **“Load unpacked”**.
6. Select the `llm_with_timestamps` folder.
7. Navigate to `https://claude.ai/` and open a chat.  
   You should see **“Sent at HH:MM”** under each message bubble.

If you update the code, press **“Reload”** on the extension’s card in `chrome://extensions/` to apply changes.

---

## Packaging and Publishing to the Chrome Web Store

These steps reflect the current Chrome Web Store process for Manifest V3 extensions.

### 1. Prepare Your Extension

1. Ensure your extension works as expected:
   - Test on `https://claude.ai/` chats.
   - Confirm timestamps appear for both user and assistant messages.
2. Verify `manifest.json` is valid:
   - `manifest_version` is `3`.
   - `name`, `description`, and `version` are set.
   - `content_scripts` correctly target `https://claude.ai/*`.
3. Add or refine:
   - Icons in `icons/` (16x16, 48x48, 128x128 PNG).
   - A short description (max 132 characters) in the manifest.

### 2. Create the ZIP Package

1. In your project folder (e.g. `llm_with_timestamps`), make sure the root contains:
   - `manifest.json`
   - `contentScript.js`
   - `icons/` (and any other required files)
2. Select all these files and folders and **zip them together**, ensuring `manifest.json` is at the **root of the ZIP**, not inside a nested folder.
3. Name it something like `claude-message-timestamps-v1.0.0.zip`.

### 3. Set Up a Developer Account

1. Go to the Chrome Web Store Developer Dashboard:  
   `https://chrome.google.com/webstore/devconsole`
2. Sign in with your Google account.
3. If you haven’t already, pay the **one-time developer registration fee** and complete the verification steps.

### 4. Create a New Item

1. In the Developer Dashboard, click **“Create item”** or **“Add new item”**.
2. Upload your extension ZIP (`claude-message-timestamps-v1.0.0.zip`).
3. Wait for the upload and basic validation to complete.

### 5. Fill In Listing Details

In the item’s details page, fill out the required tabs (exact names may vary slightly over time, but typically include):

- **Store listing**
  - Extension name (what users see in the store)
  - Short description (≤132 characters)
  - Detailed description
  - Screenshots of the extension on `claude.ai`
  - Optional promotional images and icons
- **Privacy**
  - Declare data usage (this extension does not send data off-device, so describe that clearly).
  - Confirm the single-purpose nature of the extension (adding timestamps to Claude messages).
- **Distribution**
  - Choose which countries the extension is available in.
  - Decide whether it is public, unlisted, or private.
- **Test instructions (if requested)**
  - Provide clear steps for reviewers, e.g.:
    - “Install the extension, open `https://claude.ai/`, start a chat, and verify timestamps under each message.”

### 6. Submit for Review

1. Once all required fields are complete and there are no validation errors, click **“Submit for review”**.
2. Google will review your extension for policy compliance and functionality.
3. If it passes review, it will either:
   - **Publish automatically** (if you selected that option), or
   - Be available for you to **publish manually** when you’re ready.

### 7. Updating the Extension Later

To publish an update:

1. Bump the `version` number in `manifest.json` (e.g. from `1.0.0` to `1.0.1`).
2. Rebuild the ZIP with the updated files.
3. In the Developer Dashboard, open your extension and upload the new ZIP.
4. Submit the new version for review.

---

## Customization Tips

- **Change timestamp text**  
  In `contentScript.js`, look for the line:
  ```js
  container.textContent = `Sent at ${timeText}`;
  ```
  You can change this to any format you like, e.g.:
  ```js
  container.textContent = timeText; // just show the time
  ```

- **Adjust styling**  
  In `contentScript.js`, find the `injectStyles()` function and tweak the CSS there (font size, color, alignment, etc.).

---

## Notes and Limitations

- Timestamps are based on **your local system time**, not Claude’s server time.
- Historical messages already present when you open a chat may not have accurate send times unless Claude exposes timestamp data in the DOM (via `<time datetime="...">`, etc.).
- Because Claude.ai’s internal DOM structure can change over time, you may need to adjust the selectors in `MESSAGE_SELECTORS` within `contentScript.js` if timestamps ever stop appearing.

