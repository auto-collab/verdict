require('__mocks__/chrome.js');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(
  path.resolve(__dirname, '../popup/popup.html'),
  'utf8',
);

describe('popup.js', function () {
  let statusDiv;
  let verdictDiv;
  let verdictSummaryDiv;

  beforeEach(function () {
    jest.resetModules();

    document.body.innerHTML = html;
    document.dispatchEvent(new Event('DOMContentLoaded'));

    statusDiv = document.getElementById('status');
    verdictDiv = document.getElementById('verdict');
    verdictSummaryDiv = document.getElementById('verdict-summary');

    jest.clearAllMocks();

    require('../popup/popup');

    document.dispatchEvent(new Event('DOMContentLoaded'));
  });

  it('should display a message if the URL is not Goodreads', function (done) {
    setTimeout(() => {
      try {
        const tabsQueryCallback = chrome.tabs.query.mock.calls[0][1];
        tabsQueryCallback([{ url: 'https://www.example.com' }]);

        expect(statusDiv.textContent).toBe(
          'This extension only works on Goodreads.',
        );
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('should send a message to the content script if the URL is Goodreads', function (done) {
    setTimeout(() => {
      try {
        const tabsQueryCallback = chrome.tabs.query.mock.calls[0][1];
        tabsQueryCallback([
          { id: 1, url: 'https://www.goodreads.com/book/show/123456' },
        ]);

        expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
          expect.any(Number),
          {
            action: 'getReviewsFromPage',
            url: new URL('https://www.goodreads.com/book/show/123456'),
          },
          expect.any(Function),
        );
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('should handle the response from the content script', function (done) {
    setTimeout(() => {
      try {
        const tabsQueryCallback = chrome.tabs.query.mock.calls[0][1];
        tabsQueryCallback([
          { url: 'https://www.goodreads.com/book/show/123456' },
        ]);

        const sendMessageCallback = chrome.tabs.sendMessage.mock.calls[0][2];
        sendMessageCallback({ summary: 'Good book', verdict: 'Positive' });

        expect(statusDiv.textContent).toBe('');
        expect(verdictDiv.textContent).toBe('Positive');
        expect(verdictSummaryDiv.textContent).toBe('Good book');
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('should display an error message if there is a runtime error', function (done) {
    setTimeout(() => {
      try {
        const tabsQueryCallback = chrome.tabs.query.mock.calls[0][1];
        tabsQueryCallback([
          { url: 'https://www.goodreads.com/book/show/123456' },
        ]);

        chrome.runtime.lastError = { message: 'An error occurred' };
        const sendMessageCallback = chrome.tabs.sendMessage.mock.calls[0][2];
        sendMessageCallback(null);

        expect(statusDiv.textContent).toBe('Error');
        done();
      } catch (error) {
        done(error);
      }
    });
  });
});
