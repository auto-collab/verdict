document.addEventListener("DOMContentLoaded", () => {
  const statusDiv = document.getElementById("status");

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        function: detectRatingSystem,
      },
      (results) => {
        if (chrome.runtime.lastError || !results || !results[0]) {
          statusDiv.textContent = "No rating system detected.";
        } else {
          const result = results[0].result;
          if (result.found) {
            statusDiv.textContent = `Product rating system detected. Element Location: $('${result.selector}')`;
          } else {
            statusDiv.textContent = "No product rating system detected.";
          }
        }
      }
    );
  });
});

function detectRatingSystem() {
  const possibleRatingSelectors = [
    '[class*="rating"][class*="star"]',
    '[class*="rating"][class*="review"]',
    '[class*="stars"][class*="review"]',
    '[id*="rating"][id*="star"]',
    '[id*="rating"][id*="review"]',
    '[id*="stars"][id*="review"]',
    '[aria-label*="rating"][aria-label*="star"]',
    '[aria-label*="rating"][aria-label*="review"]',
    '[aria-label*="stars"][aria-label*="review"]',
  ];

  for (const selector of possibleRatingSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      return { found: true, selector: selector };
    }
  }
  return { found: false };
}
