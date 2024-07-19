# **Verdict Chrome Extension**

<div style="text-align: center;">
  <img src="assets\gavel_circular.png" alt="Verdict Chrome Extension" width="20%">
</div>

**Verdict** is an exciting Chrome extension that enhances your browsing experience by detecting rating systems on product pages and providing valuable information about the detected ratings. Additionally, it leverages the power of ChatGPT and AI to aggregate reviews on a book page and deliver a concise summary with a final verdict of **Read** or **Do Not Read**.

## **Features**

- **Detects rating systems on product pages.**
- **Displays the XPath of the detected rating system.**
- **Provides a simple popup interface to show detection results.**
- **Aggregates reviews on a book page and delivers a short summary with a final verdict of _Read_ or _Do Not Read_ using AI.**

## **Installation**

1. **Clone or download this repository** to your local machine.
2. **Open Chrome** and navigate to `chrome://extensions/`.
3. Enable **"Developer mode"** using the toggle switch in the top right corner.
4. Click on the **"Load unpacked"** button and select the directory where you have downloaded this repository.
5. The extension should now appear in your list of extensions.

## **Usage**

1. **Navigate to a product page** on any e-commerce site.
2. Click on the **Verdict extension icon** in the Chrome toolbar.
3. The popup will display whether a rating system was detected and show the XPath of the detected element.

## **How It Works**

1. When the extension is installed, it logs a message to the console.
2. Clicking the extension icon triggers the `popup.js` script.
3. The `popup.js` script queries the active tab and injects a script to detect rating systems.
4. If a rating system is detected, the popup displays the XPath of the detected element.
5. The extension uses ChatGPT and AI to analyze and summarize reviews, delivering a final verdict of **Read** or **Do Not Read**.

## **Project Structure**

- **manifest.json**: The manifest file that defines the extension's configuration and permissions.
- **background.js**: The background script that handles installation events and button clicks.
- **popup.html**: The HTML file for the extension's popup interface.
- **popup.js**: The JavaScript file that runs in the context of the popup, handling the detection logic.

## **Files**

- **manifest.json**: Configuration file for the extension.
- **background.js**: Contains the logic for handling the extension's background tasks.
- **popup.html**: The HTML structure for the popup displayed when the extension icon is clicked.
- **popup.js**: Contains the logic to detect rating systems on product pages and update the popup.

## **License**

This project is licensed under the MIT License. See the LICENSE file for details.
