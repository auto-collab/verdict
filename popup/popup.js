document.addEventListener("DOMContentLoaded", () => {
  const statusDiv = document.getElementById("status");
  const verdictDiv = document.getElementById("verdict");
  const verdictSummaryDiv = document.getElementById("verdict-summary");

  // Check if the current tab URL is from Goodreads
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    const url = new URL(currentTab.url);
    if (url.hostname !== "www.goodreads.com") {
      statusDiv.textContent = "This extension only works on Goodreads.";
      return;
    }

    // Sending message to content script to detect and extract reviews
    chrome.tabs.sendMessage(currentTab.id, {
      action: "getReviewsFromPage",
      url: url,
    });

    // Sends messages to display to user in popup.html
    chrome.runtime.onMessage.addListener((request) => {
      console.log("popup.js received message:", request);
      if (request.action === "displayVerdictAndSummary") {
        if (request.summary && request.verdict) {
          statusDiv.textContent = "";
          verdictDiv.textContent = request.verdict;
          verdictSummaryDiv.textContent = request.summary;
        } else {
          statusDiv.textContent = "Failed to summarize reviews.";
        }
      } else if (request.action === "noRatingSystemFound") {
        statusDiv.textContent = "No book rating system detected.";
      }
    });
  });
});
