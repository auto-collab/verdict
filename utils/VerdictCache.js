class VerdictCache {
  static storeSummary(bookId, summary, verdict) {
    chrome.storage.local.set(
      {
        [bookId]: { summary: summary, verdict: verdict, timestamp: Date.now() },
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error("Error storing summary:", chrome.runtime.lastError);
        }
      }
    );
  }

  static getSummary(bookId) {
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
}

export default VerdictCache;
