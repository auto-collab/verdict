<p align="center">
  <img src="assets\gavel_circular.png" alt="Verdict Chrome Extension" width="15%">
</p>

# **Verdict**

Chrome exstension that summarizes users reviews of a given book on [Goodreads](https://www.goodreads.com). The application will collect all reviews and send them to ChatGPT to summarize and return a verdict of **Read** or **Do Not Read**.

## **Browser Installation**

1. Open **Chrome** and navigate to `chrome://extensions/`.
1. Enable **"Developer mode"** using the toggle switch in the top right corner.
1. Click on the **"Load unpacked"** button and select the directory where you have downloaded this repository.
1. The extension should now appear in your list of extensions.

## Local Installation and Running Tests

#### Prerequisites

Node.js (v14 or higher)
npm (v6 or higher)

1. **Clone or download this repository** to your local machine.
1. Open project folder in **VS Code**.
1. Open `config.js` file and set your `OPENAI_API_KEY`. See [OpenAI API documentation](https://platform.openai.com/docs/api-reference/api-keys).
1. Install packages:
   ```
   npm install
   ```
1. Run tests (with coverage):
   ```
   npm run test
   ```
1. Check formatting:
   ```
   npm run format:check
   ```

### **Notes**

Previous Verdicts will be stored in browser cache to reduce calls to OpenAI.

Check what verdicts are you in browser cache by running the following code in the extension service worker console:

```
chrome.storage.local.get(null, (items) => {
   console.log("Stored items:", items);
 });
```

## **License**

This project is licensed under the MIT License. See the LICENSE file for details.
