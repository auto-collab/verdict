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
    chrome.tabs.sendMessage(
      currentTab.id,
      { action: "getReviewsFromPage", url: url },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error:", chrome.runtime.lastError.message);
          statusDiv.textContent = "Error";
          return;
        }
        console.log("popup.js received response:", response);
        if (response.summary && response.verdict) {
          statusDiv.textContent = "";
          verdictDiv.textContent = response.verdict;
          verdictSummaryDiv.textContent = response.summary;
        } else {
          statusDiv.textContent = response.summary;
        }
      }
    );
  });
});
