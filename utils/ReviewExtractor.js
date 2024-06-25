export class ReviewExtractor {
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
