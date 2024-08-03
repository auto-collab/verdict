import { config } from "./config.js";

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
          action: "displayVerdictAndSummary",
          summary: existingSummary.summary,
          verdict: existingSummary.verdict,
        });
      } else {
        const maxInputTokens = 2596;
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
                Authorization: `Bearer ${config.openai_key}`,
              },
              body: JSON.stringify({
                model: "gpt-3.5-turbo",

                // TODO: move content messages to separate classs
                messages: [
                  {
                    role: "system",
                    content:
                      "You are book judge who summarizes user book reviews.",
                  },
                  {
                    role: "user",
                    content: `Return a five sentence summary using 10 words per sentence of the following book reviews. Give a final verdict of READ or DO NOT READ. Format your response with the verdict coming first, like this *VERDICT: READ*, and then summary.:\n\n${truncatedReviews}`,
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
            let verdictAndSummary = parseResponse(
              data.choices[0].message.content
            );
            let verdict = verdictAndSummary.verdict;
            let summary = verdictAndSummary.summary;
            chrome.runtime.sendMessage({
              action: "displayVerdictAndSummary",
              verdict: verdict,
              summary: summary,
            });
            storeSummary(bookId, summary, verdict);
          } else {
            console.error("No valid choices in response:", data);
            chrome.runtime.sendMessage({
              action: "displayVerdictAndSummary",
              summary: "No valid response received from the API.",
            });
          }
        } catch (error) {
          console.error("Error:", error);
          chrome.runtime.sendMessage({
            action: "displayVerdictAndSummary",
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

function storeSummary(bookId, summary, verdict) {
  chrome.storage.local.set(
    { [bookId]: { summary: summary, verdict: verdict, timestamp: Date.now() } },
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

// See what books are stored in local cache. Use service worker on chrome://extensions page
// chrome.storage.local.get(null, (items) => {
//   console.log("Stored items:", items);
// });
