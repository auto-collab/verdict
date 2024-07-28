<p align="center">
  <img src="assets\gavel_circular.png" alt="Verdict Chrome Extension" width="15%">
</p>

# **Verdict**

Chrome exstension that summarizes users reviews of a given book on [Goodreads](https://www.goodreads.com). The application will collect all reviews and send them to ChatGPT to summarize and return a verdict of **Read** or **Do Not Read**.

## **Installation**

1. **Clone or download this repository** to your local machine.
1. Open project folder in **VS Code**.
1. Set your `OPENAI_API_KEY` in the `env.config` file. See [OpenAI API documentation](https://platform.openai.com/docs/api-reference/api-keys) for how to generate a key.
1. Open **Chrome** and navigate to `chrome://extensions/`.
1. Enable **"Developer mode"** using the toggle switch in the top right corner.
1. Click on the **"Load unpacked"** button and select the directory where you have downloaded this repository.
1. The extension should now appear in your list of extensions.

## **Usage**

1. Navigate to any book page on [Goodreads](https://www.goodreads.com).
1. Click on the **Verdict extension icon** in the Chrome toolbar.

### Notes

Previous Verdicts will be stored in browser cache to reduce calls to OpenAI.

## **License**

This project is licensed under the MIT License. See the LICENSE file for details.
