chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('content.js received message:', request);
  if (request.action === 'getReviewsFromPage') {
    class ReviewExtractor {
      static extractReviews() {
        const reviewElements = document.querySelectorAll(
          '.ReviewCard .ReviewText__content .TruncatedContent__text',
        );
        const reviews = [];

        reviewElements.forEach((element) => {
          reviews.push(element.innerText.trim());
        });
        return reviews;
      }
    }

    // Logic to handle the extraction of the user reviews
    function extractBookIdFromUrl(url) {
      const segments = new URL(url).pathname.split('/');

      if (segments.length >= 4) {
        return segments[3];
      } else {
        return null;
      }
    }

    // Locators used to determine products reviews specifically
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

    // If a rating system is detected on product page, send reviews and bookId to background.js
    const ratingResult = detectRatingSystem();
    if (ratingResult.found) {
      try {
        const reviews = ReviewExtractor.extractReviews();
        const bookId = extractBookIdFromUrl(request.url);
        chrome.runtime.sendMessage(
          { action: 'sendReviewsToOpenAI', reviews, bookId },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error(
                'Error in content.js:',
                chrome.runtime.lastError.message,
              );
              sendResponse({
                summary: null,
                verdict: null,
              });
              return;
            }
            sendResponse(response);
          },
        );
      } catch (error) {
        console.error('Error extracting reviews:', error);
        sendResponse({ summary: 'Error extracting reviews', verdict: null });
      }
    } else {
      sendResponse({ summary: 'No review system detected.', verdict: null });
    }

    // Returning true to indicate response will be sent asynchronously
    return true;
  }
});
