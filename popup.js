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
            statusDiv.textContent = `Product rating system detected. XPath: ${result.xpath}`;
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

  function getElementXPath(element) {
    if (element && element.id) {
      return `//*[@id="${element.id}"]`;
    }
    const paths = [];
    for (
      ;
      element && element.nodeType === Node.ELEMENT_NODE;
      element = element.parentNode
    ) {
      let index = 0;
      let sibling;
      for (
        sibling = element.previousSibling;
        sibling;
        sibling = sibling.previousSibling
      ) {
        if (sibling.nodeType === Node.DOCUMENT_TYPE_NODE) {
          continue;
        }
        if (sibling.nodeName === element.nodeName) {
          ++index;
        }
      }
      const tagName = element.nodeName.toLowerCase();
      const pathIndex = index ? `[${index + 1}]` : "";
      paths.splice(0, 0, `${tagName}${pathIndex}`);
    }
    return paths.length ? `/${paths.join("/")}` : null;
  }

  for (const selector of possibleRatingSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      return { found: true, xpath: getElementXPath(element) };
    }
  }
  return { found: false };
}

// commit
