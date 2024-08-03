class ReviewTruncate {
  static encode(text) {
    const encoder = new TextEncoder();
    return encoder.encode(text).length;
  }

  static truncateReviews(reviews, maxTokens) {
    let tokenCount = 0;
    let truncatedText = "";

    for (const review of reviews) {
      const reviewTokens = ReviewTruncate.encode(review);
      if (tokenCount + reviewTokens > maxTokens) {
        break;
      }
      truncatedText += review + "\n\n";
      tokenCount += reviewTokens;
    }

    return truncatedText;
  }
}

export default ReviewTruncate;
