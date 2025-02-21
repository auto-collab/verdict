import { callOpenAI } from '../openai/openaiHandler';
import { config } from '../config.js';
import { systemMessage, userMessage } from '../openai/promptTemplates';

// Mock the chrome object if it doesn’t exist (for handling chrome.runtime.lastError)
global.chrome = global.chrome || { runtime: {} };

// Set up and clean up mocks for each test
beforeEach(() => {
  global.chrome.runtime.lastError = null; // Reset lastError before each test
  jest.spyOn(console, 'error').mockImplementation(() => {}); // Mock console.error to avoid console output during testing
});

afterEach(() => {
  console.error.mockRestore(); // Restore console.error after each test
  global.fetch?.mockClear();   // Clear fetch mock after each test
});

describe('callOpenAI and Error Handling Tests', () => {
  // Test case for callOpenAI API function
  test('should successfully call OpenAI API and return response', async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            role: 'assistant',
            content: 'Test response',
          },
        },
      ],
    };

    // Mock the fetch function to return the mockResponse
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => mockResponse,
      })
    );

    const reviews = ['This product is amazing!', 'I love it!'];
    const data = await callOpenAI(reviews);

    // Validate that the response data matches the mock response
    expect(data).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      config.OPENAI_URI,
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [systemMessage, userMessage(reviews)],
          max_tokens: 1500,
        }),
      })
    );
  }); 

  // Test case for handling chrome.runtime.lastError
  test('should handle chrome.runtime.lastError if present', () => {
    // Set chrome.runtime.lastError to simulate an error
    global.chrome.runtime.lastError = { message: 'Some error occurred' };

    // Mock a DOM element to simulate updating the UI
    document.body.innerHTML = '<div id="statusDiv"></div>';
    const statusDiv = document.getElementById('statusDiv');

    // Define the callback function that handles chrome.runtime.lastError
    const sendMessageCallback = () => {
      if (chrome.runtime.lastError) {
        console.error('Error:', chrome.runtime.lastError.message);
        statusDiv.textContent = 'Error';
        return;
      }
      statusDiv.textContent = 'Success';
    };

    // Call the function to trigger the error handling code
    sendMessageCallback();

    // Assertions
    expect(statusDiv.textContent).toBe('Error'); // Check if the error message was set in the DOM
    expect(console.error).toHaveBeenCalledWith('Error:', 'Some error occurred'); // Check if console.error was called with the correct message
  });

  // Additional test case for when no error is present
  test('should set statusDiv to "Success" when no chrome.runtime.lastError is present', () => {
    document.body.innerHTML = '<div id="statusDiv"></div>';
    const statusDiv = document.getElementById('statusDiv');

    // Define the callback function without triggering any error
    const sendMessageCallback = () => {
      if (chrome.runtime.lastError) {
        console.error('Error:', chrome.runtime.lastError.message);
        statusDiv.textContent = 'Error';
        return;
      }
      statusDiv.textContent = 'Success';
    };

    // Call the function to verify the success path
    sendMessageCallback();

    // Assertions for success
    expect(statusDiv.textContent).toBe('Success');
    expect(console.error).not.toHaveBeenCalled(); // Ensure console.error was not called
  });
});
