export const systemMessage = {
  role: 'system',
  content: 'You are a book judge who summarizes user book reviews.',
};

export const userMessage = (truncatedReviews) => ({
  role: 'user',
  content: `Return a five sentence summary using 10 words per sentence of the following book reviews. Speak from the first person and have a stern tone. Give a final verdict of READ or DO NOT READ. Format your response with the verdict coming first, like this *VERDICT: READ*, and then summary.:\n\n${truncatedReviews}`,
});
