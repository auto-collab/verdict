document.addEventListener("DOMContentLoaded", () => {
  const statusDiv = document.getElementById("status");

  // Check if the current tab URL is from Goodreads
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    const url = new URL(currentTab.url);
    if (url.hostname !== "www.goodreads.com") {
      statusDiv.textContent = "This extension only works on Goodreads.";
      return;
    }

    statusDiv.textContent = "Getting summary...";

    // Sending message to content script to detect and extract reviews
    chrome.tabs.sendMessage(currentTab.id, {
      action: "getReviewsFromPage",
      url: url,
    });

    // Sends messages to display to user in popup.html
    chrome.runtime.onMessage.addListener((request) => {
      console.log("popup.js received message:", request);
      if (request.action === "reviewsSummary") {
        if (request.summary) {
          statusDiv.textContent = ""; // Put 'The Verdict Is...READ/DO NOT READ' here
          const summaryDiv = document.createElement("div");
          summaryDiv.textContent = request.summary;
          statusDiv.appendChild(summaryDiv);
        } else {
          statusDiv.textContent = "Failed to summarize reviews.";
        }
      } else if (request.action === "noRatingSystemFound") {
        statusDiv.textContent = "No book rating system detected.";
      }
    });
  });
});
