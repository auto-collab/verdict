const apiKey = "sk-None-*****************";

chrome.runtime.onMessage.addListener((request) => {
  console.log("background.js received message:", request);

  if (request.action === "sendReviewsToOpenAI") {
    // (async () => {
    //   const reviews = request.reviews;
    //   const bookId = request.bookId;

    //   // Check if the summary already exists
    //   const existingSummary = await getSummary(bookId);
    //   if (existingSummary) {
    //     chrome.runtime.sendMessage({
    //       action: "displayVerdictAndSummary",
    //       summary: existingSummary.summary,
    //       verdict: existingSummary.verdict,
    //     });
    //   } else {
    //     const maxInputTokens = 2596;
    //     const truncatedReviews = truncateReviews(reviews, maxInputTokens);
    //     console.log("Truncated reviews for API call:", truncatedReviews);

    //     // Call to OpenAI API
    //     try {
    //       const response = await fetch(
    //         "https://api.openai.com/v1/chat/completions",
    //         {
    //           method: "POST",
    //           headers: {
    //             "Content-Type": "application/json",
    //             Authorization: `Bearer ${apiKey}`,
    //           },
    //           body: JSON.stringify({
    //             model: "gpt-3.5-turbo",

    //             // TODO: move content messages to separate classs
    //             messages: [
    //               {
    //                 role: "system",
    //                 content:
    //                   "You are a methodical researcher who reads every comment and then provides a verdict that represents the average opinion of the comments you have read.",
    //               },
    //               {
    //                 role: "user",
    //                 content: `Return a five sentence abstract on only the reviews using 10 words per each sentence based on the average opinion from the list of comments you have read.  Give a final verdict of READ or DO NOT READ. Format your response with the verdict coming first, a line of ### next, and then the short summary.:\n\n${truncatedReviews}`,
    //               },
    //             ],
    //             max_tokens: 1500,
    //           }),
    //         }
    //       );

    //       // Handle API response
    //       const data = await response.json();
    //       console.log("API response:", data);

    //       if (data.choices && data.choices.length > 0) {
    //         let verdict,
    //           summary = parseResponse(data.choices[0].message.content);
    //         chrome.runtime.sendMessage({
    //           action: "displayVerdictAndSummary",
    //           verdict: verdict,
    //           summary: summary,
    //         });
    //         storeSummary(bookId, verdict);
    //       } else {
    //         console.error("No valid choices in response:", data);
    //         chrome.runtime.sendMessage({
    //           action: "displayVerdictAndSummary",
    //           summary: "No valid response received from the API.",
    //         });
    //       }
    //     } catch (error) {
    //       console.error("Error:", error);
    //       chrome.runtime.sendMessage({
    //         action: "displayVerdictAndSummary",
    //         summary: "An error occurred while summarizing the reviews.",
    //       });
    //     }
    //   }
    // })();

    let text = `*VERDICT: READ*

The book is polarizing and tedious for many readers. Booker Prize winners often disappoint, evoking depression. The plot and writing style, particularly in "Life of Pi," can be overwrought. The narrative's religious undertones and lengthy descriptions deter engagement. Ultimately, the story's philosophical aspects and animal allegories fail to captivate universally.`;

    let verdictAndSummary = parseResponse(text);
    chrome.runtime.sendMessage({
      action: "displayVerdictAndSummary",
      verdict: verdictAndSummary.verdict,
      summary: verdictAndSummary.summary,
    });

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
    { [bookId]: { summary, verdict, timestamp: Date.now() } },
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
