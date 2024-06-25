document.addEventListener("DOMContentLoaded", () => {
  const statusDiv = document.getElementById("status");

  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    if (!checkIfUrlIsGoodreads(tabs[0])) {
      statusDiv.textContent = "This extension only works on Goodreads.";
      return;
    }

    try {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          function: detectRatingSystemAndExtractReviews,
        },
        async (results) => {
          if (chrome.runtime.lastError || !results || !results[0]) {
            statusDiv.textContent = "No rating system detected.";
            console.error(
              "Error or no results:",
              chrome.runtime.lastError,
              results
            );
          } else {
            const result = results[0].result;
            if (result && result.found) {
              statusDiv.textContent = "Book reviews:";
              // Code that creates the html elements of each review to show in popup
              const reviewList = document.createElement("ul");
              result.reviews.forEach((rev) => {
                const listItem = document.createElement("li");
                listItem.textContent = rev;
                reviewList.appendChild(listItem);
              });
              statusDiv.appendChild(reviewList);
            } else {
              statusDiv.textContent = "No product rating system detected.";
            }
          }
        }
      );
    } catch (error) {
      statusDiv.textContent = "An error occurred.";
      console.error("Error in execution:", error);
    }
  });
});

async function detectRatingSystemAndExtractReviews() {
  class ReviewExtractor {
    static async extractReviews() {
      const reviewElements = document.querySelectorAll(
        ".ReviewCard .ReviewText__content .TruncatedContent__text"
      );
      const reviews = [];

      reviewElements.forEach((element) => {
        reviews.push(element.innerText.trim());
      });

      return reviews;
    }
  }

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

  // Extracts reviews if a rating system is present on page.
  const ratingResult = detectRatingSystem();
  if (ratingResult.found) {
    try {
      const reviews = await ReviewExtractor.extractReviews();

      reviews.forEach((review) => {
        console.log(review);
      });

      return { ...ratingResult, reviews: reviews };
    } catch (error) {
      console.error("Error extracting reviews:", error);
      return { ...ratingResult, reviews: [] };
    }
  }
  return { found: false };
}

const checkIfUrlIsGoodreads = (tab) => {
  const url = new URL(tab.url);
  return url.hostname === "www.goodreads.com";
};
