Verdict Chrome Extension

Verdict is a Chrome extension that detects rating systems on product pages and provides information about the detected ratings.
Features

Detects rating systems on product pages.
Displays the XPath of the detected rating system.
Provides a simple popup interface to show detection results.

Installation

Clone or download this repository to your local machine.
Open Chrome and navigate to chrome://extensions/.
Enable "Developer mode" using the toggle switch in the top right corner.
Click on the "Load unpacked" button and select the directory where you have downloaded this repository.
The extension should now appear in your list of extensions.

Usage

Navigate to a product page on any e-commerce site.
Click on the Verdict extension icon in the Chrome toolbar.
The popup will display whether a rating system was detected and show the XPath of the detected element.

Project Structure

manifest.json: The manifest file that defines the extension's configuration and permissions.
background.js: The background script that handles installation events and button clicks.
popup.html: The HTML file for the extension's popup interface.
popup.js: The JavaScript file that runs in the context of the popup, handling the detection logic.

How It Works

When the extension is installed, it logs a message to the console.
Clicking the extension icon triggers the popup.js script.
The popup.js script queries the active tab and injects a script to detect rating systems.
If a rating system is detected, the popup displays the XPath of the detected element.

Files

manifest.json: Configuration file for the extension.
background.js: Contains the logic for handling the extension's background tasks.
popup.html: The HTML structure for the popup displayed when the extension icon is clicked.
popup.js: Contains the logic to detect rating systems on product pages and update the popup.

License

This project is licensed under the MIT License. See the LICENSE file for details.
