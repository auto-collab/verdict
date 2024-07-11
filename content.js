chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("content.js received message:", request);
  if (request.action === "getReviews") {
    class ReviewExtractor {
      static extractReviews() {
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

    const ratingResult = detectRatingSystem();
    if (ratingResult.found) {
      try {
        const reviews = ReviewExtractor.extractReviews();
        chrome.runtime.sendMessage({ action: "sendReviews", reviews });
      } catch (error) {
        console.error("Error extracting reviews:", error);
      }
    } else {
      console.log("No rating system found.");
      chrome.runtime.sendMessage({ action: "noRatingSystemFound" });
    }
  }
});
