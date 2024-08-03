global.chrome = {
  tabs: {
    query: jest.fn((queryInfo, callback) => {
      callback([{ id: 1, url: "https://www.goodreads.com/book/show/123456" }]);
    }),
    sendMessage: jest.fn((tabId, message, callback) => {
      if (callback)
        callback({ summary: "Mock summary", verdict: "Mock verdict" });
    }),
  },
  runtime: {
    onMessage: {
      addListener: jest.fn(),
    },
    lastError: null,
  },
};
