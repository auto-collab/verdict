function encode(text) {
  const encoder = new TextEncoder();
  return encoder.encode(text).length;
}

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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("background.js received message:", request);
  if (request.action === "sendReviews") {
    (async () => {
      const reviews = request.reviews;
      console.log("Processing reviews:", reviews);
      const maxInputTokens = 2596;
      if (reviews.length > 0) {
        const truncatedReviews = truncateReviews(reviews, maxInputTokens);
        console.log("Truncated reviews for API call:", truncatedReviews);

        try {
          const response = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer `,
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

          const data = await response.json();
          console.log("API response:", data); // Logging the API response

          if (data.choices && data.choices.length > 0) {
            console.log(
              "Received summary from API:",
              data.choices[0].message.content.trim()
            );
            chrome.runtime.sendMessage({
              action: "reviewsSummary",
              summary: data.choices[0].message.content.trim(),
            });
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
