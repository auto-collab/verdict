const apiKey = "sk-None-*****************";

chrome.runtime.onMessage.addListener((request) => {
  console.log("background.js received message:", request);

  if (request.action === "sendReviewsToOpenAI") {
    (async () => {
      const reviews = request.reviews;
      const bookId = request.bookId;

      // Check if the summary already exists
      const existingSummary = await getSummary(bookId);
      if (existingSummary) {
        chrome.runtime.sendMessage({
          action: "reviewsSummary",
          summary: existingSummary.summary,
        });
      } else {
        const maxInputTokens = 2596;
        console.log("All reviews:", reviews);
        const truncatedReviews = truncateReviews(reviews, maxInputTokens);
        console.log("Truncated reviews for API call:", truncatedReviews);

        // Call to OpenAI API
        try {
          const response = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                  {
                    role: "system",
                    content:
                      "You are a bibliophile who specializes in writing thorough, terse, and unbiased book reviews. You hand down your reviews of books as a verdict like a judge.",
                  },
                  {
                    role: "user",
                    content: `Return to me a 5 sentence summary of the reviews you received. After giving me the summary, end the statement with a verdict of READ or DO NOT READ:\n\n${truncatedReviews}`,
                  },
                ],
                max_tokens: 1500,
              }),
            }
          );

          // Handle API response
          const data = await response.json();
          console.log("API response:", data);

          if (data.choices && data.choices.length > 0) {
            const verdict = data.choices[0].message.content.trim();
            console.log(`Received summary from API for ${bookId}:`, verdict);
            chrome.runtime.sendMessage({
              action: "reviewsSummary",
              summary: verdict,
            });
            storeSummary(bookId, verdict);
          } else {
            console.error("No valid choices in response:", data);
            chrome.runtime.sendMessage({
              action: "reviewsSummary",
              summary: "No valid response received from the API.",
            });
          }
        } catch (error) {
          console.error("Error:", error);
          chrome.runtime.sendMessage({
            action: "reviewsSummary",
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
// Reviews editing util methods
// *********************************************

// Get length of text in tokens to control price per call
function encode(text) {
  const encoder = new TextEncoder();
  return encoder.encode(text).length;
}

// Trims the reviews going to api body
function truncateReviews(reviews, maxTokens) {
  let tokenCount = 0;
  let truncatedText = "";

  for (const review of reviews) {
    const reviewTokens = encode(review);
    if (tokenCount + reviewTokens > maxTokens) {
      break;
    }
    truncatedText += review + "\n\n";
    tokenCount += reviewTokens;
  }

  return truncatedText;
}

// *********************************************
// Reviews caching util methods
// *********************************************

function storeSummary(bookId, summary) {
  chrome.storage.local.set(
    { [bookId]: { summary, timestamp: Date.now() } },
    () => {
      if (chrome.runtime.lastError) {
        console.error("Error storing summary:", chrome.runtime.lastError);
      }
    }
  );
}

function getSummary(bookId) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([bookId], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[bookId]);
      }
    });
  });
}

// See what books are stored in local cache. Use service worker on chrome://extensions page
// chrome.storage.local.get(null, (items) => {
//   console.log("Stored items:", items);
// });
