class ResponseHandler {
  static parseResponse(text) {
    const verdictRegex = /\*VERDICT: ([^\*]*)\*([\s\S]*)/;
    const match = text.match(verdictRegex);
    if (match) {
      const verdict = match[1].trim();
      const summary = match[2].trim();
      return { verdict, summary };
    } else {
      console.log('No verdict or summary found');
      return null;
    }
  }
}

export default ResponseHandler;
