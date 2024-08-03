import { callOpenAI } from "./openai/openaiHandler.js";
import ReviewTruncate from "./utils/ReviewTruncate.js";
import VerdictCache from "./utils/VerdictCache.js";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("background.js received message:", request);

  if (request.action === "sendReviewsToOpenAI") {
    (async () => {
      const reviews = request.reviews;
      const bookId = request.bookId;
      console.log(`All reviews: ${request.reviews}`);
      // Check if the summary already exists
      const existingSummary = await VerdictCache.getSummary(bookId);
      if (existingSummary) {
        console.log(`Existing summary for ${bookId} found in cache`);
        sendResponse({
          summary: existingSummary.summary,
          verdict: existingSummary.verdict,
        });
      } else {
        const maxInputTokens = 2596;
        const truncatedReviews = ReviewTruncate.truncateReviews(
          reviews,
          maxInputTokens
        );
        console.log("Truncated reviews for API call:", truncatedReviews);

        // Call to OpenAI API
        try {
          const data = await callOpenAI(truncatedReviews);

          if (data.choices && data.choices.length > 0) {
            let verdictAndSummary = parseResponse(
              data.choices[0].message.content
            );
            let verdict = verdictAndSummary.verdict;
            let summary = verdictAndSummary.summary;
            sendResponse({
              verdict: verdict,
              summary: summary,
            });
            VerdictCache.storeSummary(bookId, summary, verdict);
          } else {
            console.error("No valid choices in response:", data);
            sendResponse({
              summary: "No valid response received from the API.",
            });
          }
        } catch (error) {
          console.error("Error:", error);
          sendResponse({
            summary: "An error occurred while summarizing the reviews.",
          });
        }
      }
    })();

    // Returning true to indicate response will be sent asynchronously
    return true;
  }
});

// *********************************************
// Parse response for verdict and summary
// *********************************************

function parseResponse(text) {
  const verdictRegex = /\*VERDICT: ([^\*]*)\*([\s\S]*)/;
  const match = text.match(verdictRegex);
  if (match) {
    const verdict = match[1].trim();
    const summary = match[2].trim();
    return { verdict, summary };
  } else {
    console.log("No verdict or summary found");
    return null;
  }
}
